"use client";

import { useState } from "react";
import Image from "next/image";
import { CategoryPlaceholderIcon } from "@/lib/utils/category-icons";

/**
 * Falls back to the category placeholder icon on load failure — most catalog
 * products don't have real photography yet, only a guessed `/images/products/*`
 * path, so a 404 here is expected rather than exceptional.
 */
export function ProductImage({
  src,
  alt,
  category,
  sizes,
  className,
  iconClassName,
}: {
  src: string;
  alt: string;
  category: string;
  sizes?: string;
  className?: string;
  iconClassName?: string;
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
      onError={() => setErrored(true)}
    />
  );
}
