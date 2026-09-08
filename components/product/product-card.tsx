"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart, Star, StarHalf } from "lucide-react";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/store/cart";
import { useCartDrawerStore } from "@/lib/store/cart-drawer";
import { useWishlistStore } from "@/lib/store/wishlist";
import { formatCurrency } from "@/lib/utils/format-currency";
import { getStarCounts } from "@/lib/utils/star-rating";
import { CategoryPlaceholderIcon } from "@/lib/utils/category-icons";

export function ProductCard({ product }: { product: Product }) {
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const openCartDrawer = useCartDrawerStore((state) => state.open);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(product.id));
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const stars = product.rating ? getStarCounts(product.rating) : null;
  const isOutOfStock = product.stock === "out_of_stock";
  const photo = product.images[0]?.startsWith("http") ? product.images[0] : undefined;

  function handleAddToCart() {
    addItem(product.id);
    openCartDrawer();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <div className="flex w-full flex-col">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-steel bg-linear-to-br from-chrome-start to-chrome-end">
        {product.tags && product.tags.length > 0 && (
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.tags.map((tag) => (
              <Badge
                key={tag}
                className={
                  tag === "Sale"
                    ? "bg-murram text-savanna"
                    : "border border-tarmac/20 bg-savanna text-tarmac"
                }
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
          className="absolute right-2 top-2 rounded-full bg-tarmac/70 p-1.5 text-savanna focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        >
          <Heart className={`size-4 ${isWishlisted ? "fill-murram text-murram" : ""}`} aria-hidden="true" />
        </button>
        <Link
          href={`/product/${product.slug}`}
          aria-label={`View ${product.name}`}
          className="relative flex h-full w-full items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram focus-visible:ring-inset"
        >
          {photo ? (
            <Image
              src={photo}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover"
            />
          ) : (
            <CategoryPlaceholderIcon category={product.category} className="size-16 text-tarmac/30" />
          )}
        </Link>
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-1">
        {product.brand && (
          <span className="text-xs font-medium uppercase tracking-wide text-steel">
            {product.brand}
          </span>
        )}
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 rounded-sm text-sm font-medium text-tarmac hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        >
          {product.name}
        </Link>

        {stars && (
          <div className="flex items-center gap-1" aria-label={`Rated ${product.rating} out of 5`}>
            {Array.from({ length: stars.full }).map((_, index) => (
              <Star key={`full-${index}`} className="size-3.5 fill-murram text-murram" aria-hidden="true" />
            ))}
            {stars.half && <StarHalf className="size-3.5 fill-murram text-murram" aria-hidden="true" />}
            {Array.from({ length: stars.empty }).map((_, index) => (
              <Star key={`empty-${index}`} className="size-3.5 text-steel" aria-hidden="true" />
            ))}
            {product.reviewCount !== undefined && (
              <span className="text-xs text-steel">({product.reviewCount})</span>
            )}
          </div>
        )}

        <div className="mt-1 flex items-center gap-2">
          <span className="font-semibold text-murram">{formatCurrency(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-steel line-through">
              {formatCurrency(product.compareAtPrice)}
            </span>
          )}
        </div>

        {product.stock === "low_stock" && (
          <span className="text-xs font-medium text-murram">
            {product.stockCount !== undefined ? `Only ${product.stockCount} left` : "Low stock"}
          </span>
        )}
        {isOutOfStock && <span className="text-xs font-medium text-steel">Out of stock</span>}

        <Button type="button" onClick={handleAddToCart} disabled={isOutOfStock} className="mt-2 w-full">
          {isOutOfStock ? "Out of Stock" : justAdded ? "Added" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
