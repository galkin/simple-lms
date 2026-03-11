// content-collections.ts
import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";
var lessons = defineCollection({
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
    additionalInfo: z.string()
  })
});
var content_collections_default = defineConfig({
  collections: [lessons]
});
export {
  content_collections_default as default
};
