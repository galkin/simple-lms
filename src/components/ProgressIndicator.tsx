import { LessonProgressState } from "@/types/lesson";
import { useNavigate } from "react-router-dom";

interface ProgressIndicatorProps {
  lessons: { slug: string; order: number }[];
  progressStates: Record<string, LessonProgressState>;
  currentSlug: string;
}

export function ProgressIndicator({ lessons, progressStates, currentSlug }: ProgressIndicatorProps) {
  const navigate = useNavigate();
  const sorted = [...lessons].sort((a, b) => a.order - b.order);

  return (
    <div className="flex items-center justify-center gap-1 flex-wrap py-5">
      {sorted.map((lesson, idx) => {
        const state = progressStates[lesson.slug];
        const isCurrent = lesson.slug === currentSlug;
        const status = state?.status || "locked";
        const isClickable = status === "available" || status === "completed";
        const isLast = idx === sorted.length - 1;

        return (
          <div key={lesson.slug} className="flex items-center">
            <button
              className={`
                w-9 h-9 flex items-center justify-center font-heading text-xs font-semibold
                rounded-full transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
                ${isCurrent && status === "completed"
                  ? "bg-progress-completed text-progress-completed-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background shadow-sm"
                  : isCurrent
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background shadow-sm"
                  : status === "completed"
                  ? "bg-progress-completed text-progress-completed-foreground"
                  : status === "available"
                  ? "bg-card border-2 border-progress-available text-progress-available-foreground"
                  : "bg-muted text-progress-locked-foreground"
                }
                ${isClickable ? "cursor-pointer hover:shadow-md" : "cursor-default"}
              `}
              disabled={!isClickable}
              onClick={() => {
                if (isClickable) navigate(`/lesson/${lesson.slug}`);
              }}
              aria-label={`Lesson ${lesson.order}: ${status}`}
            >
              {status === "completed" && !isCurrent ? "✓" : lesson.order}
            </button>
            {!isLast && (
              <div
                className={`w-6 h-0.5 mx-0.5 rounded-full transition-colors ${
                  status === "completed" ? "bg-primary/40" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}