# Phase 4 — Shop, Category & Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the main product-browsing experience per CLAUDE.md §4.2–4.5 and the roadmap's Phase 4 scope: a full `/shop` grid, category-scoped `/shop/[category]` pages with an intro block, a working `/search` results page, filters (category/subcategory/brand/price/vehicle make), sort (price asc/desc, newest, bestselling, rating), and the "nothing found" / loading states required by CLAUDE.md §9.

**Architecture:**

- **Filters are single-select, not multi-select.** Phase 1 already built and tested `filterProducts` (`lib/utils/filter-products.ts`) with a `ProductFilters` type that takes one `category`/`subcategory`/`brand`/`make`/`minPrice`/`maxPrice` value each — not arrays. Rather than change a previously-shipped, tested utility, this phase's filter UI is a set of single-select "pill" toggles per facet (click to apply, click again to clear) — this maps directly onto the existing contract with zero changes to Phase 1 code.
- **Filter pills are plain server-rendered links, not client state.** Since filters are just different `?query=strings` on the same route, each pill is a `<Link href="/shop?category=exterior">` computed server-side from the current `searchParams` — no `"use client"`, no hooks, no hydration cost. A pure, tested utility (`buildFilterHref`) merges the current filter state with one change and serializes it back into a query string. The one exception is the **mobile filter drawer**, which needs the Sheet's open/close state and is therefore a small client wrapper around the same server-computed pill markup (mirrors the existing `MobileNav` pattern).
- **Sort is the one client-side control**, using a new shadcn `Select` (CLAUDE.md §2 names "select" as a component to source from shadcn) with `onValueChange` pushing a new URL via `next/navigation`'s `useRouter`.
- **The search query (`q`) rides the same plumbing as filters.** `ShopFilterParams`/`buildFilterHref`/`parseShopSearchParams` all treat `q` as just another param, so the Search page's sort control reuses `SortSelect` unchanged instead of a bespoke variant.
- **Page prop types are written out explicitly** (`params`/`searchParams` typed as `Promise<...>`, per Next.js 16's async Dynamic APIs) rather than using the generated `PageProps<"/shop">` helper type seen in `app/layout.tsx`'s `LayoutProps<"/">` — that helper is codegen'd into `.next/types` from routes that already exist on disk, which doesn't help for routes this plan is creating from scratch.
- **Loading skeletons are wired via route-level `loading.tsx` files**, the structurally correct place for them. Because Phase 1–3 mock data is a synchronous in-memory array (no real fetch latency), these may not be visually perceptible today — they become meaningful once a real data source is introduced. Built now so CLAUDE.md §9's "skeleton placeholders for grids" requirement is structurally satisfied and nothing has to be retrofitted later.
- **Price filtering uses four fixed preset buckets** (Under 2,000 / 2,000–5,000 / 5,000–10,000 / Over 10,000), not a slider — avoids adding a new interactive range component this phase; CLAUDE.md's "price range" requirement doesn't mandate a specific control, and presets are simpler to build, use, and keyboard-navigate than a slider.
- **The brand facet list is computed dynamically** from the in-scope product set (all products on `/shop`, or just that category's products on `/shop/[category]`), not hardcoded, so it never offers a brand with zero matching products in that scope.
- Naming note: the existing `lib/utils/filter-products.ts` already exports a type called `ProductFilters`. To avoid a name collision, the new filter **UI component** in this plan is called `ShopFilters`, not `ProductFilters`.

**Tech Stack:** Existing stack only, plus two new shadcn components (`Select`, `Skeleton`). Next.js 16.3.4 App Router (async `params`/`searchParams`), existing `lib/data/products.ts` (`products`, `getProductsByCategory`, `ALL_VEHICLE_MAKES`), `lib/data/categories.ts` (`categories`, `getCategoryBySlug`), `lib/utils/filter-products.ts`, `lib/utils/sort-products.ts` (both from Phase 1, unchanged), `components/layout/category-bar.tsx` and `components/layout/breadcrumbs.tsx` (from Phase 2, not yet mounted on any page), `components/product/product-card.tsx` (from Phase 3). Confirmed in this session: `lucide-react` v1.39.0 exports `SearchX` and `SlidersHorizontal`; `npx tsc --noEmit` on the current codebase passes clean before this phase starts.

---

### Task 1: Add shadcn Select and Skeleton components

**Files:**
- Create: `components/ui/select.tsx`, `components/ui/skeleton.tsx` (plus any dependency files the CLI adds)

- [x] **Step 1: Run the shadcn add command**

```bash
npx shadcn@latest add select skeleton
```

Expected: `components/ui/select.tsx` and `components/ui/skeleton.tsx` created without errors.

- [x] **Step 2: Verify globals.css wasn't regressed**

Run: `grep -n "font-sans\|font-heading\|Geist" app/globals.css`

Expected: still shows `--font-sans: var(--font-inter), sans-serif;` and no `Geist` references. If the add command reintroduced the Phase 0 Geist regression, reapply the fix described in `docs/superpowers/plans/2026-09-01-phase-0-scaffold.md` Task 4.

- [x] **Step 3: Inspect Select's generated API**

Run: `grep -n "^export\|^function" components/ui/select.tsx`

Note the exported component names (expected: `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`, plus possibly `SelectGroup`/`SelectLabel`/`SelectSeparator`) and whether the root `Select` accepts `value`/`onValueChange` props. Task 8 below assumes exactly that API; adjust its usage if the generated signature differs.

- [x] **Step 4: Inspect Skeleton's generated API**

Run: `grep -n "^export\|^function" components/ui/skeleton.tsx`

Expected: a single `Skeleton` component accepting `{ className, ...props }` and rendering a `<div>`. Task 6 below assumes `<Skeleton className="..." />` works this way; adjust if different.

- [x] **Step 5: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 6: Commit**

```bash
git add components.json components/ui/select.tsx components/ui/skeleton.tsx package.json package-lock.json app/globals.css
git commit -m "feat: add shadcn Select and Skeleton components"
```

---

### Task 2: `searchProducts` utility (TDD)

**Files:**
- Create: `lib/utils/search-products.ts`
- Test: `lib/utils/search-products.test.ts`

- [x] **Step 1: Write the failing test**

Create `lib/utils/search-products.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { searchProducts } from "./search-products";
import type { Product } from "@/lib/types";

const PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "led-fog-light-kit",
    sku: "LP-EXT-001",
    name: "LED Fog Light Kit",
    category: "exterior",
    brand: "BrightBeam",
    price: 4500,
    images: [],
    description: "",
    keyFeatures: [],
    stock: "in_stock",
  },
  {
    id: "2",
    slug: "ceramic-brake-pads",
    sku: "LP-PER-001",
    name: "Ceramic Brake Pads",
    category: "performance-service-parts",
    brand: "StopSure",
    price: 5400,
    images: [],
    description: "",
    keyFeatures: [],
    stock: "in_stock",
  },
  {
    id: "3",
    slug: "car-shampoo",
    sku: "LP-CAR-001",
    name: "Premium Car Shampoo",
    category: "car-care-detailing",
    brand: "ShineWorks",
    price: 1200,
    images: [],
    description: "",
    keyFeatures: [],
    stock: "in_stock",
  },
];

describe("searchProducts", () => {
  it("matches by product name, case-insensitive", () => {
    expect(searchProducts(PRODUCTS, "fog light")).toEqual([PRODUCTS[0]]);
    expect(searchProducts(PRODUCTS, "FOG LIGHT")).toEqual([PRODUCTS[0]]);
  });

  it("matches by brand", () => {
    expect(searchProducts(PRODUCTS, "shineworks")).toEqual([PRODUCTS[2]]);
  });

  it("matches by category id", () => {
    expect(searchProducts(PRODUCTS, "performance")).toEqual([PRODUCTS[1]]);
  });

  it("returns an empty array for no matches", () => {
    expect(searchProducts(PRODUCTS, "xyz-nonexistent")).toEqual([]);
  });

  it("returns an empty array for a blank query", () => {
    expect(searchProducts(PRODUCTS, "   ")).toEqual([]);
  });

  it("trims surrounding whitespace from the query", () => {
    expect(searchProducts(PRODUCTS, "  shampoo  ")).toEqual([PRODUCTS[2]]);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/utils/search-products.test.ts`

Expected: FAIL — `Cannot find module './search-products'`.

- [x] **Step 3: Write minimal implementation**

Create `lib/utils/search-products.ts`:

```ts
import type { Product } from "@/lib/types";

export function searchProducts(products: Product[], query: string): Product[] {
  const term = query.trim().toLowerCase();
  if (!term) return [];
  return products.filter((product) => {
    const haystack = `${product.name} ${product.category} ${product.brand ?? ""}`.toLowerCase();
    return haystack.includes(term);
  });
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/utils/search-products.test.ts`

Expected: PASS (6/6).

- [x] **Step 5: Commit**

```bash
git add lib/utils/search-products.ts lib/utils/search-products.test.ts
git commit -m "feat: add searchProducts name/category/brand matching utility"
```

---

### Task 3: `buildFilterHref` utility (TDD)

**Files:**
- Create: `lib/utils/build-filter-url.ts`
- Test: `lib/utils/build-filter-url.test.ts`

- [x] **Step 1: Write the failing test**

Create `lib/utils/build-filter-url.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildFilterHref } from "./build-filter-url";

describe("buildFilterHref", () => {
  it("returns the base path when there are no active filters", () => {
    expect(buildFilterHref("/shop", {}, {})).toBe("/shop");
  });

  it("adds a single filter as a query param", () => {
    expect(buildFilterHref("/shop", {}, { category: "exterior" })).toBe("/shop?category=exterior");
  });

  it("preserves existing filters not being updated", () => {
    expect(
      buildFilterHref("/shop", { category: "exterior", brand: "ShineWorks" }, { sort: "price-asc" })
    ).toBe("/shop?category=exterior&brand=ShineWorks&sort=price-asc");
  });

  it("overwrites an existing filter with a new value", () => {
    expect(buildFilterHref("/shop", { category: "exterior" }, { category: "interior" })).toBe(
      "/shop?category=interior"
    );
  });

  it("removes a filter when the update sets it to undefined", () => {
    expect(
      buildFilterHref("/shop", { category: "exterior", brand: "ShineWorks" }, { category: undefined })
    ).toBe("/shop?brand=ShineWorks");
  });

  it("always orders params the same way regardless of insertion order", () => {
    expect(buildFilterHref("/shop", { sort: "newest", category: "exterior" }, {})).toBe(
      "/shop?category=exterior&sort=newest"
    );
  });

  it("keeps the search query (q) ordered first", () => {
    expect(buildFilterHref("/search", { q: "brake pads" }, { sort: "price-asc" })).toBe(
      "/search?q=brake%20pads&sort=price-asc"
    );
  });

  it("URL-encodes param values", () => {
    expect(buildFilterHref("/shop", {}, { brand: "A&W Parts" })).toBe("/shop?brand=A%26W%20Parts");
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/utils/build-filter-url.test.ts`

Expected: FAIL — `Cannot find module './build-filter-url'`.

- [x] **Step 3: Write minimal implementation**

Create `lib/utils/build-filter-url.ts`:

```ts
export type ShopFilterParams = {
  q?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  make?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
};

const PARAM_ORDER: (keyof ShopFilterParams)[] = [
  "q",
  "category",
  "subcategory",
  "brand",
  "make",
  "minPrice",
  "maxPrice",
  "sort",
];

export function buildFilterHref(
  basePath: string,
  current: ShopFilterParams,
  updates: Partial<ShopFilterParams>
): string {
  const merged: ShopFilterParams = { ...current, ...updates };
  const pairs: string[] = [];
  for (const key of PARAM_ORDER) {
    const value = merged[key];
    if (value) pairs.push(`${key}=${encodeURIComponent(value)}`);
  }
  return pairs.length > 0 ? `${basePath}?${pairs.join("&")}` : basePath;
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/utils/build-filter-url.test.ts`

Expected: PASS (8/8).

- [x] **Step 5: Commit**

```bash
git add lib/utils/build-filter-url.ts lib/utils/build-filter-url.test.ts
git commit -m "feat: add buildFilterHref query-string utility"
```

---

### Task 4: `parseShopSearchParams` utility (TDD)

**Files:**
- Create: `lib/utils/parse-shop-search-params.ts`
- Test: `lib/utils/parse-shop-search-params.test.ts`

- [x] **Step 1: Write the failing test**

Create `lib/utils/parse-shop-search-params.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { parseShopSearchParams } from "./parse-shop-search-params";

describe("parseShopSearchParams", () => {
  it("returns an empty object for empty input", () => {
    expect(parseShopSearchParams({})).toEqual({});
  });

  it("passes through single string values for known keys", () => {
    expect(parseShopSearchParams({ category: "exterior", sort: "price-asc" })).toEqual({
      category: "exterior",
      sort: "price-asc",
    });
  });

  it("parses the search query param", () => {
    expect(parseShopSearchParams({ q: "brake pads" })).toEqual({ q: "brake pads" });
  });

  it("ignores unknown keys", () => {
    expect(parseShopSearchParams({ category: "exterior", utm_source: "google" })).toEqual({
      category: "exterior",
    });
  });

  it("takes the first value when a key is repeated in the URL", () => {
    expect(parseShopSearchParams({ brand: ["ShineWorks", "StopSure"] })).toEqual({
      brand: "ShineWorks",
    });
  });

  it("drops empty string values", () => {
    expect(parseShopSearchParams({ category: "" })).toEqual({});
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/utils/parse-shop-search-params.test.ts`

Expected: FAIL — `Cannot find module './parse-shop-search-params'`.

- [x] **Step 3: Write minimal implementation**

Create `lib/utils/parse-shop-search-params.ts`:

```ts
import type { ShopFilterParams } from "./build-filter-url";

export type RawSearchParams = Record<string, string | string[] | undefined>;

const KEYS: (keyof ShopFilterParams)[] = [
  "q",
  "category",
  "subcategory",
  "brand",
  "make",
  "minPrice",
  "maxPrice",
  "sort",
];

export function parseShopSearchParams(raw: RawSearchParams): ShopFilterParams {
  const result: ShopFilterParams = {};
  for (const key of KEYS) {
    const value = raw[key];
    const single = Array.isArray(value) ? value[0] : value;
    if (single) result[key] = single;
  }
  return result;
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/utils/parse-shop-search-params.test.ts`

Expected: PASS (6/6).

- [x] **Step 5: Commit**

```bash
git add lib/utils/parse-shop-search-params.ts lib/utils/parse-shop-search-params.test.ts
git commit -m "feat: add parseShopSearchParams URL parsing utility"
```

---

### Task 5: NoResults component

**Files:**
- Create: `components/product/no-results.tsx`

- [x] **Step 1: Create the component**

Create `components/product/no-results.tsx`:

```tsx
import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export type NoResultsProps =
  | { variant: "search"; query: string }
  | { variant: "filters"; clearHref: string };

export function NoResults(props: NoResultsProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-steel/40 bg-tarmac/5 px-6 py-16 text-center">
      <SearchX className="size-10 text-steel" aria-hidden="true" />
      {props.variant === "search" ? (
        <>
          <h2 className="font-heading text-xl font-bold text-tarmac">
            No results for &quot;{props.query}&quot;
          </h2>
          <p className="max-w-md text-sm text-tarmac/70">
            Check the spelling, try a shorter search term, or browse categories instead.
          </p>
        </>
      ) : (
        <>
          <h2 className="font-heading text-xl font-bold text-tarmac">No products match these filters</h2>
          <p className="max-w-md text-sm text-tarmac/70">
            Try removing a filter, or clear them all to see more products.
          </p>
        </>
      )}
      <Button
        render={<Link href={props.variant === "search" ? "/shop" : props.clearHref} />}
        className="mt-2"
      >
        {props.variant === "search" ? "Browse Shop" : "Clear Filters"}
      </Button>
    </div>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`. If `Button`'s `render` prop doesn't accept a bare `<Link>` the way `components/home/hero-section.tsx` uses it, check whether it needs `nativeButton={false}` (see Phase 3's deviations log for this exact issue) and add it if so.

Expected: no errors.

- [x] **Step 3: Commit**

```bash
git add components/product/no-results.tsx
git commit -m "feat: add NoResults empty-state component for search and filters"
```

---

### Task 6: ProductGridSkeleton component

**Files:**
- Create: `components/product/product-grid-skeleton.tsx`

- [x] **Step 1: Create the component**

Create `components/product/product-grid-skeleton.tsx`:

```tsx
import { Skeleton } from "@/components/ui/skeleton";

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col gap-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      ))}
    </div>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors. If `Skeleton`'s generated props don't accept a plain `className` the way Task 1 Step 4 found, adjust the usage above to match.

- [x] **Step 3: Commit**

```bash
git add components/product/product-grid-skeleton.tsx
git commit -m "feat: add ProductGridSkeleton loading placeholder"
```

---

### Task 7: ProductGrid component

**Files:**
- Create: `components/product/product-grid.tsx`

- [x] **Step 1: Create the component**

Create `components/product/product-grid.tsx`:

```tsx
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { NoResults, type NoResultsProps } from "@/components/product/no-results";

export function ProductGrid({
  products,
  emptyState,
}: {
  products: Product[];
  emptyState: NoResultsProps;
}) {
  if (products.length === 0) {
    return <NoResults {...emptyState} />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/product/product-grid.tsx
git commit -m "feat: add ProductGrid component with empty-state handling"
```

---

### Task 8: SortSelect component

**Files:**
- Create: `components/product/sort-select.tsx`

- [x] **Step 1: Create the component**

Create `components/product/sort-select.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildFilterHref, type ShopFilterParams } from "@/lib/utils/build-filter-url";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "bestselling", label: "Bestselling" },
  { value: "rating", label: "Customer Rating" },
];

export function SortSelect({
  basePath,
  current,
}: {
  basePath: string;
  current: ShopFilterParams;
}) {
  const router = useRouter();

  return (
    <Select
      value={current.sort ?? ""}
      onValueChange={(value: string) => {
        router.push(buildFilterHref(basePath, current, { sort: value || undefined }));
      }}
    >
      <SelectTrigger className="w-full sm:w-56" aria-label="Sort products">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`. If `Select`'s generated API from Task 1 Step 3 doesn't accept `value`/`onValueChange` on the root component the way this code assumes, adjust to whatever prop names it actually uses (check `components/ui/select.tsx` for the exact prop the underlying `@base-ui/react/select` root forwards).

Expected: no errors.

- [x] **Step 3: Commit**

```bash
git add components/product/sort-select.tsx
git commit -m "feat: add SortSelect component"
```

---

### Task 9: ShopFilters component

**Files:**
- Create: `components/product/shop-filters.tsx`

- [x] **Step 1: Create the component**

Create `components/product/shop-filters.tsx`:

```tsx
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/data/categories";
import { ALL_VEHICLE_MAKES } from "@/lib/data/products";
import { buildFilterHref, type ShopFilterParams } from "@/lib/utils/build-filter-url";

const PRICE_BUCKETS: { label: string; min?: string; max?: string }[] = [
  { label: "Under KSh 2,000", max: "2000" },
  { label: "KSh 2,000 – 5,000", min: "2000", max: "5000" },
  { label: "KSh 5,000 – 10,000", min: "5000", max: "10000" },
  { label: "Over KSh 10,000", min: "10000" },
];

type ShopFiltersProps = {
  basePath: string;
  current: ShopFilterParams;
  brands: string[];
  lockedCategory?: string;
};

function FilterPill({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram ${
        active
          ? "border-murram bg-murram text-savanna"
          : "border-steel text-tarmac hover:border-murram hover:text-murram"
      }`}
    >
      {label}
    </Link>
  );
}

function FilterSections({ basePath, current, brands, lockedCategory }: ShopFiltersProps) {
  const activeCategoryId = lockedCategory ?? current.category;
  const activeCategory = activeCategoryId
    ? categories.find((c) => c.id === activeCategoryId)
    : undefined;
  const hasActiveFilters = Boolean(
    current.category ||
      current.subcategory ||
      current.brand ||
      current.make ||
      current.minPrice ||
      current.maxPrice
  );

  return (
    <div className="flex flex-col gap-6">
      {hasActiveFilters && (
        <Link
          href={basePath}
          className="self-start text-sm font-medium text-murram underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        >
          Clear all filters
        </Link>
      )}

      {!lockedCategory && (
        <fieldset className="flex flex-col gap-2">
          <legend className="font-heading text-sm font-bold text-tarmac">Category</legend>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <FilterPill
                key={category.id}
                label={category.name}
                active={current.category === category.id}
                href={buildFilterHref(basePath, current, {
                  category: current.category === category.id ? undefined : category.id,
                  subcategory: undefined,
                })}
              />
            ))}
          </div>
        </fieldset>
      )}

      {activeCategory && activeCategory.subcategories.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="font-heading text-sm font-bold text-tarmac">Subcategory</legend>
          <div className="flex flex-wrap gap-2">
            {activeCategory.subcategories.map((sub) => (
              <FilterPill
                key={sub.id}
                label={sub.name}
                active={current.subcategory === sub.slug}
                href={buildFilterHref(basePath, current, {
                  subcategory: current.subcategory === sub.slug ? undefined : sub.slug,
                })}
              />
            ))}
          </div>
        </fieldset>
      )}

      {brands.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="font-heading text-sm font-bold text-tarmac">Brand</legend>
          <div className="flex flex-wrap gap-2">
            {brands.map((brand) => (
              <FilterPill
                key={brand}
                label={brand}
                active={current.brand === brand}
                href={buildFilterHref(basePath, current, {
                  brand: current.brand === brand ? undefined : brand,
                })}
              />
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="font-heading text-sm font-bold text-tarmac">Vehicle Make</legend>
        <div className="flex flex-wrap gap-2">
          {ALL_VEHICLE_MAKES.map((make) => (
            <FilterPill
              key={make}
              label={make}
              active={current.make === make}
              href={buildFilterHref(basePath, current, {
                make: current.make === make ? undefined : make,
              })}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-heading text-sm font-bold text-tarmac">Price</legend>
        <div className="flex flex-wrap gap-2">
          {PRICE_BUCKETS.map((bucket) => {
            const active = current.minPrice === bucket.min && current.maxPrice === bucket.max;
            return (
              <FilterPill
                key={bucket.label}
                label={bucket.label}
                active={active}
                href={buildFilterHref(basePath, current, {
                  minPrice: active ? undefined : bucket.min,
                  maxPrice: active ? undefined : bucket.max,
                })}
              />
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

export function ShopFilters(props: ShopFiltersProps) {
  return (
    <>
      <aside className="hidden w-64 shrink-0 md:block">
        <FilterSections {...props} />
      </aside>
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                Filters
              </Button>
            }
          />
          <SheetContent side="left" className="overflow-y-auto bg-savanna text-tarmac">
            <SheetHeader>
              <SheetTitle className="text-tarmac">Filters</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-4">
              <FilterSections {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`. If `SheetTrigger` doesn't accept a `render` prop the way `components/layout/mobile-nav.tsx` uses it, match that file's exact usage instead.

Expected: no errors.

- [x] **Step 3: Commit**

```bash
git add components/product/shop-filters.tsx
git commit -m "feat: add ShopFilters component with desktop sidebar and mobile drawer"
```

---

### Task 10: Wire header search to `/search`

**Files:**
- Modify: `components/layout/header.tsx`

- [x] **Step 1: Replace the full contents of the file**

Replace the full contents of `components/layout/header.tsx` with:

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, User } from "lucide-react";
import { useCartItemCount } from "@/lib/store/cart";
import { MobileNav } from "./mobile-nav";

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const itemCount = useCartItemCount();
  const router = useRouter();

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 24);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get("q");
    if (typeof query === "string" && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setMobileSearchOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-steel bg-tarmac text-savanna">
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-[height] duration-200 md:px-8 ${
          isScrolled ? "h-14" : "h-20"
        }`}
      >
        <Link
          href="/"
          className="shrink-0 rounded-sm font-heading text-xl font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        >
          LE PLUG
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-sm text-sm font-medium hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form
          onSubmit={handleSearchSubmit}
          role="search"
          className="hidden max-w-sm flex-1 items-center gap-2 rounded-md border border-steel bg-savanna/5 px-3 py-1.5 focus-within:ring-2 focus-within:ring-murram md:flex"
        >
          <Search className="size-4 shrink-0 text-savanna/70" aria-hidden="true" />
          <input
            type="search"
            name="q"
            placeholder="Search parts, accessories..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-savanna/50"
            aria-label="Search products"
          />
        </form>

        <div className="flex items-center gap-3 md:gap-4">
          <button
            type="button"
            onClick={() => setMobileSearchOpen((open) => !open)}
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram md:hidden"
            aria-label="Toggle search"
            aria-expanded={mobileSearchOpen}
          >
            <Search className="size-5" />
          </button>
          <Link
            href="/account/login"
            className="hidden rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram md:block"
            aria-label="Account"
          >
            <User className="size-5" />
          </Link>
          <Link
            href="/cart"
            className="relative rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
          >
            <ShoppingCart className="size-5" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-murram text-[10px] font-bold text-savanna">
                {itemCount}
              </span>
            )}
          </Link>
          <MobileNav navLinks={NAV_LINKS} />
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="border-t border-steel px-4 py-3 md:hidden">
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            className="flex items-center gap-2 rounded-md border border-steel bg-savanna/5 px-3 py-1.5 focus-within:ring-2 focus-within:ring-murram"
          >
            <Search className="size-4 shrink-0 text-savanna/70" aria-hidden="true" />
            <input
              type="search"
              name="q"
              placeholder="Search parts, accessories..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-savanna/50"
              aria-label="Search products"
              autoFocus
            />
          </form>
        </div>
      )}
    </header>
  );
}
```

The only changes from the existing file: both `<input>`s are now wrapped in a `<form role="search" onSubmit={handleSearchSubmit}>` with `name="q"` added to each input, and a `useRouter` + `handleSearchSubmit` were added.

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/layout/header.tsx
git commit -m "feat: wire header search to navigate to /search"
```

---

### Task 11: `/shop` page (all products)

**Files:**
- Create: `app/shop/page.tsx`
- Create: `app/shop/loading.tsx`

- [x] **Step 1: Create the page**

Create `app/shop/page.tsx`:

```tsx
import type { Metadata } from "next";
import { CategoryBar } from "@/components/layout/category-bar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ShopFilters } from "@/components/product/shop-filters";
import { SortSelect } from "@/components/product/sort-select";
import { ProductGrid } from "@/components/product/product-grid";
import { products } from "@/lib/data/products";
import { filterProducts } from "@/lib/utils/filter-products";
import { sortProducts, type SortOption } from "@/lib/utils/sort-products";
import { parseShopSearchParams } from "@/lib/utils/parse-shop-search-params";

export const metadata: Metadata = {
  title: "Shop All Products — LePlug Autocare",
  description: "Browse every car part, accessory, and detailing product LePlug Autocare carries.",
};

const SORT_OPTIONS = new Set<SortOption>(["price-asc", "price-desc", "newest", "bestselling", "rating"]);

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const current = parseShopSearchParams(raw);

  const filtered = filterProducts(products, {
    category: current.category,
    subcategory: current.subcategory,
    brand: current.brand,
    make: current.make,
    minPrice: current.minPrice ? Number(current.minPrice) : undefined,
    maxPrice: current.maxPrice ? Number(current.maxPrice) : undefined,
  });

  const sorted =
    current.sort && SORT_OPTIONS.has(current.sort as SortOption)
      ? sortProducts(filtered, current.sort as SortOption)
      : filtered;

  const brands = Array.from(
    new Set(
      products
        .filter((p) => !current.category || p.category === current.category)
        .map((p) => p.brand)
        .filter((b): b is string => Boolean(b))
    )
  ).sort();

  return (
    <main>
      <CategoryBar />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <Breadcrumbs items={[{ label: "Shop" }]} />
        <h1 className="mt-2 font-heading text-3xl font-black text-tarmac">Shop All Products</h1>
        <p className="mt-1 text-sm text-tarmac/70">
          {sorted.length} product{sorted.length === 1 ? "" : "s"}
        </p>

        <div className="mt-6 flex flex-col gap-6 md:flex-row">
          <ShopFilters basePath="/shop" current={current} brands={brands} />

          <div className="flex-1">
            <div className="mb-4 flex justify-end">
              <SortSelect basePath="/shop" current={current} />
            </div>
            <ProductGrid products={sorted} emptyState={{ variant: "filters", clearHref: "/shop" }} />
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [x] **Step 2: Create the loading skeleton**

Create `app/shop/loading.tsx`:

```tsx
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";

export default function ShopLoading() {
  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="h-9 w-64 animate-pulse rounded bg-steel/30" />
        <div className="mt-6 flex flex-col gap-6 md:flex-row">
          <div className="hidden w-64 shrink-0 md:block" />
          <div className="flex-1">
            <ProductGridSkeleton />
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [x] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 4: Verify it renders**

Run: `npm run dev` in the background (or reuse an already-running dev server), then:

```bash
curl -s http://localhost:3000/shop | grep -o "Shop All Products"
curl -s "http://localhost:3000/shop?category=exterior" | grep -o "Wiper Blades\|Fog Light"
curl -s "http://localhost:3000/shop?make=Toyota" | grep -c "product"
```

Expected: first command finds "Shop All Products"; second finds at least one exterior product name; third returns a non-zero count.

- [x] **Step 5: Commit**

```bash
git add app/shop/page.tsx app/shop/loading.tsx
git commit -m "feat: add /shop all-products page with filters and sort"
```

---

### Task 12: `/shop/[category]` page

**Files:**
- Create: `app/shop/[category]/page.tsx`
- Create: `app/shop/[category]/loading.tsx`

- [x] **Step 1: Create the page**

Create `app/shop/[category]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryBar } from "@/components/layout/category-bar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ShopFilters } from "@/components/product/shop-filters";
import { SortSelect } from "@/components/product/sort-select";
import { ProductGrid } from "@/components/product/product-grid";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getProductsByCategory } from "@/lib/data/products";
import { filterProducts } from "@/lib/utils/filter-products";
import { sortProducts, type SortOption } from "@/lib/utils/sort-products";
import { parseShopSearchParams } from "@/lib/utils/parse-shop-search-params";

const SORT_OPTIONS = new Set<SortOption>(["price-asc", "price-desc", "newest", "bestselling", "rating"]);

type CategoryPageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.name} — LePlug Autocare`,
    description: category.description,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const raw = await searchParams;
  const current = parseShopSearchParams(raw);
  const basePath = `/shop/${category.slug}`;

  const categoryProducts = getProductsByCategory(category.id);

  const filtered = filterProducts(categoryProducts, {
    subcategory: current.subcategory,
    brand: current.brand,
    make: current.make,
    minPrice: current.minPrice ? Number(current.minPrice) : undefined,
    maxPrice: current.maxPrice ? Number(current.maxPrice) : undefined,
  });

  const sorted =
    current.sort && SORT_OPTIONS.has(current.sort as SortOption)
      ? sortProducts(filtered, current.sort as SortOption)
      : filtered;

  const brands = Array.from(
    new Set(categoryProducts.map((p) => p.brand).filter((b): b is string => Boolean(b)))
  ).sort();

  return (
    <main>
      <CategoryBar />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: category.name }]} />
        <h1 className="mt-2 font-heading text-3xl font-black text-tarmac">{category.name}</h1>
        <p className="mt-1 max-w-2xl text-sm text-tarmac/70">{category.description}</p>
        <p className="mt-3 text-sm text-tarmac/70">
          {sorted.length} product{sorted.length === 1 ? "" : "s"}
        </p>

        <div className="mt-6 flex flex-col gap-6 md:flex-row">
          <ShopFilters
            basePath={basePath}
            current={current}
            lockedCategory={category.id}
            brands={brands}
          />

          <div className="flex-1">
            <div className="mb-4 flex justify-end">
              <SortSelect basePath={basePath} current={current} />
            </div>
            <ProductGrid products={sorted} emptyState={{ variant: "filters", clearHref: basePath }} />
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [x] **Step 2: Create the loading skeleton**

Create `app/shop/[category]/loading.tsx`:

```tsx
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";

export default function CategoryLoading() {
  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="h-9 w-64 animate-pulse rounded bg-steel/30" />
        <div className="mt-6 flex flex-col gap-6 md:flex-row">
          <div className="hidden w-64 shrink-0 md:block" />
          <div className="flex-1">
            <ProductGridSkeleton />
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [x] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 4: Verify it renders, including the 404 case**

Run: `npm run dev` in the background (or reuse an already-running dev server), then:

```bash
curl -s http://localhost:3000/shop/exterior | grep -o "Exterior"
curl -s "http://localhost:3000/shop/interior?subcategory=seat-covers" | grep -o "Seat Covers\|Leatherette"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/shop/not-a-real-category
```

Expected: first command finds "Exterior"; second finds a seat-cover product; third prints `404`.

- [x] **Step 5: Commit**

```bash
git add "app/shop/[category]/page.tsx" "app/shop/[category]/loading.tsx"
git commit -m "feat: add /shop/[category] page with intro block and 404 for bad slugs"
```

---

### Task 13: `/search` page

**Files:**
- Create: `app/search/page.tsx`
- Create: `app/search/loading.tsx`

- [x] **Step 1: Create the page**

Create `app/search/page.tsx`:

```tsx
import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/product-grid";
import { SortSelect } from "@/components/product/sort-select";
import { products } from "@/lib/data/products";
import { searchProducts } from "@/lib/utils/search-products";
import { sortProducts, type SortOption } from "@/lib/utils/sort-products";
import { parseShopSearchParams } from "@/lib/utils/parse-shop-search-params";

const SORT_OPTIONS = new Set<SortOption>(["price-asc", "price-desc", "newest", "bestselling", "rating"]);

export const metadata: Metadata = {
  title: "Search Results — LePlug Autocare",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const current = parseShopSearchParams(raw);
  const query = current.q ?? "";

  const matched = query ? searchProducts(products, query) : [];
  const sorted =
    current.sort && SORT_OPTIONS.has(current.sort as SortOption)
      ? sortProducts(matched, current.sort as SortOption)
      : matched;

  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <h1 className="font-heading text-3xl font-black text-tarmac">
          {query ? `Search Results for "${query}"` : "Search"}
        </h1>
        <p className="mt-1 text-sm text-tarmac/70">
          {query
            ? `${sorted.length} product${sorted.length === 1 ? "" : "s"} found`
            : "Type a product name, category, or brand in the search bar above."}
        </p>

        {query && sorted.length > 0 && (
          <div className="mt-4 flex justify-end">
            <SortSelect basePath="/search" current={current} />
          </div>
        )}

        {query && (
          <div className="mt-6">
            <ProductGrid products={sorted} emptyState={{ variant: "search", query }} />
          </div>
        )}
      </div>
    </main>
  );
}
```

- [x] **Step 2: Create the loading skeleton**

Create `app/search/loading.tsx`:

```tsx
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";

export default function SearchLoading() {
  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="h-9 w-64 animate-pulse rounded bg-steel/30" />
        <div className="mt-6">
          <ProductGridSkeleton />
        </div>
      </div>
    </main>
  );
}
```

- [x] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 4: Verify it renders**

Run: `npm run dev` in the background (or reuse an already-running dev server), then:

```bash
curl -s "http://localhost:3000/search?q=brake" | grep -o "Ceramic Brake Pads"
curl -s "http://localhost:3000/search?q=zzzznomatch" | grep -o "No results for"
curl -s "http://localhost:3000/search" | grep -o "Type a product name"
```

Expected: first finds the brake pad product name; second finds the no-results heading; third finds the no-query prompt copy.

- [x] **Step 5: Commit**

```bash
git add app/search/page.tsx app/search/loading.tsx
git commit -m "feat: add /search results page with zero-result and empty-query states"
```

---

### Task 14: Phase 4 verification gate

**Files:** none (verification only)

- [x] **Step 1: Run the full test suite**

Run: `npm test` — expect all prior tests (38 from Phase 3) plus the new `search-products.test.ts` (6), `build-filter-url.test.ts` (8), and `parse-shop-search-params.test.ts` (6) to pass: 58 total.

- [x] **Step 2: Run lint**

Run: `npm run lint` — expect no errors.

- [x] **Step 3: Run typecheck**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 4: Visual check in a real browser at desktop width**

Open `http://localhost:3000/shop`. Confirm:
- The category bar (from Phase 2) appears above the grid, with all 6 categories, each opening a subcategory panel on hover/focus.
- The result count text matches the number of cards shown.
- Clicking a category pill filters the grid and reveals a Subcategory pill row for that category; clicking the same pill again clears it and hides the Subcategory row.
- Clicking a brand pill, a vehicle-make pill, and a price-bucket pill each narrow the grid further; clicking an active one again clears just that filter.
- "Clear all filters" (visible only once a filter is active) returns to the full, unfiltered grid.
- Changing the Sort dropdown reorders the grid (e.g. "Price: Low to High" produces ascending prices) without a full page reload flash.
- Navigate to `http://localhost:3000/shop/interior` — confirm the intro heading/description render, no Category pill row appears (locked), and only interior products show.
- From the Home page (Phase 3), click a Vehicle Make badge (e.g. Toyota) — confirm it lands on `/shop?make=Toyota` with the Toyota pill pre-selected/active and the grid pre-filtered.
- From a Shop page, click a Category Bar subcategory link — confirm it lands on the matching `/shop/[category]?subcategory=...` URL with that subcategory pill pre-selected/active.

- [x] **Step 5: Search flow check**

In the header search bar, type a query (e.g. "brake") and submit. Confirm it navigates to `/search?q=brake` and shows matching products. Try a nonsense query and confirm the "No results for ..." state with a working "Browse Shop" button. Repeat using the mobile search toggle (narrow the browser or use device toolbar) and confirm the mobile search panel closes after a successful submit.

- [x] **Step 6: Visual check at 375px width**

Using the browser's device toolbar (or DOM/computed-style inspection if `resize_window` proves unreliable, per Phase 2/3's noted tooling limitation), confirm on `/shop`:
- The desktop filter sidebar is hidden; a "Filters" button with a slider icon opens a left-side Sheet drawer containing the same pills.
- The product grid shows 2 columns.
- No page-level horizontal scroll appears.

- [x] **Step 7: Keyboard focus audit**

Tab through `/shop`, `/shop/exterior`, and `/search?q=brake`. Confirm every interactive element (category bar triggers, filter pills, the Sort select trigger, the mobile Filters button and its Sheet close button, the "Clear all filters" link, product card controls) shows a visible `murram` focus ring. Fix any element missing one.

- [x] **Step 8: Contrast spot-check**

Verify the inactive `FilterPill` state (`text-tarmac` / `border-steel` on the `savanna` page background) and the active state (`text-savanna` on `bg-murram`) both meet WCAG AA (4.5:1 for text, 3:1 for the border against its background) using the browser's accessibility inspector or a contrast-checker tool. Adjust the Tailwind classes in `components/product/shop-filters.tsx` if any combination fails.

- [x] **Step 9: Commit any fixes found**

```bash
git add -A
git commit -m "fix: resolve issues found in Phase 4 verification gate"
```

(Skip if Steps 1–8 were already clean.)

---

## Definition of done for Phase 4

- [x] `/shop` shows every product with the category bar, filters, sort, and a live result count
- [x] `/shop/[category]` scopes to one category with an intro heading/description, and 404s on an unknown slug
- [x] Filters narrow by category, subcategory, brand, price bucket, and vehicle make, are shareable via URL, and each is independently clearable
- [x] Sort covers price low–high, high–low, newest, bestselling, and rating
- [x] Header search (desktop and mobile) matches product name/category/brand and navigates to `/search?q=...`
- [x] `/search` handles a missing query, a query with matches, and a query with zero matches, each with distinct, on-brand copy
- [x] Loading skeletons are wired for `/shop`, `/shop/[category]`, and `/search`
- [x] Every interactive element has a visible `murram` focus ring
- [x] Responsive from 375px (filters collapse into a drawer, grid drops to 2 columns, no horizontal scroll)
- [x] `npm test`, `npm run lint`, and `npx tsc --noEmit` all pass clean
- [x] One commit per task above

## Deviations from plan (discovered during execution)

Executed via `superpowers:subagent-driven-development` in an isolated git worktree (`worktree-phase-4-shop-search`, branched from `01910c9`) — fresh implementer subagent per task, spec-compliance review, then code-quality review, with fix/re-review loops wherever a reviewer found a real issue. All 14 tasks completed; every checkbox above is satisfied. A final holistic reviewer covering the entire diff (`01910c9..HEAD`) ran after all 14 tasks, per the skill's process, and confirmed the fixes made in response to its own findings.

- **Task 2 (searchProducts):** implementer initially used `PRODUCTS` as the test fixture name; house convention (confirmed via grep across existing test files) is `sample`. Fixed and reverified.
- **Task 3 (buildFilterHref):** code-quality review flagged the hand-maintained `PARAM_ORDER` array as a "Critical" drift risk against the `ShopFilterParams` type (a new key added to the type but not the array would silently vanish from every generated URL). Judged as a real but non-urgent maintenance concern rather than a present bug; downgraded to Important and fixed with a one-line `// Must list every key in ShopFilterParams` comment rather than a runtime exhaustiveness test (the reviewer's own suggested test wouldn't actually have caught the failure mode) or JSDoc (against house no-comment convention). The same pattern and fix were applied to Task 4's `KEYS` array in `parse-shop-search-params.ts`.
- **Task 8 (SortSelect):** Base UI's `onValueChange` is typed `(value: string | null) => void`, not `string`, unlike the plan's sketch. Implementer adapted correctly; spec reviewer independently confirmed against Base UI's actual type signatures.
- **Task 9 (ShopFilters):** two real defects found and fixed, one deferred and later resolved:
  1. Code-quality review found `aria-pressed` used on a `<Link>` — invalid ARIA (that attribute is only valid on elements with a button role). Fixed to `aria-current="true"`/`undefined`, matching the codebase's own precedent in `breadcrumbs.tsx`. **This plan's own code samples above still show the original `aria-pressed` — the actual committed code uses `aria-current`.**
  2. A hydration mismatch was later discovered during Task 14's live-browser verification (see below) and traced back to this task's mobile `SheetTrigger` JSX arrangement.
  3. Whether the mobile filter Sheet auto-closes when a pill inside it is clicked was flagged as an open question at Task 9 review time (component wasn't yet wired into a page). Resolved during Task 14: the Sheet correctly **stays open** after a pill selection (verified live), which is the right UX — it lets a user chain multiple filter taps without the drawer closing and reopening each time. Not a bug.
- **Task 10 (header search):** code-quality review added a `required` attribute to both search `<input>`s (cheap native-validation win, not in the original plan snippet).
- **Task 11 (`/shop`):** dev-server verification hit real environmental issues on this machine — a background `npm run dev` on port 3020 died silently, and system memory pressure (as low as 0.53 GB free) caused Turbopack "Jest worker" crashes on first compile of new routes. Resolved by reusing an already-running dev server on port 3010 and, in one case, killing and restarting just the worktree's dev server to free memory. Mid-review, the spec-review subagent was cut off with "You've hit your monthly spend limit"; the user was asked how to proceed (rather than guessing at the missing review output) and chose to retry, which succeeded.
- **Task 12 (`/shop/[category]`):** `http://localhost:3000/shop/not-a-real-category` returns HTTP 200, not the plan's expected 404, despite `notFound()` being called correctly. Root-caused (not assumed) to **documented, expected Next.js App Router behavior**: `notFound()` returns HTTP 200 for streamed responses (the App Router's default rendering mode) and only produces a true 404 status for non-streamed responses — confirmed against Next.js's own documentation, and independently reproduced with a real `next build && next start` production server. Not a code defect in this repo; both reviewers were briefed on this explicitly so it wasn't misflagged.
- **Cross-task consolidation (not a plan task, done ad hoc):** by Task 13, `SORT_OPTIONS` had been independently duplicated three times (`app/shop/page.tsx`'s `SORT_OPTIONS` Set literal, `app/shop/[category]/page.tsx`'s identical Set literal, and `sort-select.tsx`'s label array) plus a near-duplicate label list — three copies crossed the project's own "extract at third copy" threshold. Extracted a single canonical `SORT_OPTIONS` export (value+label pairs) into `lib/utils/sort-products.ts`; all four call sites now import from it. Fully verified: clean typecheck, 58/58 tests, three separate `curl` 200 checks, and an independent extraction of real rendered product prices from HTML to confirm actual sort order (not just that the request succeeded).
- **Task 14 (verification gate) — hydration mismatch found and fixed:** live browser verification surfaced a real React hydration mismatch (`data-slot="button"` on the client vs. `data-slot="sheet-trigger"` on the server for the same element) isolated to `ShopFilters`' mobile `Sheet` trigger. Confirmed this was specific to `ShopFilters` and not a pre-existing issue by checking the Home page's `MobileNav` (same `Sheet`/`SheetTrigger`/`Button` primitives, opposite JSX arrangement — children on `SheetTrigger` itself with a self-closing render-prop `Button`) produced zero hydration errors on a genuine fresh navigation. Fixed by matching `ShopFilters`' mobile trigger to that exact proven pattern. Verified independently (not just trusting the implementer's self-report): re-read the diff, ran `npx tsc --noEmit` myself, and did my own fresh-navigation + console check confirming zero hydration errors on both `/shop` and `/shop/[category]`.
- **Task 14 (verification gate) — three more issues found only through live interaction, fixed, and confirmed by the final holistic reviewer:**
  1. `SortSelect`'s trigger displayed the raw sort value (e.g. `price-asc`) instead of its label (e.g. "Price: Low to High") after a selection or on page load with `?sort=` in the URL. Root cause: Base UI's `Select.Value` does **not** auto-derive a label from `Select.Item` children the way Radix does (confirmed via Base UI's own `.d.ts` — it requires an explicit render-function `children` prop or an `items` map, or it falls back to the raw value). Fixed by giving `SelectValue` a `children` render function that looks up the label from `SORT_OPTIONS`.
  2. The `ProductGridSkeleton`'s `Skeleton` primitive used the generic shadcn `bg-muted` token (resolves to near-white, ~1.15:1 contrast against the `savanna` page background — functionally invisible), while the hand-rolled heading skeleton bars in the same `loading.tsx` files correctly used `bg-steel/30` (~1.69:1). Retimed `Skeleton` itself to `bg-steel/30` for consistency; this is the only place `Skeleton` is used in the codebase.
  3. `SortSelect`'s dropdown popup used unthemed shadcn defaults (`bg-popover`/`text-popover-foreground`, i.e. generic white/near-black) instead of the project's palette, inconsistent with `ShopFilters`' own `SheetContent` (`bg-savanna text-tarmac`) and `MobileNav`'s (`bg-tarmac text-savanna`). Fixed with `className` overrides on `SelectContent`/`SelectItem` (`bg-savanna text-tarmac`, `focus:bg-murram/10`).
  4. `SortSelect` visibility was inconsistent across the three list pages: `/search` correctly hid it when there were zero results to sort, but `/shop` and `/shop/[category]` always rendered it, including above an empty "No products match these filters" state. Aligned all three to the same `sorted.length > 0` guard.
- The plan's Step 6 (375px responsive check) and Step 7 (keyboard focus audit) hit the same `resize_window` tooling limitation documented in Phase 2/3's deviations logs — the tool reports success but doesn't actually change the CDP viewport (`window.innerWidth` stayed at the desktop value regardless of the requested size). Worked around by: (a) statically verifying the responsive Tailwind classes directly (`hidden w-64 shrink-0 md:block` / `md:hidden` on `ShopFilters`, `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` on `ProductGrid` — the same proven pattern already used elsewhere in the codebase), and (b) for interaction-dependent checks that genuinely needed the mobile layout to be interactive (confirming the mobile Filters button opens the Sheet, and specifically resolving the deferred Sheet-stays-open question from Task 9), temporarily injecting a CSS override (`.md\\:hidden { display: block !important; }`) via the browser to force the mobile-only elements visible at the current desktop viewport width, purely for interaction testing — removed immediately after each check, no application code touched. The keyboard focus audit itself used `document.activeElement`'s computed `boxShadow` after programmatic `.focus()` calls (cross-checked against `getComputedStyle(document.documentElement).getPropertyValue('--color-murram')` to confirm the oklab-space color Tailwind v4 renders really is `murram`) rather than relying on screenshot inspection alone, since `--ring` is mapped to `--color-murram` in `app/globals.css` and Tailwind v4's native oklab color space made the rendered box-shadow color non-obvious from a screenshot alone.
