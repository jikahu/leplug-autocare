"use client";

import { useState } from "react";
import { CategoryPlaceholderIcon } from "@/lib/utils/category-icons";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  category,
  productName,
}: {
  images: string[];
  category: string;
  productName: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="space-y-3">
      <div
        role="img"
        aria-label={productName}
        className="flex aspect-square items-center justify-center rounded-lg border border-steel bg-linear-to-br from-chrome-start to-chrome-end"
      >
        <CategoryPlaceholderIcon category={category} className="size-32 text-tarmac/30" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-pressed={selectedIndex === index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "flex size-16 items-center justify-center rounded-md border bg-linear-to-br from-chrome-start to-chrome-end focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram",
                selectedIndex === index ? "border-murram" : "border-steel/40"
              )}
            >
              <CategoryPlaceholderIcon category={category} className="size-8 text-tarmac/30" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
