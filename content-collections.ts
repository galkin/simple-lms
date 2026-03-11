import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";

const lessons = defineCollection({
  name: "lessons",
  directory: "content/lessons",
  include: "**/*.md",
  schema: z.object({
    slug: z.string(),
    order: z.number(),
    title: z.string(),
    whyItMatters: z.string(),
    theory: z.string(),
    practice: z.string(),
    questions: z.string(),
    additionalInfo: z.string(),
  }),
});

export default defineConfig({
  collections: [lessons],
});
