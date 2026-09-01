import type { Review } from "@/lib/types";
import { products } from "./products";

const SAMPLE_COMMENTS = [
  "Exactly as described, fits perfectly and arrived quickly.",
  "Good quality for the price. Would buy again.",
  "Installation was straightforward, no issues so far after a month of use.",
  "Does the job well, though packaging could be better.",
  "Great value — noticeably better than the one I had before.",
  "Solid build quality, feels durable.",
  "Works well but took a few days longer to arrive than expected.",
  "Very happy with this purchase, highly recommend.",
];

const SAMPLE_NAMES = [
  "Wanjiku M.", "Brian K.", "Achieng O.", "Kevin M.", "Faith N.",
  "Dennis O.", "Njeri W.", "Samuel K.", "Mercy A.", "Peter G.",
];

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export const reviews: Review[] = products.flatMap((product, productIndex) => {
  const shouldHaveReviews = productIndex % 3 !== 0;
  if (!shouldHaveReviews) return [];

  const count = 1 + Math.floor(pseudoRandom(productIndex) * 4);
  return Array.from({ length: count }, (_, i) => {
    const seed = productIndex * 10 + i;
    const rating = 3 + Math.floor(pseudoRandom(seed) * 3);
    return {
      id: `${product.id}-review-${i + 1}`,
      productId: product.id,
      userName: SAMPLE_NAMES[Math.floor(pseudoRandom(seed + 1) * SAMPLE_NAMES.length)],
      rating,
      comment: SAMPLE_COMMENTS[Math.floor(pseudoRandom(seed + 2) * SAMPLE_COMMENTS.length)],
      date: new Date(2026, Math.floor(pseudoRandom(seed + 3) * 8), 1 + Math.floor(pseudoRandom(seed + 4) * 27)).toISOString().slice(0, 10),
      verifiedPurchase: pseudoRandom(seed + 5) > 0.3,
    };
  });
});

export function getReviewsByProductId(productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId);
}
