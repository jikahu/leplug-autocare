"use client";

import { useWishlistStore } from "@/lib/store/wishlist";
import { products } from "@/lib/data/products";
import { ProductGrid } from "@/components/product/product-grid";

export function WishlistGrid() {
  const productIds = useWishlistStore((state) => state.productIds);
  const wishlisted = products.filter((product) => productIds.includes(product.id));

  return <ProductGrid products={wishlisted} emptyState={{ variant: "wishlist" }} />;
}
