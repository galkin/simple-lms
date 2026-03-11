import { LessonProgressState, LessonQuestionState } from "@/types/lesson";

const PROGRESS_KEY = "lesson-progress";
const QUESTIONS_KEY = "lesson-questions";

export function loadProgressStates(): Record<string, LessonProgressState> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProgressStates(states: Record<string, LessonProgressState>) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(states));
}

export function loadQuestionStates(): Record<string, LessonQuestionState> {
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveQuestionStates(states: Record<string, LessonQuestionState>) {
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(states));
}

export function getQuestionKey(lessonSlug: string, questionIndex: number): string {
  return `${lessonSlug}:${questionIndex}`;
}

export function initializeProgress(
  lessonSlugs: string[],
  existing: Record<string, LessonProgressState>
): Record<string, LessonProgressState> {
  const result = { ...existing };

  lessonSlugs.forEach((slug, index) => {
    if (!result[slug]) {
      result[slug] = {
        lessonSlug: slug,
        status: index === 0 ? "available" : "locked",
        allQuestionsCorrect: false,
        completedAt: null,
      };
    }
  });

  return result;
}
