import { describe, it, expect } from "vitest";
import { getReviewStats } from "./review-stats";
import type { Review } from "@/lib/types";

function sampleReview(rating: number): Review {
  return {
    id: "sample-review",
    productId: "p1",
    userName: "Sample User",
    rating,
    comment: "Sample comment",
    date: "2026-01-01",
  };
}

describe("getReviewStats", () => {
  it("returns zero average and count for an empty list", () => {
    expect(getReviewStats([])).toEqual({ average: 0, count: 0 });
  });

  it("returns the rating itself as the average for a single review", () => {
    expect(getReviewStats([sampleReview(4)])).toEqual({ average: 4, count: 1 });
  });

  it("averages multiple reviews and rounds to one decimal place", () => {
    const stats = getReviewStats([sampleReview(5), sampleReview(4), sampleReview(4)]);
    expect(stats).toEqual({ average: 4.3, count: 3 });
  });
});
