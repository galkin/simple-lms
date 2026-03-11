import { ParsedQuestion, LessonQuestionState } from "@/types/lesson";

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
      <p className="font-heading text-sm font-semibold mb-4 text-foreground">
        {question.prompt}
      </p>
      <div className="flex flex-col gap-2">
        {question.options.map((option, optIndex) => {
          const isSelected = state?.selectedAnswerIndex === optIndex;
          const isCorrectOption = optIndex === question.correctAnswerIndex;

          let optionClasses = "w-full text-left px-4 py-3 rounded-lg font-body text-sm transition-all duration-150 border ";

          if (isLocked && isCorrectOption) {
            optionClasses += "border-success/40 bg-success/8 text-foreground";
          } else if (isSelected && isAnsweredIncorrectly) {
            optionClasses += "border-destructive/40 bg-destructive/8 text-foreground";
          } else if (isLocked) {
            optionClasses += "border-border/50 text-muted-foreground opacity-50";
          } else {
            optionClasses += "border-border text-foreground hover:border-primary/40 hover:bg-secondary/50 cursor-pointer";
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
                <span className={`font-heading text-xs w-6 h-6 flex items-center justify-center rounded-full shrink-0 border ${
                  isLocked && isCorrectOption
                    ? "border-success/60 bg-success/15 text-success"
                    : isSelected && isAnsweredIncorrectly
                    ? "border-destructive/60 bg-destructive/15 text-destructive"
                    : "border-border bg-muted/50 text-muted-foreground"
                }`}>
                  {String.fromCharCode(65 + optIndex)}
                </span>
                <span>{option}</span>
                {isLocked && isCorrectOption && (
                  <span className="ml-auto text-success font-semibold text-sm">✓</span>
                )}
                {isSelected && isAnsweredIncorrectly && (
                  <span className="ml-auto text-destructive font-semibold text-sm">✗</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}