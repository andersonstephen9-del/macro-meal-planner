"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  value?: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md";
  readonly?: boolean;
}

export function StarRating({
  value = 0,
  onChange,
  size = "md",
  readonly = false,
}: StarRatingProps) {
  const iconSize = size === "sm" ? "h-6 w-6" : "h-8 w-8";

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Rate this recipe">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            className={`rounded-full p-1 transition-transform ${
              readonly ? "cursor-default" : "active:scale-95"
            }`}
            aria-label={`Rate ${star} stars`}
          >
            <Star
              className={`${iconSize} ${
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-slate-300"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
