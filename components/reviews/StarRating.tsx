"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  rating: number;
  maxRating?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
};

export function StarRating({
  rating,
  maxRating = 5,
  interactive = false,
  onRatingChange,
  size = "md"
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: maxRating }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= rating;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => {
              if (interactive && onRatingChange) {
                onRatingChange(starValue);
              }
            }}
            className={cn(
              "transition-colors",
              interactive ? "cursor-pointer hover:scale-110" : "cursor-default",
              isFilled ? "text-tertiary" : "text-neutral-variant"
            )}
          >
            <Star
              className={cn(sizeClasses[size], isFilled ? "fill-current" : "")}
            />
          </button>
        );
      })}
    </div>
  );
}
