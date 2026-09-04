"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRatingInput({
  value,
  onChange,
  describedBy,
}: {
  value: number;
  onChange: (value: number) => void;
  describedBy?: string;
}) {
  return (
    <div role="radiogroup" aria-label="Rating" className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          aria-describedby={describedBy}
          onClick={() => onChange(star)}
          className="rounded-sm p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        >
          <Star className={cn("size-6", star <= value ? "fill-murram text-murram" : "text-steel")} />
        </button>
      ))}
    </div>
  );
}
