import type { Product } from "@/lib/types";

export type SortOption = "price-asc" | "price-desc" | "newest" | "bestselling" | "rating";

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const copy = [...products];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "bestselling":
      return copy.sort((a, b) => {
        const aBestseller = a.tags?.includes("Bestseller") ? 1 : 0;
        const bBestseller = b.tags?.includes("Bestseller") ? 1 : 0;
        return bBestseller - aBestseller;
      });
    case "newest":
      return copy.sort((a, b) => {
        const aNew = a.tags?.includes("New") ? 1 : 0;
        const bNew = b.tags?.includes("New") ? 1 : 0;
        return bNew - aNew;
      });
    default:
      return copy;
  }
}
