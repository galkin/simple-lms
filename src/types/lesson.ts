// Types for lesson data and state management

export interface LessonData {
  slug: string;
  order: number;
  title: string;
  whyItMatters: string;
  theory: string;
  practice: string;
  questions: string;
  additionalInfo: string;
}

export interface ParsedQuestion {
  questionIndex: number;
  prompt: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface LessonQuestionState {
  lessonSlug: string;
  questionIndex: number;
  selectedAnswerIndex: number | null;
  isCorrect: boolean | null;
  answeredAt: string | null;
}

export interface LessonProgressState {
  lessonSlug: string;
  status: "locked" | "available" | "completed";
  allQuestionsCorrect: boolean;
  completedAt: string | null;
}
