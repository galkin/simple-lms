import { marked } from "marked";

/**
 * Renders markdown string to HTML string.
 */
export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string;
}
