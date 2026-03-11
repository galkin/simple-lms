import { ParsedQuestion } from "@/types/lesson";

/**
 * Parses the questions markdown field into structured question objects.
 * Expected format per question:
 * ### Question N
 * Question text
 * 
 * - Option 1
 * - Option 2
 * - Option 3
 * - Option 4
 * 
 * **Correct answer:** N
 */
export function parseQuestions(questionsMarkdown: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  const questionBlocks = questionsMarkdown.split(/###\s+Question\s+\d+/i).filter((b) => b.trim());

  questionBlocks.forEach((block, index) => {
    const lines = block.trim().split("\n").filter((l) => l.trim());

    // Find the prompt (first non-empty line that's not an option or correct answer)
    const promptLines: string[] = [];
    const options: string[] = [];
    let correctAnswerIndex = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("- ")) {
        options.push(trimmed.slice(2).trim());
      } else if (trimmed.startsWith("**Correct answer:**")) {
        const num = parseInt(trimmed.match(/\d+/)?.[0] || "1", 10);
        correctAnswerIndex = num - 1; // Convert to 0-indexed
      } else {
        promptLines.push(trimmed);
      }
    }

    if (promptLines.length > 0 && options.length === 4) {
      questions.push({
        questionIndex: index,
        prompt: promptLines.join(" "),
        options,
        correctAnswerIndex,
      });
    }
  });

  return questions;
}
