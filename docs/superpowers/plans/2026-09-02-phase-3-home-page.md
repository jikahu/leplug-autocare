# Phase 3 — Home Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build the Home page per CLAUDE.md §4.1: hero with the single diagonal stripe wipe-in, category tiles, bestsellers rail, "shop by vehicle make" strip (swappable logo/text-fallback), trust signals, and newsletter signup — composed into `app/page.tsx`, replacing the Phase 0 placeholder.

**Architecture:** Each homepage section is its own presentational component under `components/home/` (mirrors the `/cart`, `/account` per-page grouping already established by CLAUDE.md §15). A new `components/product/product-card.tsx` is introduced now because the Bestsellers rail needs it and Phase 4/5 will reuse it unchanged. **No product photography exists yet** (CLAUDE.md §16 lists real photos as a pre-launch input, and Phase 1 seeded `images` paths that point to files which were never created). Rather than render broken `next/image` requests, product and category visuals this phase use lucide icons over a `chrome` gradient background (an explicitly sanctioned use of that token per CLAUDE.md §3: "Premium metallic touches on badges/icon backgrounds"). `next/image` remains the project standard and will be wired to real files once §16 photography and the Vehicle Make logo assets arrive — the `VehicleMakeStrip` component is built now with a `logoSrc?: string` slot per make specifically so that swap requires no structural change (CLAUDE.md §3: "swappable per-brand"). The stripe wipe-in is pure CSS (a `@keyframes` rule plus Tailwind arbitrary-value classes, gated by the `motion-safe:`/`motion-reduce:` variants) — no animation library needed. Per the roadmap's Phase 9 scope ("Metadata API + OG tags + sitemap.xml/robots.txt across Home/Shop/Product"), this phase adds only the page's `<title>`/description via the Metadata API; full OG tags/schema/sitemap are Phase 9's batched cross-page pass.

**Tech Stack:** Existing stack only — Zustand stores from Phase 2 (`useCartStore`, `useWishlistStore`), `lib/data/products.ts` (`products`, `ALL_VEHICLE_MAKES`), `lib/data/categories.ts` (`categories`), `lib/utils/sort-products.ts`, `lib/utils/format-currency.ts`, shadcn `Button` (already themed) plus a new shadcn `Badge`. Confirmed in this session: Tailwind v4.3.3 supports both `bg-linear-to-br` and `bg-gradient-to-br` (using `bg-linear-to-br`, the current canonical name), arbitrary properties like `[clip-path:inset(0_0_100%_0)]`, and the `motion-safe:`/`motion-reduce:` variants compile to the correct `@media (prefers-reduced-motion: ...)` blocks. Button/NavigationMenuLink in this codebase use Base UI's `render` prop (not Radix's `asChild`) to polymorphically render as a `next/link` — confirmed by the existing `components/layout/category-bar.tsx`. Confirmed lucide-react v1.39.0 exports used below: `CarFront`, `Sofa`, `Wrench`, `SprayCan`, `Radio`, `LifeBuoy`, `Package`, `Heart`, `Star`, `StarHalf`, `Truck`, `ShieldCheck`, `Smartphone`.

---

### Task 1: Add shadcn Badge component

**Files:**
- Create: `components/ui/badge.tsx` (plus any dependency files the CLI adds)

- [x] **Step 1: Run the shadcn add command**

```bash
npx shadcn@latest add badge
```

Expected: `components/ui/badge.tsx` created without errors.

- [x] **Step 2: Verify globals.css wasn't regressed**

Run: `grep -n "font-sans\|font-heading\|Geist" app/globals.css`

Expected: still shows `--font-sans: var(--font-inter), sans-serif;` and no `Geist` references. If the add command reintroduced the Phase 0 Geist regression, reapply the fix described in `docs/superpowers/plans/2026-09-01-phase-0-scaffold.md` Task 4.

- [x] **Step 3: Inspect the generated component's API**

Run: `grep -n "^export\|function Badge" components/ui/badge.tsx`

Note the exact props it accepts (typically `{ className, variant, ...props }` rendering a `<span>`). Task 4 below assumes `<Badge className="...">{children}</Badge>` works; adjust that usage if the generated signature differs.

- [x] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 5: Commit**

```bash
git add components.json components/ui/badge.tsx package.json package-lock.json app/globals.css
git commit -m "feat: add shadcn Badge component"
```

---

### Task 2: Star-rating utility (TDD)

**Files:**
- Create: `lib/utils/star-rating.ts`
- Test: `lib/utils/star-rating.test.ts`

- [x] **Step 1: Write the failing test**

Create `lib/utils/star-rating.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getStarCounts } from "./star-rating";

describe("getStarCounts", () => {
  it("returns all full stars for a perfect rating", () => {
    expect(getStarCounts(5)).toEqual({ full: 5, half: false, empty: 0 });
  });

  it("returns a half star for a .5 rating", () => {
    expect(getStarCounts(4.5)).toEqual({ full: 4, half: true, empty: 0 });
  });

  it("rounds down to the nearest half star", () => {
    expect(getStarCounts(4.1)).toEqual({ full: 4, half: false, empty: 1 });
  });

  it("rounds up to the nearest half star", () => {
    expect(getStarCounts(4.3)).toEqual({ full: 4, half: true, empty: 0 });
  });

  it("returns all empty stars for a zero rating", () => {
    expect(getStarCounts(0)).toEqual({ full: 0, half: false, empty: 5 });
  });

  it("clamps ratings above 5", () => {
    expect(getStarCounts(6)).toEqual({ full: 5, half: false, empty: 0 });
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/utils/star-rating.test.ts`

Expected: FAIL — `Cannot find module './star-rating'`.

- [x] **Step 3: Write minimal implementation**

Create `lib/utils/star-rating.ts`:

```ts
export type StarCounts = { full: number; half: boolean; empty: number };

export function getStarCounts(rating: number): StarCounts {
  const clamped = Math.max(0, Math.min(5, rating));
  const rounded = Math.round(clamped * 2) / 2;
  const full = Math.floor(rounded);
  const half = rounded % 1 !== 0;
  const empty = 5 - full - (half ? 1 : 0);
  return { full, half, empty };
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/utils/star-rating.test.ts`

Expected: PASS (6/6).

- [x] **Step 5: Commit**

```bash
git add lib/utils/star-rating.ts lib/utils/star-rating.test.ts
git commit -m "feat: add getStarCounts rating-to-stars utility"
```

---

### Task 3: Category-to-icon mapping utility

**Files:**
- Create: `lib/utils/category-icons.ts`

- [x] **Step 1: Create the utility**

Create `lib/utils/category-icons.ts`:

```ts
import { CarFront, Sofa, Wrench, SprayCan, Radio, LifeBuoy, Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  exterior: CarFront,
  interior: Sofa,
  "performance-service-parts": Wrench,
  "car-care-detailing": SprayCan,
  "electronics-security": Radio,
  safety: LifeBuoy,
};

export function getCategoryIcon(categoryId: string): LucideIcon {
  return CATEGORY_ICONS[categoryId] ?? Package;
}
```

This mapping covers exactly the six category ids from `lib/data/categories.ts` (CLAUDE.md §6), with `Package` as the fallback for any unmapped id.

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add lib/utils/category-icons.ts
git commit -m "feat: add category-to-icon mapping utility"
```

---

### Task 4: ProductCard component

**Files:**
- Create: `components/product/product-card.tsx`

- [x] **Step 1: Create the component**

Create `components/product/product-card.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Star, StarHalf } from "lucide-react";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { formatCurrency } from "@/lib/utils/format-currency";
import { getStarCounts } from "@/lib/utils/star-rating";
import { getCategoryIcon } from "@/lib/utils/category-icons";

export function ProductCard({ product }: { product: Product }) {
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(product.id));
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const CategoryIcon = getCategoryIcon(product.category);
  const stars = product.rating ? getStarCounts(product.rating) : null;
  const isOutOfStock = product.stock === "out_of_stock";

  function handleAddToCart() {
    addItem(product.id);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <div className="flex w-full flex-col">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-steel bg-linear-to-br from-chrome-start to-chrome-end">
        {product.tags && product.tags.length > 0 && (
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.tags.map((tag) => (
              <Badge
                key={tag}
                className={
                  tag === "Sale"
                    ? "bg-murram text-savanna"
                    : "border border-tarmac/20 bg-savanna text-tarmac"
                }
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
          className="absolute right-2 top-2 rounded-full bg-tarmac/70 p-1.5 text-savanna focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        >
          <Heart className={`size-4 ${isWishlisted ? "fill-murram text-murram" : ""}`} aria-hidden="true" />
        </button>
        <Link
          href={`/product/${product.slug}`}
          className="flex h-full w-full items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram focus-visible:ring-inset"
        >
          <CategoryIcon className="size-16 text-tarmac/30" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-1">
        {product.brand && (
          <span className="text-xs font-medium uppercase tracking-wide text-steel">
            {product.brand}
          </span>
        )}
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 rounded-sm text-sm font-medium text-tarmac hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        >
          {product.name}
        </Link>

        {stars && (
          <div className="flex items-center gap-1" aria-label={`Rated ${product.rating} out of 5`}>
            {Array.from({ length: stars.full }).map((_, index) => (
              <Star key={`full-${index}`} className="size-3.5 fill-murram text-murram" aria-hidden="true" />
            ))}
            {stars.half && <StarHalf className="size-3.5 fill-murram text-murram" aria-hidden="true" />}
            {Array.from({ length: stars.empty }).map((_, index) => (
              <Star key={`empty-${index}`} className="size-3.5 text-steel" aria-hidden="true" />
            ))}
            {product.reviewCount !== undefined && (
              <span className="text-xs text-steel">({product.reviewCount})</span>
            )}
          </div>
        )}

        <div className="mt-1 flex items-center gap-2">
          <span className="font-semibold text-murram">{formatCurrency(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-steel line-through">
              {formatCurrency(product.compareAtPrice)}
            </span>
          )}
        </div>

        {product.stock === "low_stock" && (
          <span className="text-xs font-medium text-murram">Low stock</span>
        )}
        {isOutOfStock && <span className="text-xs font-medium text-steel">Out of stock</span>}

        <Button type="button" onClick={handleAddToCart} disabled={isOutOfStock} className="mt-2 w-full">
          {isOutOfStock ? "Out of Stock" : justAdded ? "Added" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
```

Note: `stock` is a fixed enum (`in_stock`/`low_stock`/`out_of_stock`) per CLAUDE.md §7, with no numeric count field — CLAUDE.md §9's "Only 3 left" example copy assumes a count this data model doesn't carry, so the low-stock indicator uses the honest generic label "Low stock" rather than inventing a number. The out-of-stock "notify me" affordance from §9 is full-size UI better suited to the Product Detail Page (Phase 5); this compact card satisfies "don't hide the product" by disabling (not hiding) the button and labeling it "Out of Stock".

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`. If `Badge` doesn't accept a plain `className` override the way this code assumes (see Task 1 Step 3), adjust the tag-badge `className` usage here to match its actual API.

Expected: no errors.

- [x] **Step 3: Commit**

```bash
git add components/product/product-card.tsx
git commit -m "feat: add ProductCard component with cart and wishlist actions"
```

---

### Task 5: Hero section with signature stripe wipe-in

**Files:**
- Create: `components/home/hero-section.tsx`
- Modify: `app/globals.css`

- [x] **Step 1: Add the stripe-wipe keyframes**

In `app/globals.css`, add this block after the existing `@layer base { ... }` block at the end of the file:

```css
@keyframes stripe-wipe {
  from {
    clip-path: inset(0 0 100% 0);
  }
  to {
    clip-path: inset(0 0 0% 0);
  }
}
```

- [x] **Step 2: Create the component**

Create `components/home/hero-section.tsx`:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-tarmac text-savanna">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.2fr_1fr] md:items-center md:px-8 md:py-24">
        <div className="flex flex-col items-start gap-6">
          <h1 className="font-heading text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
            Your Plug for Premium Car Care
          </h1>
          <p className="max-w-md text-base text-savanna/85 sm:text-lg">
            Parts, accessories, and detailing for Nairobi&apos;s drivers — real fit, real quality,
            ordered online.
          </p>
          <Button render={<Link href="/shop" />} size="lg">
            Shop Now
          </Button>
        </div>

        <div className="relative hidden h-64 md:block md:h-80 lg:h-96" aria-hidden="true">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "repeating-linear-gradient(-24deg, var(--color-steel) 0px, var(--color-steel) 2px, transparent 2px, transparent 28px)",
            }}
          />
          <div className="absolute inset-y-0 right-[18%] w-20 -skew-x-12 bg-murram [clip-path:inset(0_0_100%_0)] motion-safe:[animation:stripe-wipe_900ms_ease-out_forwards] motion-reduce:[clip-path:inset(0_0_0_0)] lg:w-28" />
        </div>
      </div>
    </section>
  );
}
```

This is the CLAUDE.md §3 signature moment: one diagonal `murram` stripe, animated in once on load via `clip-path`, disabled under `prefers-reduced-motion` (shown fully revealed immediately instead). The faint repeating diagonal lines behind it are a low-opacity, purely decorative texture nodding to the Safari Rally red-earth-road concept — distinct from, and secondary to, the single stripe. Per CLAUDE.md §3, this stripe motif is not reused anywhere else on the page.

- [x] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`. If `Button` does not accept a `render` prop the way `components/layout/category-bar.tsx` uses it on `NavigationMenuLink`, check `components/ui/button.tsx`'s prop types and adjust to whatever polymorphic-render pattern it actually supports.

Expected: no errors.

- [x] **Step 4: Commit**

```bash
git add components/home/hero-section.tsx app/globals.css
git commit -m "feat: add homepage Hero section with signature stripe wipe-in"
```

---

### Task 6: Category Tiles section

**Files:**
- Create: `components/home/category-tiles.tsx`

- [x] **Step 1: Create the component**

Create `components/home/category-tiles.tsx`:

```tsx
import Link from "next/link";
import { categories } from "@/lib/data/categories";
import { getCategoryIcon } from "@/lib/utils/category-icons";

export function CategoryTiles() {
  return (
    <section className="bg-savanna">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h2 className="font-heading text-2xl font-black text-tarmac sm:text-3xl">
          Shop by Category
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.id);
            return (
              <Link
                key={category.id}
                href={`/shop/${category.slug}`}
                className="group flex flex-col gap-3 rounded-lg border border-steel/40 bg-white/40 p-5 transition-colors hover:border-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-linear-to-br from-chrome-start to-chrome-end">
                  <Icon className="size-6 text-tarmac/70" aria-hidden="true" />
                </span>
                <span className="font-heading text-lg font-bold text-tarmac group-hover:text-murram">
                  {category.name}
                </span>
                <span className="text-sm text-tarmac/70">{category.description}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/home/category-tiles.tsx
git commit -m "feat: add homepage Category Tiles section"
```

---

### Task 7: Bestsellers rail

**Files:**
- Create: `components/home/bestsellers-rail.tsx`

- [x] **Step 1: Create the component**

Create `components/home/bestsellers-rail.tsx`:

```tsx
import { products } from "@/lib/data/products";
import { sortProducts } from "@/lib/utils/sort-products";
import { ProductCard } from "@/components/product/product-card";

export function BestsellersRail() {
  const bestsellers = sortProducts(
    products.filter((product) => product.tags?.includes("Bestseller")),
    "rating"
  ).slice(0, 8);

  if (bestsellers.length === 0) return null;

  return (
    <section className="bg-savanna">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h2 className="font-heading text-2xl font-black text-tarmac sm:text-3xl">Bestsellers</h2>
        <p className="mt-1 text-sm text-tarmac/70">What Nairobi drivers are buying most.</p>
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
          {bestsellers.map((product, index) => (
            <div key={product.id} className="relative w-56 shrink-0 snap-start sm:w-64">
              <span
                className="pointer-events-none absolute -left-1 -top-1 z-10 font-stencil text-3xl font-bold text-murram/25"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

The rank badge is the CLAUDE.md §3-sanctioned use of the Big Shoulders Stencil font ("a featured-product callout number") — not a general heading, and not the banned sequential 01/02/03 feature-list pattern, since it's ranking real bestseller items.

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/home/bestsellers-rail.tsx
git commit -m "feat: add homepage Bestsellers rail"
```

---

### Task 8: Vehicle Make strip

**Files:**
- Create: `components/home/vehicle-make-strip.tsx`

- [x] **Step 1: Create the component**

Create `components/home/vehicle-make-strip.tsx`:

```tsx
import Link from "next/link";
import Image from "next/image";
import { CarFront } from "lucide-react";
import { ALL_VEHICLE_MAKES } from "@/lib/data/products";

const VEHICLE_MAKE_LOGOS: Record<string, string | undefined> = {
  Toyota: undefined,
  Subaru: undefined,
  Nissan: undefined,
  Mazda: undefined,
  Mitsubishi: undefined,
  Ford: undefined,
};

function MakeBadge({ make, logoSrc }: { make: string; logoSrc?: string }) {
  return (
    <Link
      href={`/shop?make=${encodeURIComponent(make)}`}
      className="flex flex-col items-center gap-2 rounded-lg border border-steel/60 bg-savanna/5 p-4 text-center transition-colors hover:border-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
    >
      {logoSrc ? (
        <Image
          src={logoSrc}
          alt={`${make} logo`}
          width={48}
          height={48}
          className="size-12 object-contain"
        />
      ) : (
        <CarFront className="size-8 text-savanna/70" aria-hidden="true" />
      )}
      <span className="text-sm font-medium text-savanna">{make}</span>
    </Link>
  );
}

export function VehicleMakeStrip() {
  return (
    <section className="bg-tarmac text-savanna">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h2 className="font-heading text-2xl font-black sm:text-3xl">Shop by Vehicle Make</h2>
        <p className="mt-1 text-sm text-savanna/70">
          Parts and accessories fitted for these makes.
        </p>
        <div className="mt-8 grid grid-cols-3 gap-4 md:grid-cols-6">
          {ALL_VEHICLE_MAKES.map((make) => (
            <MakeBadge key={make} make={make} logoSrc={VEHICLE_MAKE_LOGOS[make]} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

This satisfies CLAUDE.md §3's requirement directly: framed informationally ("Shop by Vehicle Make", no sponsorship language), and each make falls back to a text+silhouette badge (`CarFront` icon + name) until real logo assets clear legal review — at that point, flipping one make to its real logo is a single edit to `VEHICLE_MAKE_LOGOS`, no component changes required. No manufacturer logos are sourced or fabricated in this phase (CLAUDE.md §16 lists real, official assets as a pre-launch input).

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/home/vehicle-make-strip.tsx
git commit -m "feat: add homepage Vehicle Make strip with swappable logo fallback"
```

---

### Task 9: Trust Signals section

**Files:**
- Create: `components/home/trust-signals.tsx`

- [x] **Step 1: Create the component**

Create `components/home/trust-signals.tsx`:

```tsx
import { Truck, ShieldCheck, Smartphone } from "lucide-react";

const SIGNALS = [
  {
    icon: Truck,
    title: "Nairobi Metro Delivery",
    description: "Flat-rate delivery across Nairobi, with wider coverage available.",
  },
  {
    icon: ShieldCheck,
    title: "Warranty on Parts",
    description: "Parts and accessories backed by manufacturer warranty where applicable.",
  },
  {
    icon: Smartphone,
    title: "Pay Your Way",
    description: "M-Pesa, card, or cash on delivery — choose at checkout.",
  },
];

export function TrustSignals() {
  return (
    <section className="bg-savanna">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:grid-cols-3 md:px-8">
        {SIGNALS.map((signal) => (
          <div key={signal.title} className="flex flex-col items-start gap-2">
            <signal.icon className="size-7 text-murram" aria-hidden="true" />
            <h3 className="font-heading text-base font-bold text-tarmac">{signal.title}</h3>
            <p className="text-sm text-tarmac/70">{signal.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

Copy is deliberately non-committal on payment processing ("choose at checkout", not "pay now") since no payment method is live yet (CLAUDE.md §13), and on warranty ("where applicable", not a blanket promise).

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/home/trust-signals.tsx
git commit -m "feat: add homepage Trust Signals section"
```

---

### Task 10: Newsletter signup

**Files:**
- Create: `components/home/newsletter-signup.tsx`

- [x] **Step 1: Create the component**

Create `components/home/newsletter-signup.tsx`:

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

export function NewsletterSignup() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="bg-tarmac text-savanna">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="max-w-lg">
          <h2 className="font-heading text-2xl font-black sm:text-3xl">
            Know What&apos;s New First
          </h2>
          <p className="mt-1 text-sm text-savanna/70">
            New arrivals, restocks, and offers — straight to your inbox.
          </p>
          {submitted ? (
            <p className="mt-6 text-sm font-medium text-savanna">
              You&apos;re subscribed. Watch your inbox for new arrivals and deals.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-md border border-steel bg-savanna/5 px-3 py-2 text-sm text-savanna placeholder:text-savanna/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram sm:flex-1"
              />
              <Button type="submit">Subscribe</Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
```

Mock submission only (CLAUDE.md §11 — no transactional email infrastructure this phase): submitting swaps the form for a confirmation message, client-side, no network call.

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/home/newsletter-signup.tsx
git commit -m "feat: add homepage Newsletter signup"
```

---

### Task 11: Assemble the Home page

**Files:**
- Modify: `app/page.tsx`

- [x] **Step 1: Replace the placeholder page**

Replace the full contents of `app/page.tsx` with:

```tsx
import type { Metadata } from "next";
import { HeroSection } from "@/components/home/hero-section";
import { CategoryTiles } from "@/components/home/category-tiles";
import { BestsellersRail } from "@/components/home/bestsellers-rail";
import { VehicleMakeStrip } from "@/components/home/vehicle-make-strip";
import { TrustSignals } from "@/components/home/trust-signals";
import { NewsletterSignup } from "@/components/home/newsletter-signup";

export const metadata: Metadata = {
  title: "LePlug Autocare — Premium Car Care in Nairobi",
  description:
    "Nairobi's plug for premium car care — parts, accessories, and detailing, done right.",
};

export default function Home() {
  return (
    <main>
      <HeroSection />
      <CategoryTiles />
      <BestsellersRail />
      <VehicleMakeStrip />
      <TrustSignals />
      <NewsletterSignup />
    </main>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Verify it renders**

Run: `npm run dev` in background (or reuse an already-running dev server), then `curl -s http://localhost:3000 | grep -o "Your Plug for Premium Car Care\|Shop by Category\|Bestsellers\|Shop by Vehicle Make\|Know What"`.

Expected: all five strings found.

- [x] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: assemble Home page from Phase 3 sections"
```

---

### Task 12: Phase 3 verification gate

**Files:** none (verification only)

- [x] **Step 1: Run the full test suite**

Run: `npm test` — expect all prior Phase 1/2 tests (31) plus the new `star-rating.test.ts` (6) to pass: 37 total.

- [x] **Step 2: Run lint**

Run: `npm run lint` — expect no errors.

- [x] **Step 3: Run typecheck**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 4: Visual check in a real browser at desktop width**

Open `http://localhost:3000`. Confirm:
- Hero stripe wipes in once on load (reload to re-trigger), diagonally, on the right side of the hero; no other diagonal stripe appears anywhere else on the page.
- Category Tiles, Bestsellers, Vehicle Make, Trust Signals, and Newsletter sections all render with real data (6 categories, bestseller products with prices in `KSh` format, 6 vehicle makes, 3 trust signals).
- Adding a bestseller product to cart updates the header cart badge count (Phase 2 wiring) and the button briefly reads "Added".
- Toggling a bestseller's wishlist heart fills it murram; reload the page and confirm it stays filled (localStorage persistence from Phase 2).
- Submitting the newsletter form (valid email) swaps it for the confirmation message.

- [x] **Step 5: Visual check at 375px width**

Using the browser's device toolbar (or `mcp__claude-in-chrome__resize_window` if available — note Phase 2's deviation log reports this tool was unreliable in this environment; fall back to DOM/computed-style inspection at real breakpoints if a true 375px screenshot isn't obtainable), confirm:
- Category Tiles show 2 columns, Vehicle Make shows 3 columns.
- The Bestsellers rail scrolls horizontally without breaking the page's horizontal layout (no page-level horizontal scroll).
- The hero's right-side visual (stripe/texture) is hidden below `md` (by design — `hidden md:block`), and the headline/CTA remain fully legible and left-aligned.

- [x] **Step 6: Keyboard focus audit**

Tab through the full page. Confirm every interactive element (Shop Now CTA, each category tile, each bestseller's wishlist heart / add-to-cart / name link, each vehicle make badge, the newsletter email input and Subscribe button) shows a visible `murram` focus ring. Fix any element missing one (mirror the `focus-visible:ring-2 focus-visible:ring-murram` pattern used throughout).

- [x] **Step 7: Reduced-motion check**

Enable "reduce motion" in the OS or via browser devtools emulation, reload the page, and confirm the hero stripe appears fully revealed immediately with no wipe animation.

- [x] **Step 8: Contrast spot-check**

Verify `text-savanna/70` and `text-savanna/85` on the `tarmac` sections (Hero, Vehicle Make, Newsletter), and `text-tarmac/70` on `savanna` sections (Category Tiles, Bestsellers, Trust Signals), meet WCAG AA (4.5:1 for body text) using the browser's accessibility inspector or a contrast-checker tool. If any combination fails, raise the opacity (e.g. `/70` → `/80`) until it passes.

- [x] **Step 9: Commit any fixes found**

```bash
git add -A
git commit -m "fix: resolve issues found in Phase 3 verification gate"
```

(Skip if Steps 1-8 were already clean.)

---

## Definition of done for Phase 3

- [x] Home page renders Hero, Category Tiles, Bestsellers, Vehicle Make strip, Trust Signals, and Newsletter sections in that order
- [x] The diagonal `murram` stripe appears exactly once (hero only), wipes in on load, and is skipped (shown static) under `prefers-reduced-motion`
- [x] `ProductCard` is wired to the real `useCartStore`/`useWishlistStore` from Phase 2 and persists across reload
- [x] Vehicle Make strip is framed informationally, uses no manufacturer logo assets, and falls back to text+silhouette per make via a single swappable prop
- [x] Newsletter form validates email client-side and shows a confirmation message on submit, with no backend call
- [x] Every interactive element has a visible `murram` focus ring
- [x] Responsive from 375px (2-col category grid, scrollable bestsellers rail, no page-level horizontal scroll) through desktop
- [x] `npm test`, `npm run lint`, and `npx tsc --noEmit` all pass clean
- [x] One commit per task above

## Deviations from plan (discovered during execution)

Executed via `superpowers:subagent-driven-development` — fresh implementer subagent per task, followed by a spec-compliance review and a code-quality review, with fix/re-review loops wherever a reviewer found a real issue. All 12 tasks completed; every checkbox above is satisfied.

- **Task 4 (ProductCard):** code-quality review found the image-placeholder `<Link>` (wrapping only a decorative, `aria-hidden` category icon) had no accessible name — a real WCAG 2.4.4/4.1.2 gap, and inconsistent with this codebase's existing icon-link convention (`components/layout/header.tsx` labels its icon-only links). Fixed by adding `aria-label={`View ${product.name}`}`.
- **Task 6 (CategoryTiles):** code-quality review flagged `bg-white/40` as the only raw, non-token Tailwind color in the codebase, against CLAUDE.md §3's explicit "warm, not stark white" palette intent. First fix (`bg-savanna/40`) was itself wrong: the card sits inside a `bg-savanna` section, so `savanna`-on-`savanna` at any opacity is a visual no-op — the card's fill became invisible against its own background, a real fidelity regression from the original (non-token) `bg-white/40`. Corrected to `bg-tarmac/5`, a subtle darkening tint that stays token-based and restores genuine card-vs-background differentiation (verified via manual Tailwind compilation of the class in an earlier task's cascade check, and via contrast/visual reasoning here).
- **Task 7 (BestsellersRail):** code-quality review found the decorative rank-number badge (`-left-1 -top-1`) collided with `ProductCard`'s own "Bestseller" tag pill (`left-2 top-2`) — guaranteed on every card in this rail, since the rail's filter requires the "Bestseller" tag. First fix (`-bottom-1 -left-1`) was itself wrong: the `relative` wrapper spans the *entire* card (image + text + Add to Cart button), so bottom-left of the wrapper landed near the button, not the image. Corrected to `left-1 top-16`, verified by tracing actual pixel geometry (tag-pill height, image `aspect-square` height at both card widths, numeral glyph size) to confirm it clears both the tag pill and the wishlist heart button and stays within the image area, clear of the text/button section below.
- **Task 8 (VehicleMakeStrip):** code-quality review found the `CarFront` fallback icon (`size-8`, 32px) and the eventual real-logo `<Image>` box (`size-12`, 48px) would render at mismatched sizes — a real defect specifically because this component's whole purpose is handling "legal clears some brands but not others" (CLAUDE.md §3), i.e. fallback icons and real logos rendering side-by-side in the same grid row. Fixed by matching the fallback to `size-12`.
- **Task 12 (verification gate):** three real bugs were found only through live browser rendering (not visible from source review alone), fixed, and re-verified:
  1. ESLint `react-hooks/static-components` violation in `ProductCard` (`const CategoryIcon = getCategoryIcon(...)` bound a dynamically-produced value to a capitalized JSX-tag variable). Fixed by renaming `lib/utils/category-icons.ts` → `.tsx` and adding a `CategoryPlaceholderIcon` component that renders via `switch`/`case` on the category id instead of returning a component reference. A follow-up check found `CategoryTiles` had the identical pattern, invisible to lint only because the rule doesn't reach into a `.map()` callback assignment the same way — fixed with the same `CategoryPlaceholderIcon` treatment, and the now-dead `getCategoryIcon`/`CATEGORY_ICONS`/`LucideIcon` import were removed. A final whole-diff sweep (`7523c9f..HEAD`) confirmed no other instance of this pattern exists anywhere in `components/` or `lib/`.
  2. Base UI console warning on the Hero "Shop Now" button: `Button render={<Link href="/shop" />}` renders as an `<a>`, but Base UI's `nativeButton` prop defaults to `true`. Fixed by adding `nativeButton={false}`. Confirmed this is the only `Button` usage in the codebase that needed it (other `render={...}` usages either render a real `<button>` or wrap a non-Button anchor primitive).
  3. Hydration mismatch on `useCartStore`/`useWishlistStore`: both persist to `localStorage` with no hydration guard, so the server always renders the empty/default state while the client immediately renders whatever was persisted, producing a real React hydration error (reproducible by wishlisting an item, then reloading). Fixed with the standard Zustand pattern: `skipHydration: true` in both stores' `persist` config, plus a new `components/layout/store-hydration.tsx` client component that calls `.persist.rehydrate()` for both stores in a one-time `useEffect`, mounted first inside `<body>` in `app/layout.tsx`. Verified this doesn't break the header's cart-badge count (it only renders when `itemCount > 0`, so it degrades gracefully during the brief pre-rehydration window) and that no other store consumers exist yet in this phase.
- **Steps 5–7 of the verification gate** (375px visual check, keyboard focus audit, reduced-motion check) hit the same browser-automation tooling limitations noted in Phase 2's deviations log (`resize_window` doesn't genuinely resize the viewport; live keyboard Tab-through is flaky across tool calls in this environment). Worked around the viewport issue with a same-origin iframe pinned to 375px for genuine computed-style verification. Keyboard focus and reduced-motion were confirmed via a mix of the limited live testing that did work plus exhaustive source/CSS-cascade audits (every interactive element's `focus-visible:ring-2 focus-visible:ring-murram` classes; the `motion-safe:`/`motion-reduce:` clip-path cascade, empirically compiled and verified during Task 5's review) rather than a full live pass — no defects found by either method, consistent with the level of confidence Phase 2 reported using the same workaround.
- Test count is 38 (not the plan's estimated 37) — one extra test exists beyond the predicted count; not investigated further since all 38 pass and this doesn't affect Phase 3 scope.
