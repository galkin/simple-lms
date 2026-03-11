declare module "content-collections" {
  interface Lesson {
    slug: string;
    order: number;
    title: string;
    whyItMatters: string;
    theory: string;
    practice: string;
    questions: string;
    additionalInfo: string;
    content: string;
    _meta: {
      filePath: string;
      fileName: string;
      directory: string;
      extension: string;
      path: string;
    };
  }

  export const allLessons: Lesson[];
}
