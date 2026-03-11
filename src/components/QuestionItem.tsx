import { ParsedQuestion, LessonQuestionState } from "@/types/lesson";
import { getQuestionKey } from "@/lib/progressStorage";

interface QuestionItemProps {
  question: ParsedQuestion;
  lessonSlug: string;
  state: LessonQuestionState | undefined;
  readOnly: boolean;
  onAnswer: (questionIndex: number, answerIndex: number) => void;
}

export function QuestionItem({ question, lessonSlug, state, readOnly, onAnswer }: QuestionItemProps) {
  const isAnsweredCorrectly = state?.isCorrect === true;
  const isAnsweredIncorrectly = state?.isCorrect === false;
  const isLocked = isAnsweredCorrectly || readOnly;

  return (
    <div className="mb-8 last:mb-0">
      <p className="font-heading text-sm font-semibold mb-4 text-card-foreground">
        {question.prompt}
      </p>
      <div className="flex flex-col gap-2">
        {question.options.map((option, optIndex) => {
          const isSelected = state?.selectedAnswerIndex === optIndex;
          const isCorrectOption = optIndex === question.correctAnswerIndex;

          let optionClasses = "w-full text-left px-4 py-3 border-2 font-body text-sm transition-all duration-100 ";

          if (isLocked && isCorrectOption) {
            // Correct answer shown
            optionClasses += "border-success bg-success/10 text-card-foreground";
          } else if (isSelected && isAnsweredIncorrectly) {
            // Wrong answer selected
            optionClasses += "border-destructive bg-destructive/10 text-card-foreground";
          } else if (isLocked) {
            // Other options in locked state
            optionClasses += "border-border/50 text-muted-foreground opacity-50";
          } else {
            // Active option
            optionClasses += "border-border text-card-foreground hover:border-primary/50 cursor-pointer";
          }

          return (
            <button
              key={optIndex}
              className={optionClasses}
              disabled={isLocked}
              onClick={() => {
                if (!isLocked) onAnswer(question.questionIndex, optIndex);
              }}
            >
              <span className="flex items-center gap-3">
                <span className="font-heading text-xs w-5 h-5 flex items-center justify-center border border-current shrink-0">
                  {String.fromCharCode(65 + optIndex)}
                </span>
                <span>{option}</span>
                {isLocked && isCorrectOption && (
                  <span className="ml-auto text-success text-lg">✓</span>
                )}
                {isSelected && isAnsweredIncorrectly && (
                  <span className="ml-auto text-destructive text-lg">✗</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
