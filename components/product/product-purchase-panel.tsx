"use client";

import { useState } from "react";
import { Heart, Minus, Plus, Star, StarHalf } from "lucide-react";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format-currency";
import { getStarCounts } from "@/lib/utils/star-rating";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { cn } from "@/lib/utils";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [notifyRequested, setNotifyRequested] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(product.id));
  const toggleWishlist = useWishlistStore((state) => state.toggle);

  const isOutOfStock = product.stock === "out_of_stock";
  const stars = product.rating ? getStarCounts(product.rating) : null;

  function handleAddToCart() {
    addItem(product.id, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="font-stencil text-sm tracking-wide text-steel">{product.sku}</p>
        <h1 className="font-heading text-3xl font-bold text-tarmac">{product.name}</h1>
      </div>

      {stars && (
        <a href="#reviews" className="flex w-fit items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram">
          <div className="flex" aria-hidden="true">
            {Array.from({ length: stars.full }).map((_, i) => (
              <Star key={`full-${i}`} className="size-4 fill-murram text-murram" />
            ))}
            {stars.half && <StarHalf className="size-4 fill-murram text-murram" />}
            {Array.from({ length: stars.empty }).map((_, i) => (
              <Star key={`empty-${i}`} className="size-4 text-steel" />
            ))}
          </div>
          {product.reviewCount !== undefined && (
            <span className="text-sm text-steel">({product.reviewCount} reviews)</span>
          )}
        </a>
      )}

      <div className="flex items-baseline gap-3">
        <span className="font-heading text-2xl font-bold text-murram">{formatCurrency(product.price)}</span>
        {product.compareAtPrice && (
          <span className="text-steel line-through">{formatCurrency(product.compareAtPrice)}</span>
        )}
      </div>

      <div>
        {product.stock === "in_stock" && <p className="text-sm font-medium text-acacia">In stock</p>}
        {product.stock === "low_stock" && <p className="text-sm font-medium text-murram">Low stock</p>}
        {isOutOfStock && <p className="text-sm font-medium text-steel">Out of stock</p>}
      </div>

      {!isOutOfStock && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-tarmac">Quantity</span>
          <div className="flex items-center rounded-md border border-steel/40">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-8 text-center text-sm font-medium text-tarmac">{quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQuantity((q) => q + 1)}
              className="p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {isOutOfStock ? (
          <Button type="button" disabled={notifyRequested} onClick={() => setNotifyRequested(true)}>
            {notifyRequested ? "We'll notify you" : "Notify Me"}
          </Button>
        ) : (
          <Button type="button" onClick={handleAddToCart}>
            {justAdded ? "Added to Cart" : "Add to Cart"}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          aria-pressed={isWishlisted}
          onClick={() => toggleWishlist(product.id)}
        >
          <Heart className={cn("size-4", isWishlisted && "fill-murram text-murram")} aria-hidden="true" />
          {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
        </Button>
      </div>
    </div>
  );
}
