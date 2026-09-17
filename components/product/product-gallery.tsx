"use client";

import { useState } from "react";
import { ProductImage } from "@/components/product/product-image";
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
  const selectedImage = images[selectedIndex];

  return (
    <div className="space-y-3">
      <div
        role="img"
        aria-label={productName}
        className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-steel bg-linear-to-br from-chrome-start to-chrome-end"
      >
        <ProductImage
          key={selectedImage}
          src={selectedImage}
          alt={productName}
          category={category}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          iconClassName="size-32 text-tarmac/30"
        />
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
                "relative flex size-16 items-center justify-center overflow-hidden rounded-md border bg-linear-to-br from-chrome-start to-chrome-end focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram",
                selectedIndex === index ? "border-murram" : "border-steel/40"
              )}
            >
              <ProductImage
                src={image}
                alt=""
                category={category}
                sizes="64px"
                className="object-cover"
                iconClassName="size-8 text-tarmac/30"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
