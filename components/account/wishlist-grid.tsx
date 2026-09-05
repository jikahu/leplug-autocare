"use client";

import { useWishlistStore, useWishlistHasHydrated } from "@/lib/store/wishlist";
import { products } from "@/lib/data/products";
import { ProductGrid } from "@/components/product/product-grid";
import type { Product } from "@/lib/types";

export function WishlistGrid() {
  const hasHydrated = useWishlistHasHydrated();
  const productIds = useWishlistStore((state) => state.productIds);

  // Wait for the persisted wishlist to load from localStorage before deciding
  // whether to show the empty state — same reasoning as /cart's CartPageContent:
  // this page is a direct navigation target (footer "Account > Wishlist" link),
  // so without this guard a returning visitor briefly sees "wishlist is empty".
  if (!hasHydrated) {
    return null;
  }

  const wishlisted = productIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));

  return <ProductGrid products={wishlisted} emptyState={{ variant: "wishlist" }} />;
}
