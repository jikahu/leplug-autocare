# Phase 6 — Cart & Wishlist Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build the cart and wishlist experience per CLAUDE.md §4.6 and the roadmap's Phase 6 scope: a `/cart` page (line items, quantity edit, summary, promo field UI, proceed to checkout), a cart drawer that slides in on add-to-cart, an `/account/wishlist` page, and empty states for both.

**Architecture:**

- **This worktree branches from `master` at its current tip** (`9f335e1`, after Phases 4 and 5 both merged) — unlike Phase 5, which had to branch in parallel with an unmerged Phase 4, this phase sits cleanly on top of everything built so far. `/shop`, `/product/[slug]`, `Skeleton`, `ProductGrid`, `NoResults`, etc. all already exist and are reused directly below.
- **Cart drawer state lives in a new, unpersisted Zustand store** (`lib/store/cart-drawer.ts`, `{ isOpen, open, close }`), separate from the existing `useCartStore` (item data) and `useWishlistStore`. It has no `localStorage` persistence — whether the drawer happens to be open is not state worth remembering across a reload, unlike cart contents. Being a Zustand store (not React context) means any component anywhere in the tree — `ProductCard`, `ProductPurchasePanel`, the header's cart icon — can open it without prop drilling, and `CartDrawer` itself can be mounted once, inside `Header`, and still respond to triggers fired from completely different subtrees.
- **The header's cart icon changes from a `<Link href="/cart">` to a `<button>` that opens the drawer.** The drawer's own footer links to `/cart` (full page) and `/checkout`. This matches the roadmap's explicit split between "cart page" and "cart drawer" as two deliverables, and CLAUDE.md §3's motion guidance ("add-to-cart confirmation... cart drawer sliding in" as a response to action, not decoration).
- **`ProductCard` and `ProductPurchasePanel` (both already wired to `useCartStore.addItem`, from Phases 3 and 5) get one line added to their existing `handleAddToCart`**: call the drawer store's `open()` after adding. Their own local "Added"/`justAdded` button-text animation is untouched — the drawer opening is an additional confirmation, not a replacement.
- **No delivery fee is shown as a specific number on the cart page.** `deliveryFee(zone, subtotal)` (existing, from Phase 1) requires a delivery *zone*, and zone selection is a Phase 7 checkout step — inventing a default zone here would show a number that might not match what the customer actually pays. Instead, the cart summary shows the subtotal, a free-delivery progress note (zone-independent — the KSh 5,000 threshold from `FREE_DELIVERY_THRESHOLD` applies regardless of zone), and "Delivery calculated at checkout." A new `freeDeliveryRemaining(subtotal)` function is added to the existing `lib/utils/delivery-fee.ts` (not a new file) since it reuses that file's `FREE_DELIVERY_THRESHOLD` constant directly.
- **The promo code field is UI-only per CLAUDE.md §4/§13** ("promo code field (UI only)"). Submitting it shows an inline status message ("Promo codes aren't available yet — check back soon.") rather than silently doing nothing — CLAUDE.md §14's brand voice calls for interface copy that states what happened, not a control that looks broken.
- **The wishlist page reuses `ProductGrid` and `NoResults` (both from Phase 4) instead of building a parallel grid.** `NoResults` already takes a discriminated-union `variant` prop (`"search" | "filters"`); this phase adds a third variant, `"wishlist"`, with its own icon (`Heart`) and copy, so `ProductGrid`'s existing empty-state branch handles the empty-wishlist case for free. The component keeps its current name/location (`components/product/no-results.tsx`) rather than being renamed to something more generic — renaming would touch its three existing call sites (`/shop`, `/shop/[category]`, `/search`) for no functional benefit, a broader change than this phase needs.
- **The wishlist page is `app/account/wishlist/page.tsx`**, per CLAUDE.md §15's folder structure and the footer's existing `Account → Wishlist` link (built in Phase 2, pointing at `/account/wishlist`, dead until this task). The rest of `/account` (login, orders, profile) doesn't exist yet — that's Phase 8 — but the wishlist page needs no login (CLAUDE.md §8 describes wishlist as "add/remove, persisted client-side," independent of accounts), so it stands alone today exactly the way `/product/[slug]` stood alone before `/shop` existed in Phase 5, and gets wrapped in an `AccountNav` shell later.
- **No `loading.tsx` for `/cart` or `/account/wishlist`.** Both pages render synchronously from client-side Zustand store state — there's no `searchParams`/`params` promise to await and no server data fetch, unlike `/shop`, `/shop/[category]`, `/product/[slug]`, and `/search`, which all have loading skeletons because they await route params. A loading skeleton here would have nothing meaningful to cover.
- **Only pure functions and stores get Vitest tests, matching Phases 4 and 5's established convention** — confirmed by inspecting `lib/store/cart.test.ts` and `lib/utils/related-products.test.ts` (both plain `describe`/`it` unit tests, `sample`-prefixed fixtures where a `Product` is needed) and the complete absence of any `.test.tsx` component test anywhere in the repo. Components (`CartLineItem`, `CartSummary`, `CartDrawer`, etc.) are verified manually against the running dev server in Task 14, not with React Testing Library — this phase does not introduce new test infrastructure.
- **`CartLineItem`'s quantity stepper can decrement to 0, which removes the line** — this exactly matches `useCartStore.updateQuantity`'s existing behavior (`quantity <= 0` removes the item), so no extra floor/guard logic is needed. A separate, explicit "Remove" button is included alongside it for direct removal at any quantity, since not every user will discover that decrementing to zero removes the item.

**Tech Stack:** Existing stack, no new dependencies. Next.js 16.3.4 App Router, reusing `lib/data/products.ts` (`products`), `lib/store/cart.ts` (`useCartStore`), `lib/store/wishlist.ts` (`useWishlistStore`), `lib/utils/format-currency.ts` (`formatCurrency`), `lib/utils/category-icons.tsx` (`CategoryPlaceholderIcon`), `lib/utils/delivery-fee.ts` (`FREE_DELIVERY_THRESHOLD`), `components/ui/button.tsx` (`Button`), `components/ui/sheet.tsx` (`Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetFooter` — Base UI Dialog under the hood, same primitive `MobileNav` already uses), `components/layout/breadcrumbs.tsx` (`Breadcrumbs`), `components/product/product-card.tsx` (`ProductCard`), `components/product/product-grid.tsx` (`ProductGrid`), `components/product/no-results.tsx` (`NoResults`, extended). Vitest (`npm test` → `vitest run`) for the new pure-function utils and the new store, following the codebase's co-located `foo.ts` + `foo.test.ts` convention. Baseline confirmed clean on this worktree before starting: `npm test` → 67 passed (12 files), `npm run lint` → clean, `npx tsc --noEmit` → clean (after one `next build` to generate `.next/types`), `npm run build` → succeeds (pre-existing "Big Shoulders Stencil font override" warning only, not a regression).

---

### Task 1: `freeDeliveryRemaining` in `delivery-fee.ts` (TDD)

**Files:**
- Modify: `lib/utils/delivery-fee.ts`
- Modify: `lib/utils/delivery-fee.test.ts`

- [x] **Step 1: Write the failing test**

Append to `lib/utils/delivery-fee.test.ts` (add the import and the new `describe` block; keep the existing `deliveryFee` describe block as-is):

```ts
import { describe, it, expect } from "vitest";
import { deliveryFee, freeDeliveryRemaining } from "./delivery-fee";

describe("deliveryFee", () => {
  it("charges KSh 300 for Nairobi Metro under the free threshold", () => {
    expect(deliveryFee("nairobi_metro", 2000)).toBe(300);
  });

  it("charges KSh 600 for Outside Nairobi under the free threshold", () => {
    expect(deliveryFee("outside_nairobi", 2000)).toBe(600);
  });

  it("is free for Nairobi Metro at exactly the KSh 5,000 threshold", () => {
    expect(deliveryFee("nairobi_metro", 5000)).toBe(0);
  });

  it("is free for Outside Nairobi above the KSh 5,000 threshold", () => {
    expect(deliveryFee("outside_nairobi", 7500)).toBe(0);
  });
});

describe("freeDeliveryRemaining", () => {
  it("returns the amount left to reach free delivery", () => {
    expect(freeDeliveryRemaining(2000)).toBe(3000);
  });

  it("returns 0 at exactly the threshold", () => {
    expect(freeDeliveryRemaining(5000)).toBe(0);
  });

  it("returns 0 above the threshold", () => {
    expect(freeDeliveryRemaining(7500)).toBe(0);
  });

  it("returns the full threshold for an empty cart", () => {
    expect(freeDeliveryRemaining(0)).toBe(5000);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm test -- delivery-fee`
Expected: FAIL — `freeDeliveryRemaining` is not exported from `./delivery-fee`.

- [x] **Step 3: Write minimal implementation**

Modify `lib/utils/delivery-fee.ts` — add this function after `deliveryFee`:

```ts
export function freeDeliveryRemaining(subtotal: number): number {
  return Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
}
```

The full file should now read:

```ts
import type { Address } from "@/lib/types";

export const DELIVERY_ZONE_FEES: Record<Address["zone"], number> = {
  nairobi_metro: 300,
  outside_nairobi: 600,
};

export const FREE_DELIVERY_THRESHOLD = 5000;

export function deliveryFee(zone: Address["zone"], subtotal: number): number {
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  return DELIVERY_ZONE_FEES[zone];
}

export function freeDeliveryRemaining(subtotal: number): number {
  return Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npm test -- delivery-fee`
Expected: PASS, 8 tests (4 existing + 4 new).

- [x] **Step 5: Commit**

```bash
git add lib/utils/delivery-fee.ts lib/utils/delivery-fee.test.ts
git commit -m "feat: add freeDeliveryRemaining utility"
```

---

### Task 2: `getCartLines` / `getCartSubtotal` utilities (TDD)

**Files:**
- Create: `lib/utils/cart-lines.ts`
- Create: `lib/utils/cart-lines.test.ts`

- [x] **Step 1: Write the failing test**

Create `lib/utils/cart-lines.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getCartLines, getCartSubtotal } from "./cart-lines";
import type { Product } from "@/lib/types";
import type { CartItem } from "@/lib/types";

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

describe("getCartLines", () => {
  it("joins a cart item to its product and computes the line total", () => {
    const products = [sampleProduct({ id: "p1", price: 1500 })];
    const items: CartItem[] = [{ productId: "p1", quantity: 3 }];

    const lines = getCartLines(items, products);

    expect(lines).toEqual([
      { productId: "p1", product: products[0], quantity: 3, lineTotal: 4500 },
    ]);
  });

  it("preserves cart item order across multiple lines", () => {
    const products = [
      sampleProduct({ id: "p1", price: 1000 }),
      sampleProduct({ id: "p2", price: 2000 }),
    ];
    const items: CartItem[] = [
      { productId: "p2", quantity: 1 },
      { productId: "p1", quantity: 1 },
    ];

    const lines = getCartLines(items, products);

    expect(lines.map((line) => line.productId)).toEqual(["p2", "p1"]);
  });

  it("skips a cart item whose product no longer exists in the catalog", () => {
    const products = [sampleProduct({ id: "p1", price: 1000 })];
    const items: CartItem[] = [
      { productId: "p1", quantity: 1 },
      { productId: "discontinued", quantity: 1 },
    ];

    const lines = getCartLines(items, products);

    expect(lines).toHaveLength(1);
    expect(lines[0].productId).toBe("p1");
  });

  it("returns an empty array for an empty cart", () => {
    expect(getCartLines([], [sampleProduct({ id: "p1" })])).toEqual([]);
  });
});

describe("getCartSubtotal", () => {
  it("sums line totals across multiple lines", () => {
    const products = [
      sampleProduct({ id: "p1", price: 1000 }),
      sampleProduct({ id: "p2", price: 2500 }),
    ];
    const items: CartItem[] = [
      { productId: "p1", quantity: 2 },
      { productId: "p2", quantity: 1 },
    ];

    const subtotal = getCartSubtotal(getCartLines(items, products));

    expect(subtotal).toBe(4500);
  });

  it("returns 0 for no lines", () => {
    expect(getCartSubtotal([])).toBe(0);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm test -- cart-lines`
Expected: FAIL — cannot find module `./cart-lines`.

- [x] **Step 3: Write minimal implementation**

Create `lib/utils/cart-lines.ts`:

```ts
import type { CartItem, Product } from "@/lib/types";

export type CartLine = {
  productId: string;
  product: Product;
  quantity: number;
  lineTotal: number;
};

export function getCartLines(items: CartItem[], products: Product[]): CartLine[] {
  return items.reduce<CartLine[]>((lines, item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product) return lines;
    lines.push({
      productId: item.productId,
      product,
      quantity: item.quantity,
      lineTotal: product.price * item.quantity,
    });
    return lines;
  }, []);
}

export function getCartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.lineTotal, 0);
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npm test -- cart-lines`
Expected: PASS, 6 tests.

- [x] **Step 5: Commit**

```bash
git add lib/utils/cart-lines.ts lib/utils/cart-lines.test.ts
git commit -m "feat: add getCartLines and getCartSubtotal utilities"
```

---

### Task 3: Cart drawer store (TDD)

**Files:**
- Create: `lib/store/cart-drawer.ts`
- Create: `lib/store/cart-drawer.test.ts`

- [x] **Step 1: Write the failing test**

Create `lib/store/cart-drawer.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { useCartDrawerStore } from "./cart-drawer";

describe("useCartDrawerStore", () => {
  beforeEach(() => {
    useCartDrawerStore.setState({ isOpen: false });
  });

  it("starts closed", () => {
    expect(useCartDrawerStore.getState().isOpen).toBe(false);
  });

  it("opens", () => {
    useCartDrawerStore.getState().open();
    expect(useCartDrawerStore.getState().isOpen).toBe(true);
  });

  it("closes", () => {
    useCartDrawerStore.getState().open();
    useCartDrawerStore.getState().close();
    expect(useCartDrawerStore.getState().isOpen).toBe(false);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm test -- cart-drawer`
Expected: FAIL — cannot find module `./cart-drawer`.

- [x] **Step 3: Write minimal implementation**

Create `lib/store/cart-drawer.ts`:

```ts
import { create } from "zustand";

type CartDrawerState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useCartDrawerStore = create<CartDrawerState>()((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
```

- [x] **Step 4: Run test to verify it passes**

Run: `npm test -- cart-drawer`
Expected: PASS, 3 tests.

- [x] **Step 5: Commit**

```bash
git add lib/store/cart-drawer.ts lib/store/cart-drawer.test.ts
git commit -m "feat: add cart drawer store"
```

---

### Task 4: `CartTotals` component

**Files:**
- Create: `components/cart/cart-totals.tsx`

- [x] **Step 1: Create the component**

Create `components/cart/cart-totals.tsx`:

```tsx
import { formatCurrency } from "@/lib/utils/format-currency";
import { freeDeliveryRemaining } from "@/lib/utils/delivery-fee";

export function CartTotals({ subtotal }: { subtotal: number }) {
  const remaining = freeDeliveryRemaining(subtotal);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-tarmac/70">Subtotal</span>
        <span className="font-medium text-tarmac">{formatCurrency(subtotal)}</span>
      </div>

      {remaining > 0 ? (
        <>
          <p className="text-xs text-tarmac/60">
            Add {formatCurrency(remaining)} more for free delivery.
          </p>
          <p className="text-xs text-tarmac/60">Delivery calculated at checkout.</p>
        </>
      ) : (
        <p className="text-xs font-medium text-acacia">You&apos;ve unlocked free delivery.</p>
      )}

      <div className="flex items-center justify-between border-t border-steel/40 pt-2 text-base">
        <span className="font-semibold text-tarmac">Total</span>
        <span className="font-heading font-bold text-murram">{formatCurrency(subtotal)}</span>
      </div>
    </div>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/cart/cart-totals.tsx
git commit -m "feat: add CartTotals component"
```

---

### Task 5: `CartLineItem` component

**Files:**
- Create: `components/cart/cart-line-item.tsx`

- [x] **Step 1: Create the component**

Create `components/cart/cart-line-item.tsx`:

```tsx
"use client";

import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { formatCurrency } from "@/lib/utils/format-currency";
import { CategoryPlaceholderIcon } from "@/lib/utils/category-icons";
import type { CartLine } from "@/lib/utils/cart-lines";

export function CartLineItem({ line }: { line: CartLine }) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <div className="flex gap-4 border-b border-steel/40 py-4 last:border-b-0">
      <Link
        href={`/product/${line.product.slug}`}
        className="flex size-20 shrink-0 items-center justify-center rounded-lg border border-steel bg-linear-to-br from-chrome-start to-chrome-end focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
      >
        <CategoryPlaceholderIcon category={line.product.category} className="size-8 text-tarmac/30" />
      </Link>

      <div className="flex flex-1 flex-col gap-1">
        <Link
          href={`/product/${line.product.slug}`}
          className="line-clamp-2 rounded-sm text-sm font-medium text-tarmac hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        >
          {line.product.name}
        </Link>
        <span className="text-sm text-tarmac/70">{formatCurrency(line.product.price)} each</span>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex items-center rounded-md border border-steel/40">
            <button
              type="button"
              aria-label={`Decrease quantity of ${line.product.name}`}
              onClick={() => updateQuantity(line.productId, line.quantity - 1)}
              className="p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
            >
              <Minus className="size-3.5" />
            </button>
            <span
              aria-live="polite"
              aria-atomic="true"
              className="w-6 text-center text-sm font-medium text-tarmac"
            >
              {line.quantity}
            </span>
            <button
              type="button"
              aria-label={`Increase quantity of ${line.product.name}`}
              onClick={() => updateQuantity(line.productId, line.quantity + 1)}
              className="p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
            >
              <Plus className="size-3.5" />
            </button>
          </div>

          <button
            type="button"
            aria-label={`Remove ${line.product.name} from cart`}
            onClick={() => removeItem(line.productId)}
            className="rounded-sm p-1 text-steel hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <span className="shrink-0 font-semibold text-tarmac">{formatCurrency(line.lineTotal)}</span>
    </div>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/cart/cart-line-item.tsx
git commit -m "feat: add CartLineItem component"
```

---

### Task 6: `EmptyCart` component

**Files:**
- Create: `components/cart/empty-cart.tsx`

- [x] **Step 1: Create the component**

Create `components/cart/empty-cart.tsx`:

```tsx
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-steel/40 bg-tarmac/5 px-6 py-16 text-center">
      <ShoppingCart className="size-10 text-steel" aria-hidden="true" />
      <h2 className="font-heading text-xl font-bold text-tarmac">Your cart is empty</h2>
      <p className="max-w-md text-sm text-tarmac/70">
        Add parts, accessories, or care products to see them here.
      </p>
      <Button render={<Link href="/shop" />} nativeButton={false} className="mt-2">
        Browse Shop
      </Button>
    </div>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/cart/empty-cart.tsx
git commit -m "feat: add EmptyCart component"
```

---

### Task 7: `CartSummary` component

**Files:**
- Create: `components/cart/cart-summary.tsx`

- [x] **Step 1: Create the component**

Create `components/cart/cart-summary.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { CartTotals } from "@/components/cart/cart-totals";

export function CartSummary({ subtotal }: { subtotal: number }) {
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  function handlePromoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPromoMessage("Promo codes aren't available yet — check back soon.");
  }

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-steel/40 bg-savanna p-6">
      <h2 className="font-heading text-lg font-bold text-tarmac">Order Summary</h2>

      <form onSubmit={handlePromoSubmit} className="flex flex-col gap-2">
        <label htmlFor="promo-code" className="text-sm font-medium text-tarmac">
          Promo code
        </label>
        <div className="flex gap-2">
          <input
            id="promo-code"
            name="promo-code"
            type="text"
            placeholder="Enter code"
            className="w-full rounded-md border border-steel/40 bg-transparent px-3 py-1.5 text-sm text-tarmac outline-none focus-visible:ring-2 focus-visible:ring-murram"
          />
          <Button type="submit" variant="outline">
            Apply
          </Button>
        </div>
        {promoMessage && (
          <p role="status" className="text-xs text-tarmac/60">
            {promoMessage}
          </p>
        )}
      </form>

      <CartTotals subtotal={subtotal} />

      <Button render={<Link href="/checkout" />} nativeButton={false} className="w-full">
        Proceed to Checkout
      </Button>
    </div>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/cart/cart-summary.tsx
git commit -m "feat: add CartSummary component"
```

---

### Task 8: `CartDrawer` component

**Files:**
- Create: `components/cart/cart-drawer.tsx`

- [x] **Step 1: Create the component**

Create `components/cart/cart-drawer.tsx`:

```tsx
"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useCartStore } from "@/lib/store/cart";
import { useCartDrawerStore } from "@/lib/store/cart-drawer";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartTotals } from "@/components/cart/cart-totals";
import { products } from "@/lib/data/products";
import { getCartLines, getCartSubtotal } from "@/lib/utils/cart-lines";

export function CartDrawer() {
  const items = useCartStore((state) => state.items);
  const isOpen = useCartDrawerStore((state) => state.isOpen);
  const close = useCartDrawerStore((state) => state.close);

  const lines = getCartLines(items, products);
  const subtotal = getCartSubtotal(lines);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <SheetContent side="right" className="border-steel bg-savanna text-tarmac">
        <SheetHeader>
          <SheetTitle className="text-tarmac">Your Cart</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <ShoppingCart className="size-8 text-steel" aria-hidden="true" />
              <p className="text-sm text-tarmac/70">Your cart is empty.</p>
            </div>
          ) : (
            lines.map((line) => <CartLineItem key={line.productId} line={line} />)
          )}
        </div>

        {lines.length > 0 && (
          <SheetFooter className="gap-3 border-t border-steel/40">
            <CartTotals subtotal={subtotal} />
            <Button
              render={<Link href="/cart" onClick={close} />}
              nativeButton={false}
              variant="outline"
              className="w-full"
            >
              View Cart
            </Button>
            <Button
              render={<Link href="/checkout" onClick={close} />}
              nativeButton={false}
              className="w-full"
            >
              Checkout
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/cart/cart-drawer.tsx
git commit -m "feat: add CartDrawer component"
```

---

### Task 9: Wire the header's cart icon to the drawer

**Files:**
- Modify: `components/layout/header.tsx`

- [x] **Step 1: Replace the cart link with a drawer trigger, and mount CartDrawer**

In `components/layout/header.tsx`, update the imports at the top of the file — replace:

```tsx
import { Search, ShoppingCart, User } from "lucide-react";
import { useCartItemCount } from "@/lib/store/cart";
import { MobileNav } from "./mobile-nav";
```

with:

```tsx
import { Search, ShoppingCart, User } from "lucide-react";
import { useCartItemCount } from "@/lib/store/cart";
import { useCartDrawerStore } from "@/lib/store/cart-drawer";
import { MobileNav } from "./mobile-nav";
import { CartDrawer } from "@/components/cart/cart-drawer";
```

Inside the `Header` function, add the drawer's `open` action next to the existing `itemCount` line — replace:

```tsx
  const itemCount = useCartItemCount();
  const router = useRouter();
```

with:

```tsx
  const itemCount = useCartItemCount();
  const openCartDrawer = useCartDrawerStore((state) => state.open);
  const router = useRouter();
```

Replace the cart `<Link>` in the header's action row:

```tsx
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
```

with:

```tsx
          <button
            type="button"
            onClick={openCartDrawer}
            className="relative rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
          >
            <ShoppingCart className="size-5" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-murram text-[10px] font-bold text-savanna">
                {itemCount}
              </span>
            )}
          </button>
```

Finally, mount `<CartDrawer />` once, as the last child of the `<header>` element (after the mobile search block, right before the closing `</header>` tag):

```tsx
      {mobileSearchOpen && (
        <div className="border-t border-steel px-4 py-3 md:hidden">
          {/* ...existing mobile search form, unchanged... */}
        </div>
      )}

      <CartDrawer />
    </header>
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/layout/header.tsx
git commit -m "feat: open cart drawer from header cart icon"
```

---

### Task 10: Open the drawer on add-to-cart

**Files:**
- Modify: `components/product/product-card.tsx`
- Modify: `components/product/product-purchase-panel.tsx`

- [x] **Step 1: Wire ProductCard**

In `components/product/product-card.tsx`, add the import:

```tsx
import { useCartStore } from "@/lib/store/cart";
import { useCartDrawerStore } from "@/lib/store/cart-drawer";
import { useWishlistStore } from "@/lib/store/wishlist";
```

Add the drawer action next to the existing store hooks:

```tsx
  const addItem = useCartStore((state) => state.addItem);
  const openCartDrawer = useCartDrawerStore((state) => state.open);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(product.id));
```

Update `handleAddToCart`:

```tsx
  function handleAddToCart() {
    addItem(product.id);
    openCartDrawer();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }
```

- [x] **Step 2: Wire ProductPurchasePanel**

In `components/product/product-purchase-panel.tsx`, add the import:

```tsx
import { useCartStore } from "@/lib/store/cart";
import { useCartDrawerStore } from "@/lib/store/cart-drawer";
import { useWishlistStore } from "@/lib/store/wishlist";
```

Add the drawer action next to the existing store hooks:

```tsx
  const addItem = useCartStore((state) => state.addItem);
  const openCartDrawer = useCartDrawerStore((state) => state.open);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(product.id));
```

Update `handleAddToCart`:

```tsx
  function handleAddToCart() {
    addItem(product.id, quantity);
    openCartDrawer();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }
```

- [x] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 4: Commit**

```bash
git add components/product/product-card.tsx components/product/product-purchase-panel.tsx
git commit -m "feat: open cart drawer on add-to-cart"
```

---

### Task 11: `/cart` page

**Files:**
- Create: `components/cart/cart-page-content.tsx`
- Create: `app/cart/page.tsx`

- [x] **Step 1: Create the client content component**

Create `components/cart/cart-page-content.tsx`:

```tsx
"use client";

import { useCartStore } from "@/lib/store/cart";
import { getCartLines, getCartSubtotal } from "@/lib/utils/cart-lines";
import { products } from "@/lib/data/products";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { EmptyCart } from "@/components/cart/empty-cart";

export function CartPageContent() {
  const items = useCartStore((state) => state.items);
  const lines = getCartLines(items, products);

  if (lines.length === 0) {
    return <EmptyCart />;
  }

  const subtotal = getCartSubtotal(lines);

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <div className="flex-1 rounded-lg border border-steel/40 bg-savanna px-4">
        {lines.map((line) => (
          <CartLineItem key={line.productId} line={line} />
        ))}
      </div>
      <div className="md:w-80">
        <CartSummary subtotal={subtotal} />
      </div>
    </div>
  );
}
```

- [x] **Step 2: Create the page**

Create `app/cart/page.tsx`:

```tsx
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CartPageContent } from "@/components/cart/cart-page-content";

export const metadata: Metadata = {
  title: "Your Cart — LePlug Autocare",
  description: "Review the items in your cart, update quantities, and proceed to checkout.",
};

export default function CartPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Cart" }]} />
      <h1 className="mt-2 font-heading text-3xl font-black text-tarmac">Your Cart</h1>
      <div className="mt-6">
        <CartPageContent />
      </div>
    </main>
  );
}
```

- [x] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 4: Commit**

```bash
git add components/cart/cart-page-content.tsx app/cart/page.tsx
git commit -m "feat: add /cart page"
```

---

### Task 12: Add a "wishlist" variant to `NoResults`

**Files:**
- Modify: `components/product/no-results.tsx`

- [x] **Step 1: Extend the component**

Replace the full contents of `components/product/no-results.tsx`:

```tsx
import Link from "next/link";
import { Heart, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export type NoResultsProps =
  | { variant: "search"; query: string }
  | { variant: "filters"; clearHref: string }
  | { variant: "wishlist" };

export function NoResults(props: NoResultsProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-steel/40 bg-tarmac/5 px-6 py-16 text-center">
      {props.variant === "wishlist" ? (
        <Heart className="size-10 text-steel" aria-hidden="true" />
      ) : (
        <SearchX className="size-10 text-steel" aria-hidden="true" />
      )}

      {props.variant === "search" && (
        <>
          <h2 className="font-heading text-xl font-bold text-tarmac">
            No results for &quot;{props.query}&quot;
          </h2>
          <p className="max-w-md text-sm text-tarmac/70">
            Check the spelling, try a shorter search term, or browse categories instead.
          </p>
        </>
      )}

      {props.variant === "filters" && (
        <>
          <h2 className="font-heading text-xl font-bold text-tarmac">No products match these filters</h2>
          <p className="max-w-md text-sm text-tarmac/70">
            Try removing a filter, or clear them all to see more products.
          </p>
        </>
      )}

      {props.variant === "wishlist" && (
        <>
          <h2 className="font-heading text-xl font-bold text-tarmac">Your wishlist is empty</h2>
          <p className="max-w-md text-sm text-tarmac/70">
            Save products you&apos;re eyeing so you can find them again later.
          </p>
        </>
      )}

      <Button
        render={
          <Link
            href={
              props.variant === "filters"
                ? props.clearHref
                : "/shop"
            }
          />
        }
        nativeButton={false}
        className="mt-2"
      >
        {props.variant === "filters" ? "Clear Filters" : "Browse Shop"}
      </Button>
    </div>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS — this file has no dedicated test, but confirm nothing else broke (67+ tests, no regressions).

- [x] **Step 4: Commit**

```bash
git add components/product/no-results.tsx
git commit -m "feat: add wishlist variant to NoResults"
```

---

### Task 13: `/account/wishlist` page

**Files:**
- Create: `components/account/wishlist-grid.tsx`
- Create: `app/account/wishlist/page.tsx`

- [x] **Step 1: Create the client grid component**

Create `components/account/wishlist-grid.tsx`:

```tsx
"use client";

import { useWishlistStore } from "@/lib/store/wishlist";
import { products } from "@/lib/data/products";
import { ProductGrid } from "@/components/product/product-grid";

export function WishlistGrid() {
  const productIds = useWishlistStore((state) => state.productIds);
  const wishlisted = products.filter((product) => productIds.includes(product.id));

  return <ProductGrid products={wishlisted} emptyState={{ variant: "wishlist" }} />;
}
```

- [x] **Step 2: Create the page**

Create `app/account/wishlist/page.tsx`:

```tsx
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { WishlistGrid } from "@/components/account/wishlist-grid";

export const metadata: Metadata = {
  title: "Your Wishlist — LePlug Autocare",
  description: "Products you've saved to buy later.",
};

export default function WishlistPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Wishlist" }]} />
      <h1 className="mt-2 font-heading text-3xl font-black text-tarmac">Your Wishlist</h1>
      <div className="mt-6">
        <WishlistGrid />
      </div>
    </main>
  );
}
```

- [x] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 4: Commit**

```bash
git add components/account/wishlist-grid.tsx app/account/wishlist/page.tsx
git commit -m "feat: add /account/wishlist page"
```

---

### Task 14: Phase 6 verification gate

**Files:** None (verification only — fix-forward if issues are found, in the same files touched above).

- [x] **Step 1: Run the full automated suite**

Run in order:
```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```
Expected: all four clean (build may repeat the pre-existing "Big Shoulders Stencil font override" warning — that is not a regression, ignore it).

- [x] **Step 2: Start the dev server**

```bash
npm run dev
```

- [x] **Step 3: Manually verify the cart drawer**

In a browser, on any page with a `ProductCard` (e.g. `/shop`) or on a `/product/[slug]` page:
- Click "Add to Cart". Expected: the drawer slides in from the right showing the item, quantity, and running subtotal; the header's cart badge count updates.
- Add a second, different product from a different page while the drawer's earlier state persists across navigation (open `/shop`, add one item, navigate to a product page, add another). Expected: both items appear in the drawer/cart; drawer re-opens with both.
- Click "View Cart" in the drawer. Expected: navigates to `/cart`, drawer closes.
- Click the header cart icon. Expected: drawer opens without navigating away.
- Click outside the drawer (backdrop) or press Escape. Expected: drawer closes.

- [x] **Step 4: Manually verify the `/cart` page**

- With items in the cart: quantity `+`/`-` buttons update the line and the running subtotal/total live; the `X` remove button removes a line; decrementing quantity to 0 also removes the line.
- Type something into the promo code field and click "Apply". Expected: inline "Promo codes aren't available yet — check back soon." message appears, no price change.
- Add enough items to cross KSh 5,000. Expected: the free-delivery note switches from "Add KSh X more..." to "You've unlocked free delivery."
- Click "Proceed to Checkout". Expected: navigates to `/checkout` (this 404s until Phase 7 — expected, matches the same pre-existing-dead-link pattern `/shop` had before Phase 4 and `/product/[slug]` had before Phase 5).
- Remove every item (or open `/cart` with an empty cart). Expected: `EmptyCart` renders — heading, message, "Browse Shop" button to `/shop`.

- [x] **Step 5: Manually verify the wishlist**

- On a `/shop` or `/product/[slug]` page, click the heart/"Add to Wishlist" control on a couple of products. Expected: heart fills in immediately.
- Navigate to `/account/wishlist` (footer "Account → Wishlist" link, or directly). Expected: the wishlisted products render as a `ProductGrid`, each with working Add to Cart / remove-from-wishlist controls.
- Remove all wishlisted products (toggle the hearts off, or use the wishlist page's own heart button on each card). Expected: `NoResults` with the `"wishlist"` variant renders — Heart icon, "Your wishlist is empty" heading, "Browse Shop" button.

- [x] **Step 6: Reload-persistence check**

With items in both the cart and the wishlist, hard-reload the browser page. Expected: cart badge count, `/cart` contents, and `/account/wishlist` contents all survive the reload (confirms `useCartStore`/`useWishlistStore` persistence + `StoreHydration`, both pre-existing from Phase 2, still work correctly with the new UI on top).

- [x] **Step 7: Keyboard and focus check**

Using Tab/Shift+Tab and Enter/Space only (no mouse):
- Open the cart drawer from the header cart icon, tab through its line items' quantity buttons and the Checkout/View Cart buttons, close it with Escape.
- On `/cart`, tab through quantity controls and the remove button on a line item; confirm a visible `murram` focus ring on every interactive element.

- [x] **Step 8: Record deviations and mark the plan complete**

If Steps 1–7 surfaced any real deviation from this plan (a bug fixed, a judgment call made that isn't already captured in the Architecture section above), append a `## Deviations from plan (discovered during execution)` section at the end of this file describing it, following the same style as `docs/superpowers/plans/2026-09-04-phase-5-product-detail-page.md`'s equivalent section. If nothing deviated, still append that section stating so explicitly. Then check off every remaining box in this plan.

- [x] **Step 9: Stop the dev server and commit any fix-forward changes**

If Steps 1–7 required code fixes, commit them now with an appropriate `fix:` message. Then:

```bash
git add docs/superpowers/plans/2026-09-04-phase-6-cart-wishlist.md
git commit -m "docs: mark Phase 6 plan complete, record deviations from plan"
```

---

## Definition of done for Phase 6

- [x] Cart drawer opens on add-to-cart from both `ProductCard` and `ProductPurchasePanel`, and from the header cart icon
- [x] `/cart` page: line items, quantity edit, remove, running subtotal/total, free-delivery progress note, promo code field (UI only), "Proceed to Checkout" link, empty state
- [x] `/account/wishlist` page: wishlisted products as a `ProductGrid`, empty state
- [x] Cart and wishlist state persist across a reload (existing Phase 2 stores, unmodified persistence behavior)
- [x] `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build` all clean
- [x] Keyboard focus visible throughout new interactive elements; drawer closes on Escape/backdrop click

---

## Deviations from plan (discovered during execution)

Executed via `superpowers:subagent-driven-development` in an isolated git worktree (`.claude/worktrees/phase-6-cart-wishlist`, branch `worktree-phase-6-cart-wishlist`, branched from `master` at `9f335e1` — after Phases 4 and 5 both merged) — fresh implementer subagent per task, spec-compliance review, then code-quality review, with fix/re-review loops wherever a reviewer found a real issue. All 14 tasks completed; every checkbox above is satisfied.

**Fixes applied beyond the plan's literal spec, all found by code-quality review and fixed before moving to the next task:**

- **Task 4 (`CartTotals`):** the free-delivery message and total value change when quantity is edited elsewhere in the cart, but nothing in the component announced that to screen readers. Added `aria-live="polite" aria-atomic="true"` to the message block and the total figure.
- **Task 5 (`CartLineItem`):** the "-" stepper originally decremented straight to 0 (relying on the store to delete the line), which meant a screen-reader user could lose the whole row with no announcement that it had been removed. Floored the decrement at 1 (`Math.max(1, line.quantity - 1)`), matching `ProductPurchasePanel`'s existing pattern — the separate, explicit "Remove" (X) button is now the only way to delete a line. Also added `self-center` to the line total (it was pinned to the top of the row) and bumped the remove button's tap target from `p-1` to `p-1.5` to match its sibling in `ProductCard`.
- **Task 9 (header wiring):** added `aria-haspopup="dialog"`/`aria-expanded={isCartDrawerOpen}` to the cart button, matching the existing pattern already used by the header's own mobile-search toggle in the same file.
- **Task 11 (`/cart` page) and Task 13 (`/account/wishlist` page) — the significant one:** both pages initially read their persisted store's data directly on first render with no guard, exactly as their own task specs said to. This produced two escalating problems, both fixed:
  1. **UX bug, caught by code review before merging Task 11:** since `useCartStore`/`useWishlistStore` use `skipHydration: true` (manual rehydrate, to avoid a client/server mismatch on the *first* render), a *direct navigation* to `/cart` or `/account/wishlist` — the exact way the header drawer's "View Cart" link and the footer's "Wishlist" link work — briefly rendered the wrong empty state before the persisted data loaded a moment later. `CartDrawer` never shows this because it only opens well after hydration has already finished; these two pages are different because they're navigation *targets*. Fixed by adding a `hasHydrated` guard (`return null` until true) to both pages' content components.
  2. **Build-breaking bug, caught by `npm run build` in this task's own verification gate:** that first guard called `useCartStore.persist.hasHydrated()` directly inside a `useState` lazy initializer, which runs during `next build`'s static-generation pass — a Node environment with no `localStorage` global. `createJSONStorage(() => localStorage)` evaluates `localStorage` eagerly and throws there; the throw is caught internally by zustand and `createJSONStorage` returns `undefined`, which makes the `persist` middleware bail out and never attach `.persist` to the store at all in that context — so `useCartStore.persist` was `undefined` and the build crashed. Root-caused by reading zustand v5.0.15's actual middleware source (`node_modules/zustand/esm/middleware.mjs`), not guessed. Fixed properly with `useCartHasHydrated()`/`useWishlistHasHydrated()` (added to `lib/store/cart.ts`/`lib/store/wishlist.ts`), built on React's `useSyncExternalStore` with a hardcoded `() => false` `getServerSnapshot` and all `.persist` access deferred into closures that are never invoked server-side — verified against React's own server dispatcher source, and against a real `npm run build` (deleting `.next` first to clear an unrelated transient Windows/OneDrive file-lock on `favicon.ico`) that now prerenders `/cart` and `/account/wishlist` as static routes with no error. `WishlistGrid` additionally switched from `products.filter(...)` (catalog order) to `productIds.map(...).filter(...)` (add order), matching `getCartLines`' ordering behavior on the cart side — a minor consistency fix bundled into the same edit.

**Discovered, out-of-scope bug — flagged, not fixed in this phase:** manual browser verification (Task 14, Steps 3–5) turned up a real, reproducible bug in `ProductCard`'s wishlist heart button (built in Phase 3, untouched by this phase): on a fresh page load where the wishlist already has a saved product, the heart can get **permanently** stuck showing "not wishlisted" — not a brief flash, confirmed to persist indefinitely (tested past 5 seconds) — until the user clicks it, at which point it acts on the *actual* (correct) underlying state, which from the user's point of view means clicking an apparently-empty heart *removes* the item instead of adding it. Confirmed reproducible in an actual `next start` production build (a second server on port 3005, separate origin/localStorage, to rule out a dev-only Fast-Refresh/HMR artifact), so this is real, not a tooling quirk. Root cause traced partway: `ProductCard` reads `useWishlistStore((state) => state.isWishlisted(product.id))` with zustand's default (unguarded) `useStore`, whose `getServerSnapshot` reads `api.getInitialState()` — a value zustand's vanilla store (`node_modules/zustand/esm/vanilla.mjs`) captures once at module load and *never* updates, unlike `api.getState()`. The exact reason the follow-up live re-render (which should fire once `StoreHydration`'s `rehydrate()` calls `setState`) never reaches this component wasn't fully pinned down — it's consistent with a missed notification between the component's initial render and its `useSyncExternalStore` subscription effect actually registering, but that specific race is exactly what `useSyncExternalStore` is designed to close, so there may be another factor (something route-type-specific: `/shop` is server-rendered on demand, `ƒ`, unlike the two static, `○`, pages this phase's fix landed on) not yet identified. **This bug predates this phase** (same code, same pattern, since Phase 3) and most likely also affects `ProductPurchasePanel`'s wishlist button (Phase 5) and the header's cart-count badge (`useCartItemCount`, Phase 2) for the identical reason, so it isn't scoped to one file this phase owns — it's a cross-cutting hydration-safety gap in how persisted Zustand state is read throughout the app, exactly the kind of audit the roadmap's Phase 10 ("Cross-Cutting Polish & QA") is for. Recommend either a dedicated fix pass before public launch, or explicitly carrying it into Phase 10's scope; not fixed here to avoid this phase reaching into Phase 2/3/5 files for a problem bigger than "cart and wishlist pages."
