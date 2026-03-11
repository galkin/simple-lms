import { defineConfig, s } from "velite";

const lessons = {
  name: "Lesson",
  pattern: "lessons/**/*.yaml",
  schema: s.object({
    slug: s.string(),
    order: s.number(),
    title: s.string(),
    whyItMatters: s.string().optional(),
    "why-it-matters": s.string().optional(),
    theory: s.string(),
    practice: s.string(),
    questions: s
      .array(
        s.object({
          id: s.string().optional(),
          prompt: s.string(),
          options: s.array(s.string()).length(4),
          correctAnswer: s.number().int().min(0).max(3),
        })
      )
      .transform((questions) =>
        questions.map((question, questionIndex) => ({
          questionIndex,
          prompt: question.prompt,
          options: question.options,
          correctAnswerIndex: question.correctAnswer,
        }))
      ),
    additionalInfo: s.string().optional(),
    "additional-info": s.string().optional(),
  }).transform((lesson) => ({
    ...lesson,
    whyItMatters: lesson.whyItMatters ?? lesson["why-it-matters"] ?? "",
    additionalInfo: lesson.additionalInfo ?? lesson["additional-info"] ?? "",
  })),
};

export default defineConfig({
  root: "content",
  collections: {
    lessons,
  },
});
