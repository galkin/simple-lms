import { renderMarkdown } from "@/lib/markdown";

interface LessonContentProps {
  markdown: string;
}

export function LessonContent({ markdown }: LessonContentProps) {
  const html = renderMarkdown(markdown);

  return (
    <div
      className="prose-lesson"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
