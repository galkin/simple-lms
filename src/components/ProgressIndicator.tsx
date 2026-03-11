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
    <div className="flex items-center justify-center gap-2 flex-wrap py-6">
      {sorted.map((lesson) => {
        const state = progressStates[lesson.slug];
        const isCurrent = lesson.slug === currentSlug;
        const status = state?.status || "locked";
        const isClickable = status === "available" || status === "completed";

        let circleClasses = "w-10 h-10 flex items-center justify-center font-heading text-sm font-semibold border-2 transition-all duration-150 ";

        if (isCurrent && status === "completed") {
          circleClasses += "border-progress-completed bg-progress-completed text-progress-completed-foreground ring-2 ring-primary ring-offset-2 ring-offset-background";
        } else if (isCurrent) {
          circleClasses += "border-primary bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background";
        } else if (status === "completed") {
          circleClasses += "border-progress-completed bg-progress-completed text-progress-completed-foreground";
        } else if (status === "available") {
          circleClasses += "border-progress-available bg-transparent text-progress-available-foreground";
        } else {
          circleClasses += "border-progress-locked bg-transparent text-progress-locked-foreground";
        }

        if (isClickable) {
          circleClasses += " cursor-pointer hover:opacity-80";
        }

        return (
          <button
            key={lesson.slug}
            className={circleClasses}
            disabled={!isClickable}
            onClick={() => {
              if (isClickable) navigate(`/lesson/${lesson.slug}`);
            }}
            aria-label={`Lesson ${lesson.order}: ${status}`}
          >
            {lesson.order}
          </button>
        );
      })}
    </div>
  );
}
