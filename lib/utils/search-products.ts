import type { Product } from "@/lib/types";

export function searchProducts(products: Product[], query: string): Product[] {
  const term = query.trim().toLowerCase();
  if (!term) return [];
  return products.filter((product) => {
    const haystack = `${product.name} ${product.category} ${product.brand ?? ""}`.toLowerCase();
    return haystack.includes(term);
  });
}
