import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect, useCallback } from "react";
import { allLessons } from "content-collections";
import { parseQuestions } from "@/lib/parseQuestions";

import {
  loadProgressStates,
  saveProgressStates,
  loadQuestionStates,
  saveQuestionStates,
  getQuestionKey,
  initializeProgress,
} from "@/lib/progressStorage";
import { LessonProgressState, LessonQuestionState } from "@/types/lesson";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { QuestionItem } from "@/components/QuestionItem";
import { LessonContent } from "@/components/LessonContent";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SECTION_LABELS: Record<string, string> = {
  whyItMatters: "Why It Matters",
  theory: "Theory",
  practice: "Practice",
  selfCheck: "Self-Check",
  additionalInfo: "Additional Information",
};

const SECTION_ICONS: Record<string, string> = {
  whyItMatters: "💡",
  theory: "📖",
  practice: "🛠",
  selfCheck: "✅",
  additionalInfo: "📌",
};

export default function LessonPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const sortedLessons = useMemo(
    () => [...allLessons].sort((a, b) => a.order - b.order),
    []
  );

  const lessonSlugs = useMemo(() => sortedLessons.map((l) => l.slug), [sortedLessons]);

  const [progressStates, setProgressStates] = useState<Record<string, LessonProgressState>>(() =>
    initializeProgress(lessonSlugs, loadProgressStates())
  );

  const [questionStates, setQuestionStates] = useState<Record<string, LessonQuestionState>>(
    () => loadQuestionStates()
  );

  const [accordionValue, setAccordionValue] = useState<string>("whyItMatters");

  useEffect(() => {
    saveProgressStates(progressStates);
  }, [progressStates]);

  useEffect(() => {
    saveQuestionStates(questionStates);
  }, [questionStates]);

  const lesson = useMemo(
    () => sortedLessons.find((l) => l.slug === slug),
    [sortedLessons, slug]
  );

  const currentProgress = slug ? progressStates[slug] : undefined;

  useEffect(() => {
    if (!lesson || (currentProgress && currentProgress.status === "locked")) {
      const firstAvailable = sortedLessons.find(
        (l) => progressStates[l.slug]?.status === "available" || progressStates[l.slug]?.status === "completed"
      );
      if (firstAvailable) {
        navigate(`/lesson/${firstAvailable.slug}`, { replace: true });
      }
    }
  }, [lesson, currentProgress, sortedLessons, progressStates, navigate]);

  useEffect(() => {
    setAccordionValue("whyItMatters");
  }, [slug]);

  const parsedQuestions = useMemo(
    () => (lesson ? parseQuestions(lesson.questions) : []),
    [lesson]
  );

  const isCompleted = currentProgress?.status === "completed";
  const isReadOnly = isCompleted;

  const currentIndex = sortedLessons.findIndex((l) => l.slug === slug);
  const isLastLesson = currentIndex === sortedLessons.length - 1;
  const nextLesson = isLastLesson ? null : sortedLessons[currentIndex + 1];

  const allCorrect = useMemo(() => {
    if (!slug || parsedQuestions.length === 0) return false;
    return parsedQuestions.every((q) => {
      const key = getQuestionKey(slug, q.questionIndex);
      return questionStates[key]?.isCorrect === true;
    });
  }, [slug, parsedQuestions, questionStates]);

  useEffect(() => {
    if (allCorrect && slug && currentProgress?.status === "available") {
      setProgressStates((prev) => {
        const updated = { ...prev };
        updated[slug] = {
          ...updated[slug],
          status: "completed",
          allQuestionsCorrect: true,
          completedAt: new Date().toISOString(),
        };
        if (nextLesson && updated[nextLesson.slug]?.status === "locked") {
          updated[nextLesson.slug] = {
            ...updated[nextLesson.slug],
            status: "available",
          };
        }
        return updated;
      });
    }
  }, [allCorrect, slug, currentProgress?.status, nextLesson]);

  const handleAnswer = useCallback(
    (questionIndex: number, answerIndex: number) => {
      if (!slug) return;
      const key = getQuestionKey(slug, questionIndex);
      const question = parsedQuestions.find((q) => q.questionIndex === questionIndex);
      if (!question) return;

      const isCorrect = answerIndex === question.correctAnswerIndex;

      setQuestionStates((prev) => ({
        ...prev,
        [key]: {
          lessonSlug: slug,
          questionIndex,
          selectedAnswerIndex: answerIndex,
          isCorrect,
          answeredAt: new Date().toISOString(),
        },
      }));
    },
    [slug, parsedQuestions]
  );

  if (!lesson) return null;

  const lessonMeta = sortedLessons.map((l) => ({ slug: l.slug, order: l.order }));

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Indicator */}
      <div className="border-b border-border bg-card/60">
        <div className="max-w-3xl mx-auto px-4">
          <ProgressIndicator
            lessons={lessonMeta}
            progressStates={progressStates}
            currentSlug={slug!}
          />
        </div>
      </div>

      {/* Main content area */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Lesson Header */}
        <div className="mb-2">
          <span className="font-heading text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Lesson {lesson.order}
          </span>
        </div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-8 leading-tight">
          {lesson.title}
        </h1>

        {/* Completed badge */}
        {isCompleted && (
          <div className="mb-6 bg-success/10 border border-success/30 rounded-lg px-4 py-2.5 inline-flex items-center gap-2">
            <span className="text-success text-sm">✓</span>
            <span className="font-heading text-xs text-success font-semibold tracking-wide uppercase">
              Completed
            </span>
          </div>
        )}

        {/* Accordion Stack */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <Accordion
            type="single"
            collapsible
            value={accordionValue}
            onValueChange={(val) => setAccordionValue(val)}
          >
            {(["whyItMatters", "theory", "practice", "selfCheck", "additionalInfo"] as const).map(
              (sectionKey, idx, arr) => (
                <AccordionItem
                  key={sectionKey}
                  value={sectionKey}
                  className={idx < arr.length - 1 ? "border-b border-border" : "border-b-0"}
                >
                  <AccordionTrigger className="px-6 py-4 font-heading text-sm font-semibold text-foreground hover:no-underline hover:bg-secondary/60 transition-colors data-[state=open]:bg-secondary/40">
                    <span className="flex items-center gap-3">
                      <span className="text-base">{SECTION_ICONS[sectionKey]}</span>
                      {SECTION_LABELS[sectionKey]}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2">
                    {sectionKey === "selfCheck" ? (
                      parsedQuestions.map((q) => (
                        <QuestionItem
                          key={q.questionIndex}
                          question={q}
                          lessonSlug={slug!}
                          state={questionStates[getQuestionKey(slug!, q.questionIndex)]}
                          readOnly={isReadOnly}
                          onAnswer={handleAnswer}
                        />
                      ))
                    ) : (
                      <LessonContent markdown={lesson[sectionKey]} />
                    )}
                  </AccordionContent>
                </AccordionItem>
              )
            )}
          </Accordion>
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 pt-8">
          {isLastLesson && isCompleted ? (
            <div className="text-center py-8 bg-card rounded-xl border border-border">
              <p className="font-heading text-lg text-primary font-semibold">
                🎉 Course Complete
              </p>
              <p className="text-muted-foreground text-sm mt-2 font-body">
                You have finished all lessons. Well done!
              </p>
            </div>
          ) : isLastLesson ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm font-body">
                Complete all self-check questions to finish the course.
              </p>
            </div>
          ) : (
            <button
              className={`w-full py-4 rounded-xl font-heading text-sm font-semibold tracking-wide transition-all duration-200 ${
                allCorrect || isCompleted
                  ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:opacity-95 cursor-pointer"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
              disabled={!(allCorrect || isCompleted)}
              onClick={() => {
                if (nextLesson) navigate(`/lesson/${nextLesson.slug}`);
              }}
            >
              {allCorrect || isCompleted ? "Continue to Next Lesson →" : "Complete all questions to continue"}
            </button>
          )}
        </div>
      </main>

      {/* Footer spacer */}
      <div className="pb-16" />
    </div>
  );
}