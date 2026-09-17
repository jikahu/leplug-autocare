"use client";

import { useState } from "react";
import Image from "next/image";
import { CategoryPlaceholderIcon } from "@/lib/utils/category-icons";

/**
 * Falls back to the category placeholder icon on load failure — a handful of
 * products still only have a guessed `/images/products/*` path with no file
 * behind it, so a 404 there is expected rather than exceptional.
 */
export function ProductImage({
  src,
  alt,
  category,
  sizes,
  className,
  iconClassName,
  priority,
}: {
  src: string;
  alt: string;
  category: string;
  sizes?: string;
  className?: string;
  iconClassName?: string;
  priority?: boolean;
}) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return <CategoryPlaceholderIcon category={category} className={iconClassName} />;
  }

  return (
    <Image
      key={src}
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      onError={() => setErrored(true)}
    />
  );
}
