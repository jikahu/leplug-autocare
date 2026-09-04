"use client";

import { useState, type FormEvent } from "react";
import { Star, StarHalf } from "lucide-react";
import type { Review } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { getReviewStats } from "@/lib/utils/review-stats";
import { getStarCounts } from "@/lib/utils/star-rating";
import { StarRatingInput } from "@/components/product/star-rating-input";
import { cn } from "@/lib/utils";

type FormErrors = { userName?: string; rating?: string; comment?: string };

export function ProductReviews({
  productId,
  initialReviews,
}: {
  productId: string;
  initialReviews: Review[];
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const stats = getReviewStats(reviews);
  const summaryStars = getStarCounts(stats.average);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (!userName.trim()) nextErrors.userName = "Enter your name.";
    if (rating === 0) nextErrors.rating = "Select a star rating.";
    if (!comment.trim()) nextErrors.comment = "Write a comment before submitting.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const newReview: Review = {
      id: `local-${Date.now()}`,
      productId,
      userName: userName.trim(),
      rating,
      comment: comment.trim(),
      date: new Date().toISOString().slice(0, 10),
      verifiedPurchase: false,
    };
    setReviews((current) => [newReview, ...current]);
    setUserName("");
    setRating(0);
    setComment("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <div id="reviews" className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex" aria-hidden="true">
          {Array.from({ length: summaryStars.full }).map((_, i) => (
            <Star key={`full-${i}`} className="size-5 fill-murram text-murram" />
          ))}
          {summaryStars.half && <StarHalf className="size-5 fill-murram text-murram" />}
          {Array.from({ length: summaryStars.empty }).map((_, i) => (
            <Star key={`empty-${i}`} className="size-5 text-steel" />
          ))}
        </div>
        <span className="text-sm text-tarmac">
          {stats.count > 0
            ? `${stats.average} out of 5 (${stats.count} review${stats.count === 1 ? "" : "s"})`
            : "No reviews yet"}
        </span>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-steel">No reviews yet. Be the first to review this product.</p>
      ) : (
        <ul className="space-y-6">
          {reviews.map((review) => (
            <li key={review.id} className="border-t border-steel/30 pt-6">
              <div className="flex items-center justify-between">
                <span className="font-medium text-tarmac">{review.userName}</span>
                <span className="text-xs text-steel">{review.date}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn("size-3.5", i < review.rating ? "fill-murram text-murram" : "text-steel")}
                    />
                  ))}
                </div>
                {review.verifiedPurchase && (
                  <span className="text-xs font-medium text-acacia">Verified purchase</span>
                )}
              </div>
              <p className="mt-2 text-sm text-tarmac">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="max-w-md space-y-4 border-t border-steel/30 pt-6">
        <h3 className="font-heading text-lg font-bold text-tarmac">Write a review</h3>

        <div className="space-y-1">
          <label htmlFor="review-name" className="text-sm font-medium text-tarmac">
            Name
          </label>
          <input
            id="review-name"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            aria-invalid={Boolean(errors.userName)}
            aria-describedby={errors.userName ? "review-name-error" : undefined}
            className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
          />
          {errors.userName && (
            <p id="review-name-error" className="text-xs text-murram">
              {errors.userName}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <span className="text-sm font-medium text-tarmac">Rating</span>
          <StarRatingInput
            value={rating}
            onChange={setRating}
            describedBy={errors.rating ? "review-rating-error" : undefined}
          />
          {errors.rating && (
            <p id="review-rating-error" className="text-xs text-murram">
              {errors.rating}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="review-comment" className="text-sm font-medium text-tarmac">
            Comment
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            aria-invalid={Boolean(errors.comment)}
            aria-describedby={errors.comment ? "review-comment-error" : undefined}
            className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
          />
          {errors.comment && (
            <p id="review-comment-error" className="text-xs text-murram">
              {errors.comment}
            </p>
          )}
        </div>

        <Button type="submit">Submit Review</Button>
        {submitted && <p className="text-sm font-medium text-acacia">Review submitted.</p>}
      </form>
    </div>
  );
}
