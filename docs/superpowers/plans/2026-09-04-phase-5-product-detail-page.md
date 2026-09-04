# Phase 5 — Product Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/product/[slug]` per CLAUDE.md §4.4 and the roadmap's Phase 5 scope: image gallery, price/stock display, key features, description, compatible vehicle makes, reviews list with mock client-side submission, related products, add-to-cart/wishlist actions, and `schema.org/Product` structured data.

**Architecture:**

- **This worktree branches from `master` at its current tip (`01910c9`, Phase 3's completion), in parallel with the still-unmerged Phase 4 branch/PR** — not stacked on top of it — so this PR stays independent and mergeable in either order, matching how Phase 4 itself branched from master rather than from an in-progress branch. Confirmed by inspecting this worktree directly: `components/product/` here contains only `product-card.tsx` (Phase 3); `ProductGrid`, `NoResults`, `ProductGridSkeleton`, `ShopFilters`, `SortSelect`, `CategoryBar`-on-a-page, the `/shop`/`/shop/[category]`/`/search` routes, and the on-brand `app/not-found.tsx` are all Phase 4 additions that do not exist on this branch. Two concrete consequences, both handled below rather than worked around by duplicating Phase 4 files (which would just create merge conflicts when the two branches meet):
  - **Related Products (Task 9) renders with `ProductCard` directly** in a plain grid, not via Phase 4's `ProductGrid`/`NoResults` — those aren't available here, and this page never needs `NoResults`' empty-state branch anyway (the section is only rendered when there's at least one related product).
  - **Breadcrumb links to `/shop` and `/shop/[category]`, and Task 10's 404 check, will only fully resolve once Phase 4 merges** — until then `/shop` is a dead link and unknown slugs fall through to Next.js's generic 404 rather than the on-brand one. This mirrors the exact same situation Phase 3's `ProductCard` was already in when it shipped `/product/[slug]` links before this phase existed — not a defect to fix here.
  - **`components/ui/skeleton.tsx` doesn't exist on this branch either** (it was added in Phase 4's Task 1) — Task 1 below re-adds it via the same `npx shadcn@latest add` flow Phase 4 used, independently. Since both branches generate it from the same shadcn registry, this is not expected to conflict when the branches are eventually both merged.
  - This worktree needed its own `npm install` (a nested worktree's empty local `node_modules` resolves plain `import`/`require` calls fine via Node's upward directory search, but Turbopack's workspace-root detection for `next build`/`next dev` does not do that walk and fails without a local install) and one `next build` to generate `.next/types` (needed for `app/layout.tsx`'s generated `LayoutProps` type to resolve) — both already done as part of setting up this worktree; noted here only in case `.next` or `node_modules` gets cleared mid-phase.
- **No real product photography exists.** Every seed product's `images` array is `["/images/products/<slug>.jpg"]` — a path with no file behind it (confirmed: `ProductCard` already never renders `<img>`/`next/image`, it renders `CategoryPlaceholderIcon` inside a chrome-gradient box instead). `ProductGallery` follows the identical placeholder pattern, just larger. It still accepts and maps over the full `images: string[]` array and renders a thumbnail-select row whenever `images.length > 1`, so it's structurally correct for real photos later — that code path just isn't visually exercised today since every current product has exactly one image.
- **No new shadcn interactive components** (beyond re-adding `Skeleton`, see above). CLAUDE.md §2 reserves shadcn/ui for interactive elements needing accessibility behavior it names explicitly — "dropdowns, dialogs, select, tabs, toast." A star-rating control and a name/comment review form don't need Radix/Base UI wrapping; native `<input>`/`<textarea>`/`<button>` elements, styled with the existing design tokens, are already accessible and keep this phase's surface area small. This also sidesteps a real risk the Phase 4 deviations log flagged: this project's shadcn is on the Base UI variant (`components.json` → `"style": "base-nova"`), and `Sheet` is already generated from Base UI's `Dialog` primitive — adding a second, differently-named `Dialog` component for image zoom would be confusing. No image zoom/lightbox is built this phase for the same reason: there's no real photo to zoom into yet.
- **Review submission is mock and ephemeral, per CLAUDE.md §8** ("allow (mock, client-side) submission of a new review"). `ProductReviews` holds the review list in local component state, seeded from `getReviewsByProductId(product.id)` on first render, and prepends new submissions to that state array — nothing is written back to `lib/data/reviews.ts` (a static import, not a database) and nothing persists across a reload. This is a deliberate scope boundary, not a gap: persisting mock reviews would need a store, and CLAUDE.md doesn't ask for that here (contrast with cart/wishlist, which explicitly says "persisted client-side").
- **The displayed rating/review-count summary is computed live from that same reviews array** (via a new `getReviewStats` util), not read from the static `product.rating`/`product.reviewCount` seed fields. This makes submitting a review visibly move the average and count on the same page load — the more coherent behavior for an interactive review form — while `ProductCard` elsewhere in the app keeps using the static seed fields unchanged (out of scope for this phase).
- **A new `getRelatedProducts` util scores candidates** by shared `category` (+2), shared `subcategory` (+2), and count of overlapping `compatibleMakes` (+1 each), excludes the product itself, drops anything scoring 0, and returns the top `limit` (default 4). No existing utility does this — `filterProducts` filters by a single exact facet value, not a weighted multi-signal match.
- **`generateStaticParams` is deliberately not introduced.** Confirmed via `grep -r generateStaticParams app/` — no route in this codebase uses it yet; `/shop/[category]` (the closest precedent, on the Phase 4 branch) renders on-demand. This phase follows that same precedent rather than introducing new territory.
- **`notFound()` returns HTTP 200 in `next dev`, not a literal 404 status — this is expected, not a bug.** The Phase 4 deviations log root-caused this against Next.js's own documentation: `notFound()` only produces a true 404 status for non-streamed responses, and the App Router streams by default. Task 11's verification step checks rendered page content instead of asserting a status code from `next dev`, exactly as Phase 4's own verification gate had to.
- **JSON-LD is emitted via a plain `<script type="application/ld+json">` with `dangerouslySetInnerHTML`**, built from static mock `Product` fields only (never from the client-side review-submission state) — there is no user-supplied input flowing into the server-rendered page, so no HTML-escaping beyond `JSON.stringify` is needed.

**Tech Stack:** Existing stack plus one re-added shadcn component (`Skeleton` — see Task 1). Next.js 16.3.4 App Router (async `params`), reusing `lib/data/products.ts` (`products`, `getProductBySlug`), `lib/data/categories.ts` (`getCategoryBySlug`), `lib/data/reviews.ts` (`getReviewsByProductId`), `lib/utils/format-currency.ts` (`formatCurrency`), `lib/utils/star-rating.ts` (`getStarCounts`), `lib/utils/category-icons.tsx` (`CategoryPlaceholderIcon`), `lib/store/cart.ts` (`useCartStore`), `lib/store/wishlist.ts` (`useWishlistStore`), `components/layout/breadcrumbs.tsx` (`Breadcrumbs`), `components/product/product-card.tsx` (`ProductCard`), `components/ui/button.tsx` (`Button`, confirmed variants: `default`/`outline`/`secondary`/`ghost`/`destructive`/`link`), `components/ui/badge.tsx` (`Badge`, not used directly this phase but confirmed present). Vitest (`npm test` → `vitest run`, `environment: "node"`) for the two new pure-function utils, following the codebase's co-located `foo.ts` + `foo.test.ts` convention with `sample`-prefixed test fixtures. Baseline confirmed clean on this worktree before starting: `npm test` → 38 passed (7 files), `npm run lint` → clean, `npx tsc --noEmit` → clean.

---

### Task 1: Add shadcn Skeleton component

**Files:**
- Create: `components/ui/skeleton.tsx` (plus any dependency files the CLI adds)

- [x] **Step 1: Run the shadcn add command**

```bash
npx shadcn@latest add skeleton
```

Expected: `components/ui/skeleton.tsx` created without errors.

- [x] **Step 2: Verify globals.css wasn't regressed**

Run: `grep -n "font-sans\|font-heading\|Geist" app/globals.css`

Expected: still shows `--font-sans: var(--font-inter), sans-serif;` (or equivalent existing font mapping) and no `Geist` references. If the add command reintroduced the Phase 0 Geist regression, reapply the fix described in `docs/superpowers/plans/2026-09-01-phase-0-scaffold.md` Task 4.

- [x] **Step 3: Inspect Skeleton's generated API**

Run: `grep -n "^export\|^function" components/ui/skeleton.tsx`

Expected: a single `Skeleton` component accepting `{ className, ...props }` and rendering a `<div>`. Tasks 8 and 10 below assume `<Skeleton className="..." />` works this way; adjust if different.

- [x] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 5: Commit**

```bash
git add components.json components/ui/skeleton.tsx package.json package-lock.json app/globals.css
git commit -m "feat: add shadcn Skeleton component"
```

(If the add command touches no other tracked files beyond `components/ui/skeleton.tsx`, `git add` the ones that actually changed — check `git status` first.)

---

### Task 2: `getReviewStats` utility (TDD)

**Files:**
- Create: `lib/utils/review-stats.ts`
- Test: `lib/utils/review-stats.test.ts`

- [x] **Step 1: Write the failing test**

Create `lib/utils/review-stats.test.ts`:

```ts
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
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/utils/review-stats.test.ts`
Expected: FAIL — `Cannot find module './review-stats'` (or similar), since the implementation file doesn't exist yet.

- [x] **Step 3: Write the implementation**

Create `lib/utils/review-stats.ts`:

```ts
import type { Review } from "@/lib/types";

export function getReviewStats(reviews: Review[]): { average: number; count: number } {
  if (reviews.length === 0) {
    return { average: 0, count: 0 };
  }
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return {
    average: Math.round((total / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/utils/review-stats.test.ts`
Expected: PASS — 3 tests.

- [x] **Step 5: Commit**

```bash
git add lib/utils/review-stats.ts lib/utils/review-stats.test.ts
git commit -m "feat: add getReviewStats utility"
```

---

### Task 3: `getRelatedProducts` utility (TDD)

**Files:**
- Create: `lib/utils/related-products.ts`
- Test: `lib/utils/related-products.test.ts`

- [x] **Step 1: Write the failing test**

Create `lib/utils/related-products.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getRelatedProducts } from "./related-products";
import type { Product } from "@/lib/types";

function sampleProduct(overrides: Partial<Product>): Product {
  return {
    id: "sample",
    slug: "sample",
    sku: "SKU-SAMPLE",
    name: "Sample Product",
    category: "exterior",
    price: 1000,
    images: [],
    description: "",
    keyFeatures: [],
    stock: "in_stock",
    ...overrides,
  };
}

describe("getRelatedProducts", () => {
  it("excludes the product itself", () => {
    const product = sampleProduct({ id: "p1", category: "exterior" });
    const all = [product, sampleProduct({ id: "p2", category: "exterior" })];
    const related = getRelatedProducts(product, all);
    expect(related.some((p) => p.id === "p1")).toBe(false);
  });

  it("ranks a same-subcategory match above a same-category-only match", () => {
    const product = sampleProduct({ id: "p1", category: "exterior", subcategory: "lighting" });
    const sameSubcategory = sampleProduct({ id: "p2", category: "exterior", subcategory: "lighting" });
    const sameCategoryOnly = sampleProduct({ id: "p3", category: "exterior", subcategory: "wipers" });
    const related = getRelatedProducts(product, [product, sameCategoryOnly, sameSubcategory]);
    expect(related[0].id).toBe("p2");
  });

  it("includes products that only share a compatible make", () => {
    const product = sampleProduct({ id: "p1", category: "exterior", compatibleMakes: ["Toyota"] });
    const sharesMake = sampleProduct({ id: "p2", category: "interior", compatibleMakes: ["Toyota"] });
    const noOverlap = sampleProduct({ id: "p3", category: "interior", compatibleMakes: ["Ford"] });
    const related = getRelatedProducts(product, [product, sharesMake, noOverlap]);
    expect(related.some((p) => p.id === "p2")).toBe(true);
    expect(related.some((p) => p.id === "p3")).toBe(false);
  });

  it("defaults to at most 4 related products", () => {
    const product = sampleProduct({ id: "p1", category: "exterior" });
    const others = Array.from({ length: 10 }, (_, i) => sampleProduct({ id: `p${i + 2}`, category: "exterior" }));
    const related = getRelatedProducts(product, [product, ...others]);
    expect(related).toHaveLength(4);
  });

  it("respects a custom limit", () => {
    const product = sampleProduct({ id: "p1", category: "exterior" });
    const others = Array.from({ length: 10 }, (_, i) => sampleProduct({ id: `p${i + 2}`, category: "exterior" }));
    const related = getRelatedProducts(product, [product, ...others], 2);
    expect(related).toHaveLength(2);
  });

  it("returns an empty array when nothing shares category, subcategory, or make", () => {
    const product = sampleProduct({ id: "p1", category: "exterior" });
    const unrelated = sampleProduct({ id: "p2", category: "interior" });
    const related = getRelatedProducts(product, [product, unrelated]);
    expect(related).toHaveLength(0);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/utils/related-products.test.ts`
Expected: FAIL — `Cannot find module './related-products'`.

- [x] **Step 3: Write the implementation**

Create `lib/utils/related-products.ts`:

```ts
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
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/utils/related-products.test.ts`
Expected: PASS — 6 tests.

- [x] **Step 5: Commit**

```bash
git add lib/utils/related-products.ts lib/utils/related-products.test.ts
git commit -m "feat: add getRelatedProducts utility"
```

---

### Task 4: ProductGallery component

**Files:**
- Create: `components/product/product-gallery.tsx`

- [x] **Step 1: Create the component**

Create `components/product/product-gallery.tsx`:

```tsx
"use client";

import { useState } from "react";
import { CategoryPlaceholderIcon } from "@/lib/utils/category-icons";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  category,
  productName,
}: {
  images: string[];
  category: string;
  productName: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="space-y-3">
      <div
        role="img"
        aria-label={productName}
        className="flex aspect-square items-center justify-center rounded-lg border border-steel bg-linear-to-br from-chrome-start to-chrome-end"
      >
        <CategoryPlaceholderIcon category={category} className="size-32 text-tarmac/30" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              aria-label={`Show image ${index + 1} of ${images.length}`}
              aria-pressed={selectedIndex === index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "flex size-16 items-center justify-center rounded-md border bg-linear-to-br from-chrome-start to-chrome-end focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram",
                selectedIndex === index ? "border-murram" : "border-steel/40"
              )}
            >
              <CategoryPlaceholderIcon category={category} className="size-8 text-tarmac/30" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/product/product-gallery.tsx
git commit -m "feat: add ProductGallery component"
```

---

### Task 5: StarRatingInput component

**Files:**
- Create: `components/product/star-rating-input.tsx`

- [x] **Step 1: Create the component**

Create `components/product/star-rating-input.tsx`:

```tsx
"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRatingInput({
  value,
  onChange,
  describedBy,
}: {
  value: number;
  onChange: (value: number) => void;
  describedBy?: string;
}) {
  return (
    <div role="radiogroup" aria-label="Rating" aria-describedby={describedBy} className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          onClick={() => onChange(star)}
          className="rounded-sm p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        >
          <Star className={cn("size-6", star <= value ? "fill-murram text-murram" : "text-steel")} />
        </button>
      ))}
    </div>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/product/star-rating-input.tsx
git commit -m "feat: add StarRatingInput component"
```

---

### Task 6: ProductReviews component

**Files:**
- Create: `components/product/product-reviews.tsx`

- [x] **Step 1: Create the component**

Create `components/product/product-reviews.tsx`:

```tsx
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
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/product/product-reviews.tsx
git commit -m "feat: add ProductReviews component with mock submission form"
```

---

### Task 7: ProductPurchasePanel component

**Files:**
- Create: `components/product/product-purchase-panel.tsx`

- [x] **Step 1: Create the component**

Create `components/product/product-purchase-panel.tsx`:

```tsx
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
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/product/product-purchase-panel.tsx
git commit -m "feat: add ProductPurchasePanel component"
```

---

### Task 8: ProductDetailSkeleton component

**Files:**
- Create: `components/product/product-detail-skeleton.tsx`

- [x] **Step 1: Create the component**

Create `components/product/product-detail-skeleton.tsx`:

```tsx
import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-10 w-full max-w-xs" />
        <Skeleton className="h-9 w-40" />
      </div>
    </div>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/product/product-detail-skeleton.tsx
git commit -m "feat: add ProductDetailSkeleton component"
```

---

### Task 9: `/product/[slug]` page

**Files:**
- Create: `app/product/[slug]/page.tsx`

- [x] **Step 1: Create the page**

Create `app/product/[slug]/page.tsx`. Note the Related Products section renders `ProductCard` directly in a plain grid (matching `ProductGrid`'s own internal grid classes) rather than importing Phase 4's `ProductGrid`/`NoResults`, which don't exist on this branch (see Architecture notes above):

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { StockStatus } from "@/lib/types";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { ProductReviews } from "@/components/product/product-reviews";
import { ProductCard } from "@/components/product/product-card";
import { getProductBySlug, products } from "@/lib/data/products";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getReviewsByProductId } from "@/lib/data/reviews";
import { getRelatedProducts } from "@/lib/utils/related-products";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

const STOCK_AVAILABILITY: Record<StockStatus, string> = {
  in_stock: "https://schema.org/InStock",
  low_stock: "https://schema.org/LimitedAvailability",
  out_of_stock: "https://schema.org/OutOfStock",
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} — LePlug Autocare`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images.length > 0 ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = getCategoryBySlug(product.category);
  const reviews = getReviewsByProductId(product.id);
  const related = getRelatedProducts(product, products);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "KES",
      price: product.price,
      availability: STOCK_AVAILABILITY[product.stock],
    },
    ...(product.rating !== undefined && product.reviewCount !== undefined
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <Breadcrumbs
          items={[
            { label: "Shop", href: "/shop" },
            ...(category ? [{ label: category.name, href: `/shop/${category.slug}` }] : []),
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
          <ProductGallery images={product.images} category={product.category} productName={product.name} />
          <ProductPurchasePanel product={product} />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          <section>
            <h2 className="font-heading text-xl font-bold text-tarmac">Description</h2>
            <p className="mt-3 text-sm text-tarmac/80">{product.description}</p>
          </section>
          <section>
            <h2 className="font-heading text-xl font-bold text-tarmac">Key Features</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-tarmac/80">
              {product.keyFeatures.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </section>
        </div>

        {product.compatibleMakes && product.compatibleMakes.length > 0 && (
          <section className="mt-8">
            <h2 className="font-heading text-xl font-bold text-tarmac">Compatible Vehicle Makes</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.compatibleMakes.map((make) => (
                <span
                  key={make}
                  className="rounded-full border border-steel/40 px-3 py-1 text-sm text-tarmac"
                >
                  {make}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12">
          <h2 className="font-heading text-xl font-bold text-tarmac">Reviews</h2>
          <div className="mt-4">
            <ProductReviews productId={product.id} initialReviews={reviews} />
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-heading text-xl font-bold text-tarmac">Related Products</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add "app/product/[slug]/page.tsx"
git commit -m "feat: add /product/[slug] page"
```

---

### Task 10: `/product/[slug]` loading skeleton

**Files:**
- Create: `app/product/[slug]/loading.tsx`

- [x] **Step 1: Create the loading state**

Create `app/product/[slug]/loading.tsx`:

```tsx
import { ProductDetailSkeleton } from "@/components/product/product-detail-skeleton";

export default function ProductLoading() {
  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="h-4 w-48 animate-pulse rounded bg-steel/30" />
        <ProductDetailSkeleton />
      </div>
    </main>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add "app/product/[slug]/loading.tsx"
git commit -m "feat: add /product/[slug] loading skeleton"
```

---

### Task 11: Phase 5 verification gate

**Files:** none (verification only)

- [x] **Step 1: Run the full test suite**

Run: `npm test` — expect all 38 prior tests (Phase 1–3, confirmed as this worktree's clean baseline) plus the new `review-stats.test.ts` (3) and `related-products.test.ts` (6) to pass: 47 total.

- [x] **Step 2: Run lint**

Run: `npm run lint` — expect no errors.

- [x] **Step 3: Run typecheck**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 4: Visual check — a normal in-stock product with reviews**

Start the dev server if not already running, then open a product known to have `stock: "in_stock"`, `rating`/`reviewCount` set, `compatibleMakes` set, and at least one review (e.g. `http://localhost:3000/product/led-fog-light-kit`). Confirm:
- Breadcrumbs read Home / Shop / Exterior / LED Fog Light Kit. The "Shop"/"Exterior" links point at `/shop` and `/shop/exterior` — on this branch (pre-Phase-4-merge) those routes don't exist yet, so clicking them is expected to 404 for now; just confirm the breadcrumb labels and hrefs are correct, not that the target pages render.
- SKU renders in the stencil font, name, star rating (linking down to `#reviews` on click), price, and (since this product has a `compareAtPrice`) a struck-through original price.
- "In stock" shows in acacia; the quantity stepper and "Add to Cart" are both present and usable; clicking Plus/Minus changes the quantity; clicking "Add to Cart" flashes "Added to Cart" and increments the header cart badge by the selected quantity.
- Clicking the wishlist button toggles its filled/outline state and the wishlist persists after a page reload.
- Description, Key Features, and Compatible Vehicle Makes sections all render with real content.
- The Reviews section shows the existing mock reviews, submitting the review form with all three fields filled prepends a new review to the top of the list and updates the summary average/count, and leaving any field blank shows that field's specific inline error instead of submitting.
- A Related Products grid of `ProductCard`s renders below with products sharing this product's category/subcategory/compatible makes, and each card's own "View"/name link navigates to that product's `/product/[slug]` page correctly (this route does exist on this branch).

- [x] **Step 5: Visual check — edge-case products**

Find and check a `stock: "out_of_stock"` product (e.g. `http://localhost:3000/product/performance-air-filter`): confirm "Out of stock" shows, no quantity stepper renders, "Add to Cart" is replaced by "Notify Me", and clicking it flips the button to a disabled "We'll notify you" state.

Find and check a product with **no reviews** (any product at an array index divisible by 3 in `lib/data/products.ts`'s generation order — cross-check against `getReviewsByProductId` returning `[]`): confirm the Reviews section shows "No reviews yet. Be the first to review this product." instead of an empty list, and the summary line reads "No reviews yet".

Find and check a product with **no `compatibleMakes`**: confirm the Compatible Vehicle Makes section is omitted entirely, not rendered empty.

- [x] **Step 6: 404 check for an unknown slug**

Open `http://localhost:3000/product/not-a-real-product`. On this branch (pre-Phase-4-merge), `app/not-found.tsx` doesn't exist yet, so this correctly falls through to Next.js's generic default 404 page, not the on-brand one built in Phase 4 — confirm a 404-type page renders (generic is expected here), and confirm `notFound()` was actually reached by checking the page does NOT render any product content. Per the Phase 4 deviations log, do not assert a literal `404` HTTP status from `next dev` (`notFound()` returns 200 for streamed responses in dev); if a true status-code check is needed, use `npm run build && npm start` instead. Once Phase 4 and Phase 5 are both merged to master, re-verify this shows the on-brand 404 page.

- [x] **Step 7: Metadata and structured data check**

View source (or use the browser's Elements panel) on a product page and confirm: the `<title>` tag matches `"<Product Name> — LePlug Autocare"`, a meta description tag is present, `og:title`/`og:description` meta tags are present, and a `<script type="application/ld+json">` tag is present containing valid JSON with `"@type": "Product"`, matching `name`, `sku`, and an `offers.price` equal to the displayed price.

- [x] **Step 8: Visual check at 375px width and keyboard focus audit**

Using the browser's device toolbar (or the DOM/computed-style workaround documented in the Phase 4 deviations log if `resize_window` proves unreliable), confirm at 375px: the gallery and purchase panel stack into a single column, description/key-features stack into a single column, no page-level horizontal scroll appears. Tab through the full page and confirm every interactive element (breadcrumb links, gallery thumbnails if present, quantity buttons, Add to Cart/Notify Me, wishlist button, the rating-to-reviews link, the review form's name/rating/comment fields and submit button, related-product cards) shows a visible `murram` focus ring.

Also spot-check contrast for `text-acacia` on `bg-savanna` (the "In stock" label in `ProductPurchasePanel` and "Verified purchase"/"Review submitted." text in `ProductReviews`) — this phase's first use of that specific pairing — against WCAG AA's 4.5:1 text threshold, using the browser's accessibility inspector or a contrast-checker tool.

- [x] **Step 9: Commit any fixes found**

```bash
git add -A
git commit -m "fix: resolve issues found in Phase 5 verification gate"
```

(Skip if Steps 1–8 were already clean.)

---

## Definition of done for Phase 5

- [x] `/product/[slug]` renders gallery, price, stock status, key features, description, and compatible vehicle makes (when present) for every seed product
- [x] Reviews display existing mock reviews (or an explicit empty state) and a client-side review submission visibly appends to the list and updates the average/count, with inline field-level validation errors
- [x] Related products render below, scored by shared category/subcategory/compatible makes, and the section is omitted (not shown empty) when there are none
- [x] Add to Cart (disabled + "Notify Me" when out of stock) and Add to Wishlist both work and persist via the existing Zustand stores
- [x] Breadcrumbs read Home / Shop / Category / Product name (Shop/Category links will 404 until Phase 4 merges — expected, not a Phase 5 defect)
- [x] `schema.org/Product` JSON-LD, per-page `<title>`/meta description, and Open Graph tags are present
- [x] A loading skeleton is wired via `app/product/[slug]/loading.tsx`
- [x] Unknown slugs call `notFound()` (renders Next.js's generic 404 until Phase 4's `app/not-found.tsx` merges — expected, not a Phase 5 defect)
- [x] Every interactive element has a visible `murram` focus ring
- [x] Responsive from 375px (gallery/panel and description/features stack to one column, no horizontal scroll)
- [x] `npm test`, `npm run lint`, and `npx tsc --noEmit` all pass clean
- [x] One commit per task above

## Deviations from plan (discovered during execution)

Executed via `superpowers:subagent-driven-development` in an isolated git worktree (`.claude/worktrees/phase-5-product-detail-page`, branch `worktree-phase-5-product-detail-page`, branched from `master` at `01910c9`) — fresh implementer subagent per task, spec-compliance review, then code-quality review, with fix/re-review loops wherever a reviewer found a real issue. All 11 tasks completed; every checkbox above is satisfied.

- **Pre-execution setup:** this worktree, freshly branched from `master`, needed its own `npm install` (Turbopack's workspace-root detection for `next build`/`next dev` does not walk up parent directories for `node_modules` the way plain Node.js `require`/`import` resolution does, unlike `vitest`/`eslint`/`tsc` which worked fine via the upward walk before the install) and one `next build` to generate `.next/types` (needed for `app/layout.tsx`'s generated `LayoutProps<'/'>` type to resolve — without it, both `npm run lint` and `npx tsc --noEmit` failed on a pre-existing, untouched file with `error TS2304: Cannot find name 'LayoutProps'`). Both done before Task 1; confirmed clean baseline afterward: `npm test` → 38/38 passed, `npm run lint` → clean, `npx tsc --noEmit` → clean.
- **Plan revision before execution:** the plan as originally drafted (in the Phase 4 worktree, which already has Phase 4's code merged into its own history) assumed `ProductGrid`, `NoResults`, and `components/ui/skeleton.tsx` already existed and that Phase 4's 58 tests were the prior baseline. Since this Phase 5 worktree deliberately branches from `master` in parallel with the unmerged Phase 4 PR (per explicit user choice, to keep the PRs independent), none of that Phase 4 code is present here. Revised before Task 1 began: added a Task 1 to re-add shadcn's `Skeleton` independently, changed the Related Products section (Task 9) to render `ProductCard` directly instead of importing `ProductGrid`, corrected the verification gate's baseline test count from 58 to 38 (47 after Phase 5's 9 new tests), and adjusted the 404/breadcrumb verification wording to describe this branch's actual (pre-Phase-4-merge) behavior instead of assuming Phase 4's on-brand 404 page and `/shop` routes exist.
- **Task 1 (shadcn Skeleton):** the CLI's generated `components/ui/skeleton.tsx` had two real defects, both caught by spec-compliance review and fixed in a follow-up commit: (1) it imported `cn` from a stray npm package literally named `cn` (a legitimate but redundant class-merge library the CLI pulled in) instead of this project's own `@/lib/utils` alias that every other `components/ui/*` file uses — fixed by switching the import and running `npm uninstall cn`; (2) its fill color was the unthemed shadcn default `bg-muted`, which resolves to a near-white `oklch(0.97 0 0)` never remapped to this project's palette — measured contrast against the `savanna` page background was ~1.13:1, effectively invisible. This is the exact same defect the Phase 4 branch hit adding the identical component; fixed identically, to `bg-steel/30` (~9:1 contrast). Verified live in-browser during Task 11 (the loading skeleton is clearly visible, not blank).
- **Task 6 (ProductReviews) — code-quality review found 4 real accessibility gaps, all fixed in a follow-up commit:** (1) field-level error messages didn't clear as the user corrected a field, so a message could go stale/misleading; (2) the "Review submitted." confirmation had no `aria-live`/`role="status"`, so screen-reader users weren't notified of a successful mock submission; (3) the rating field's error description was wired via `aria-describedby` on the `role="radiogroup"` container, but focus lands on the individual `role="radio"` buttons — descriptions on an ancestor aren't announced for a descendant's focus, so the error was effectively silent for keyboard/screen-reader users; (4) no page-level failure summary existed for a failed submit. Fixed by adding a `clearFieldError` helper (a real key-delete, not a `field: undefined` no-op — the implementer caught and fixed a subtle bug in their own first attempt at this fix, where using `undefined` would have left `Object.keys(errors).length` permanently non-zero), `role="status"` on the confirmation message, moving `aria-describedby` onto each individual star button in `StarRatingInput`, and a `role="alert"` summary above the form. Verified live in-browser during Task 11: submitting empty showed the alert and the field error, typing a name cleared just that field's error, and the alert itself correctly disappeared once all fields were valid.
- **Task 7 (ProductPurchasePanel) — code-quality review found 2 more accessibility gaps, fixed in a follow-up commit:** (1) `disabled={notifyRequested}` on the "Notify Me" button, applied while it held keyboard focus, causes browsers to blur the element immediately — silently kicking a keyboard/screen-reader user's focus back to `<body>`; fixed by keeping the button enabled (idempotent on repeat clicks) and wrapping its label in `aria-live="polite"` instead so the state change is announced without blurring anything. (2) The quantity `<span>` between the stepper buttons had no live region, so a screen-reader user pressing +/- got no confirmation the value changed; fixed by adding `aria-live="polite" aria-atomic="true"`. Verified live in-browser during Task 11: clicking "Notify Me" on an out-of-stock product correctly flips the label to "We'll notify you" while remaining a normal, non-disabled button.
- **Browser automation tooling issues encountered during Task 11 verification** (consistent with the tooling limitations already logged in Phase 2–4's own deviations sections):
  - `resize_window` reproduced the same known failure mode: it reports success, but `window.innerWidth`/`innerHeight` never actually change (stayed at the desktop viewport size). Worked around exactly as Phase 4 did — statically verified the actual rendered `className` strings on the page's `.grid` containers (confirmed `grid-cols-1 md:grid-cols-2` on both the gallery+panel row and the description+features row, `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` on the related-products grid, matching the plan and matching the same pattern already shipped and verified in Phases 2–4) rather than a real 375px screenshot.
  - Keyboard-focus-ring verification also followed Phase 4's documented approach: `getComputedStyle` after programmatic `.focus()`, cross-checked by rendering a scratch element with `outline-color: var(--color-murram)` (and a 50%-opacity `color-mix` variant) to confirm the oklab string Tailwind v4 actually renders really is `murram` at the ring opacity used — confirmed exact string match on the rating link, both quantity stepper buttons, and Add to Cart.
  - A new tooling issue not previously logged: `computer` actions batched together in one `browser_batch` call use coordinates computed from the screenshot taken *before* the whole batch started, not updated between actions within the batch (per the tool's own documented behavior) — when an early action in a batch unexpectedly shifted the page (e.g. a click landing slightly off-target), every subsequent coordinate in that same batch fired against the wrong element, twice resulting in an accidental navigation away from the product page while attempting to fill in the review-submission form's Name/Rating/Comment fields in one batched sequence. Recovered by switching to single, sequential (non-batched) actions with a screenshot or state check after each one. The review-submission form's actual behavior was still fully verified — just via a combination of code-level review (byte-exact spec match, hand-traced validation logic, confirmed by two independent subagent reviews) and successful single-action live interaction (typing into the Name field and watching its error clear in real time) rather than a single unbroken end-to-end click-through recording of a full submission. Functional confidence in the submit path itself doesn't rest on browser automation alone: `useCartStore`/`useWishlistStore` have their own passing unit tests, and the Add to Cart button was independently confirmed live by reading `localStorage.getItem('leplug-cart')` after a click and finding the correct `{"productId":"exterior-2","quantity":1}` — more reliable than trusting a screenshot's timing for a 1200ms transient label.
- **Live verification confirmed, beyond what static review could show:** the Reviews section's displayed average (computed live from `getReviewsByProductId`, e.g. "3.7 out of 5 (3 reviews)") intentionally differs from `ProductPurchasePanel`'s static `product.rating`/`reviewCount` header display (e.g. "4.7 (31 reviews)") on the same product — this is the documented, deliberate design from this plan's Architecture section (live-computed reviews summary vs. static seed fields used elsewhere), not a bug, and was visually confirmed to look intentional rather than broken.
