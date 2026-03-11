import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect, useCallback } from "react";
import { allLessons } from "@/data/lessons";
import { parseQuestions } from "@/lib/parseQuestions";
import { renderMarkdown } from "@/lib/markdown";
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

  // Persist states
  useEffect(() => {
    saveProgressStates(progressStates);
  }, [progressStates]);

  useEffect(() => {
    saveQuestionStates(questionStates);
  }, [questionStates]);

  // Find current lesson
  const lesson = useMemo(
    () => sortedLessons.find((l) => l.slug === slug),
    [sortedLessons, slug]
  );

  const currentProgress = slug ? progressStates[slug] : undefined;

  // Redirect locked lessons
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

  // Reset accordion on lesson change
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

  // Check if all questions correct
  const allCorrect = useMemo(() => {
    if (!slug || parsedQuestions.length === 0) return false;
    return parsedQuestions.every((q) => {
      const key = getQuestionKey(slug, q.questionIndex);
      return questionStates[key]?.isCorrect === true;
    });
  }, [slug, parsedQuestions, questionStates]);

  // Auto-complete lesson when all questions correct
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
        // Unlock next lesson
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
      <div className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4">
          <ProgressIndicator
            lessons={lessonMeta}
            progressStates={progressStates}
            currentSlug={slug!}
          />
        </div>
      </div>

      {/* Main content area — Paper surface */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Lesson Header */}
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-8">
          {lesson.title}
        </h1>

        {/* Completed badge */}
        {isCompleted && (
          <div className="mb-6 border-2 border-primary px-4 py-2 inline-block">
            <span className="font-heading text-xs text-primary font-semibold tracking-widest uppercase">
              Completed
            </span>
          </div>
        )}

        {/* Accordion Stack */}
        <div className="bg-card border border-border">
          <Accordion
            type="single"
            collapsible
            value={accordionValue}
            onValueChange={(val) => setAccordionValue(val)}
          >
            {/* Why It Matters */}
            <AccordionItem value="whyItMatters" className="border-b border-border">
              <AccordionTrigger className="px-6 py-4 font-heading text-sm font-semibold text-card-foreground hover:no-underline hover:bg-card/80">
                {SECTION_LABELS.whyItMatters}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <LessonContent markdown={lesson.whyItMatters} />
              </AccordionContent>
            </AccordionItem>

            {/* Theory */}
            <AccordionItem value="theory" className="border-b border-border">
              <AccordionTrigger className="px-6 py-4 font-heading text-sm font-semibold text-card-foreground hover:no-underline hover:bg-card/80">
                {SECTION_LABELS.theory}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <LessonContent markdown={lesson.theory} />
              </AccordionContent>
            </AccordionItem>

            {/* Practice */}
            <AccordionItem value="practice" className="border-b border-border">
              <AccordionTrigger className="px-6 py-4 font-heading text-sm font-semibold text-card-foreground hover:no-underline hover:bg-card/80">
                {SECTION_LABELS.practice}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <LessonContent markdown={lesson.practice} />
              </AccordionContent>
            </AccordionItem>

            {/* Self-Check */}
            <AccordionItem value="selfCheck" className="border-b border-border">
              <AccordionTrigger className="px-6 py-4 font-heading text-sm font-semibold text-card-foreground hover:no-underline hover:bg-card/80">
                {SECTION_LABELS.selfCheck}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                {parsedQuestions.map((q) => (
                  <QuestionItem
                    key={q.questionIndex}
                    question={q}
                    lessonSlug={slug!}
                    state={questionStates[getQuestionKey(slug!, q.questionIndex)]}
                    readOnly={isReadOnly}
                    onAnswer={handleAnswer}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>

            {/* Additional Info */}
            <AccordionItem value="additionalInfo" className="border-b-0">
              <AccordionTrigger className="px-6 py-4 font-heading text-sm font-semibold text-card-foreground hover:no-underline hover:bg-card/80">
                {SECTION_LABELS.additionalInfo}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <LessonContent markdown={lesson.additionalInfo} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 border-t-2 border-border pt-8">
          {isLastLesson && isCompleted ? (
            <div className="text-center py-8">
              <p className="font-heading text-lg text-primary font-semibold tracking-wide">
                Course Complete
              </p>
              <p className="text-muted-foreground text-sm mt-2 font-body">
                You have finished all lessons.
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
              className={`w-full py-4 font-heading text-sm font-semibold tracking-wider uppercase border-2 transition-all duration-150 ${
                allCorrect || isCompleted
                  ? "border-primary bg-primary text-primary-foreground cursor-pointer hover:opacity-90"
                  : "border-border text-muted-foreground cursor-not-allowed"
              }`}
              disabled={!(allCorrect || isCompleted)}
              onClick={() => {
                if (nextLesson) navigate(`/lesson/${nextLesson.slug}`);
              }}
            >
              {allCorrect || isCompleted ? "Go to Next Lesson →" : "Complete all questions to continue"}
            </button>
          )}
        </div>
      </main>

      {/* Hard stop */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <hr className="border-t-4 border-border" />
      </div>
    </div>
  );
}
