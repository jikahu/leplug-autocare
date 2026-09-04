import type { Product } from "@/lib/types";

export function getRelatedProducts(product: Product, allProducts: Product[], limit = 4): Product[] {
  return allProducts
    .filter((candidate) => candidate.id !== product.id)
    .map((candidate) => ({ candidate, score: scoreRelated(product, candidate) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

function scoreRelated(product: Product, candidate: Product): number {
  let score = 0;
  if (candidate.category === product.category) score += 2;
  if (product.subcategory && candidate.subcategory === product.subcategory) score += 2;
  if (product.compatibleMakes && candidate.compatibleMakes) {
    const overlap = candidate.compatibleMakes.filter((make) => product.compatibleMakes!.includes(make));
    score += overlap.length;
  }
  return score;
}
