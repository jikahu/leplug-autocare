# Phase 2 — Global Layout & Zustand Stores Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the persistent site chrome (header, footer, mobile nav, breadcrumbs, category bar) and the Zustand cart/wishlist stores with localStorage persistence, per CLAUDE.md §5. Wire header/footer into the root layout so every future page inherits them automatically.

**Architecture:** Stores live in `lib/store/` as plain Zustand hooks (`useCartStore`, `useWishlistStore`) using the `persist` middleware against `localStorage`. Layout components live in `components/layout/`. The header needs scroll state (client component); footer and breadcrumbs are presentational. Mobile nav uses shadcn's `Sheet` (built on this project's Base UI backend) for a fully accessible full-screen panel — focus trap, ESC-to-close, and ARIA wiring come for free. The category mega-panel uses shadcn's `NavigationMenu`. Store tests run under a `jsdom` environment (via a per-file `// @vitest-environment jsdom` pragma) since `persist` touches `localStorage`, which doesn't exist in vitest's default `node` environment.

**Tech Stack:** Zustand, zustand/middleware (persist), shadcn `sheet` + `navigation-menu` components, lucide-react icons (verified available in this project's lucide-react v1.39.0: `Menu`, `X`, `Search`, `ShoppingCart`, `User`, `ChevronDown`, `ChevronRight`, `MapPin`, `Phone`, `Mail`, `MessageCircle`, `Truck`, `ShieldCheck`, `Smartphone` — note `Instagram`/`Facebook`/`Twitter` are NOT available in this lucide-react version, so social links use text labels, not icons), jsdom (new test-only dependency).

---

### Task 1: Install Zustand and jsdom

**Files:**
- Modify: `package.json`

- [x] **Step 1: Install Zustand (runtime) and jsdom (test-only)**

```bash
npm install zustand
npm install -D jsdom
```

- [x] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add Zustand for cart/wishlist state and jsdom for store tests"
```

---

### Task 2: Cart store (TDD)

**Files:**
- Create: `lib/store/cart.ts`
- Test: `lib/store/cart.test.ts`

- [x] **Step 1: Write the failing test**

Create `lib/store/cart.test.ts`:

```ts
// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "./cart";

describe("useCartStore", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
    localStorage.clear();
  });

  it("adds a new item", () => {
    useCartStore.getState().addItem("p1", 2);
    expect(useCartStore.getState().items).toEqual([{ productId: "p1", quantity: 2 }]);
  });

  it("increments quantity when adding an existing item again", () => {
    useCartStore.getState().addItem("p1", 1);
    useCartStore.getState().addItem("p1", 2);
    expect(useCartStore.getState().items).toEqual([{ productId: "p1", quantity: 3 }]);
  });

  it("defaults quantity to 1 when not specified", () => {
    useCartStore.getState().addItem("p1");
    expect(useCartStore.getState().items).toEqual([{ productId: "p1", quantity: 1 }]);
  });

  it("removes an item", () => {
    useCartStore.getState().addItem("p1", 1);
    useCartStore.getState().removeItem("p1");
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("updates quantity", () => {
    useCartStore.getState().addItem("p1", 1);
    useCartStore.getState().updateQuantity("p1", 5);
    expect(useCartStore.getState().items).toEqual([{ productId: "p1", quantity: 5 }]);
  });

  it("removes the item when quantity is updated to zero", () => {
    useCartStore.getState().addItem("p1", 1);
    useCartStore.getState().updateQuantity("p1", 0);
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("clears all items", () => {
    useCartStore.getState().addItem("p1", 1);
    useCartStore.getState().addItem("p2", 1);
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("persists items to localStorage under the leplug-cart key", () => {
    useCartStore.getState().addItem("p1", 3);
    const raw = localStorage.getItem("leplug-cart");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).state.items).toEqual([{ productId: "p1", quantity: 3 }]);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/store/cart.test.ts`

Expected: FAIL — `Cannot find module './cart'`.

- [x] **Step 3: Write minimal implementation**

Create `lib/store/cart.ts`:

```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/lib/types";

type CartState = {
  items: CartItem[];
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (productId, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.productId === productId);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.productId === productId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, { productId, quantity }] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.productId !== productId)
              : state.items.map((item) =>
                  item.productId === productId ? { ...item, quantity } : item
                ),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "leplug-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function useCartItemCount(): number {
  return useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/store/cart.test.ts`

Expected: PASS (7/7).

- [x] **Step 5: Commit**

```bash
git add lib/store/cart.ts lib/store/cart.test.ts
git commit -m "feat: add Zustand cart store with localStorage persistence"
```

---

### Task 3: Wishlist store (TDD)

**Files:**
- Create: `lib/store/wishlist.ts`
- Test: `lib/store/wishlist.test.ts`

- [x] **Step 1: Write the failing test**

Create `lib/store/wishlist.test.ts`:

```ts
// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { useWishlistStore } from "./wishlist";

describe("useWishlistStore", () => {
  beforeEach(() => {
    useWishlistStore.setState({ productIds: [] });
    localStorage.clear();
  });

  it("adds a product on toggle when not present", () => {
    useWishlistStore.getState().toggle("p1");
    expect(useWishlistStore.getState().productIds).toEqual(["p1"]);
  });

  it("removes a product on toggle when already present", () => {
    useWishlistStore.getState().toggle("p1");
    useWishlistStore.getState().toggle("p1");
    expect(useWishlistStore.getState().productIds).toEqual([]);
  });

  it("reports wishlisted state correctly", () => {
    useWishlistStore.getState().toggle("p1");
    expect(useWishlistStore.getState().isWishlisted("p1")).toBe(true);
    expect(useWishlistStore.getState().isWishlisted("p2")).toBe(false);
  });

  it("clears all products", () => {
    useWishlistStore.getState().toggle("p1");
    useWishlistStore.getState().toggle("p2");
    useWishlistStore.getState().clear();
    expect(useWishlistStore.getState().productIds).toEqual([]);
  });

  it("persists to localStorage under the leplug-wishlist key", () => {
    useWishlistStore.getState().toggle("p1");
    const raw = localStorage.getItem("leplug-wishlist");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).state.productIds).toEqual(["p1"]);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/store/wishlist.test.ts` — expect module-not-found failure.

- [x] **Step 3: Write minimal implementation**

Create `lib/store/wishlist.ts`:

```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type WishlistState = {
  productIds: string[];
  toggle: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  clear: () => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        })),
      isWishlisted: (productId) => get().productIds.includes(productId),
      clear: () => set({ productIds: [] }),
    }),
    {
      name: "leplug-wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/store/wishlist.test.ts` — expect PASS (5/5).

- [x] **Step 5: Commit**

```bash
git add lib/store/wishlist.ts lib/store/wishlist.test.ts
git commit -m "feat: add Zustand wishlist store with localStorage persistence"
```

---

### Task 4: Add shadcn Sheet and NavigationMenu components

**Files:**
- Create: `components/ui/sheet.tsx`, `components/ui/navigation-menu.tsx` (plus any dependency files the CLI adds)

- [x] **Step 1: Run the shadcn add command**

```bash
npx shadcn@latest add sheet navigation-menu
```

Expected: `components/ui/sheet.tsx` and `components/ui/navigation-menu.tsx` created without errors. If the CLI prompts about overwriting `globals.css` again, decline/skip that part if it would re-introduce the Geist font regression from Phase 0 — inspect the diff it proposes before accepting.

- [x] **Step 2: Verify globals.css wasn't regressed**

Run: `grep -n "font-sans\|font-heading\|Geist" app/globals.css`

Expected: still shows `--font-sans: var(--font-inter), sans-serif;` and no `Geist` references (the Phase 0 fix). If the add command reintroduced a regression, reapply the Phase 0 fix (see `docs/superpowers/plans/2026-09-01-phase-0-scaffold.md` Task 4).

- [x] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 4: Commit**

```bash
git add components.json components/ui package.json package-lock.json app/globals.css
git commit -m "feat: add shadcn Sheet and NavigationMenu components"
```

---

### Task 5: Breadcrumbs component

**Files:**
- Create: `components/layout/breadcrumbs.tsx`

- [x] **Step 1: Create the component**

Create `components/layout/breadcrumbs.tsx`:

```tsx
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-tarmac/70">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram rounded-sm">
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
            {item.href && index < items.length - 1 ? (
              <Link href={item.href} className="hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram rounded-sm">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-tarmac">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/layout/breadcrumbs.tsx
git commit -m "feat: add Breadcrumbs component"
```

---

### Task 6: Mobile navigation (Sheet-based)

**Files:**
- Create: `components/layout/mobile-nav.tsx`

- [x] **Step 1: Create the component**

Create `components/layout/mobile-nav.tsx`:

```tsx
"use client";

import Link from "next/link";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavLink = { label: string; href: string };

export function MobileNav({ navLinks }: { navLinks: NavLink[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-savanna hover:bg-savanna/10"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-tarmac text-savanna border-steel w-full sm:max-w-full">
        <SheetHeader>
          <SheetTitle className="font-heading text-savanna">LE PLUG AUTOCARE</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-3 text-lg font-medium hover:bg-savanna/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/account/login"
            className="flex items-center gap-2 rounded-md px-3 py-3 text-lg font-medium hover:bg-savanna/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
          >
            <User className="size-5" aria-hidden="true" />
            Account
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`. If the generated `sheet.tsx` exports different names than `SheetHeader`/`SheetTitle`/`SheetTrigger`/`SheetContent` (check `components/ui/sheet.tsx` from Task 4 to confirm exact export names before assuming), adjust the imports here to match.

Expected: no errors.

- [x] **Step 3: Commit**

```bash
git add components/layout/mobile-nav.tsx
git commit -m "feat: add Sheet-based full-screen mobile navigation"
```

---

### Task 7: Header component

**Files:**
- Create: `components/layout/header.tsx`

- [x] **Step 1: Create the component**

Create `components/layout/header.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 24);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-steel bg-tarmac text-savanna">
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-[height] duration-200 md:px-8 ${
          isScrolled ? "h-14" : "h-20"
        }`}
      >
        <Link href="/" className="shrink-0 font-heading text-xl font-black">
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

        <div className="hidden max-w-sm flex-1 items-center gap-2 rounded-md border border-steel bg-savanna/5 px-3 py-1.5 md:flex">
          <Search className="size-4 shrink-0 text-savanna/70" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search parts, accessories..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-savanna/50"
            aria-label="Search products"
          />
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <button
            type="button"
            onClick={() => setMobileSearchOpen((open) => !open)}
            className="rounded-sm md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
            aria-label="Toggle search"
            aria-expanded={mobileSearchOpen}
          >
            <Search className="size-5" />
          </button>
          <Link
            href="/account/login"
            className="hidden rounded-sm md:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
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
          <div className="flex items-center gap-2 rounded-md border border-steel bg-savanna/5 px-3 py-1.5">
            <Search className="size-4 shrink-0 text-savanna/70" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search parts, accessories..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-savanna/50"
              aria-label="Search products"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/layout/header.tsx
git commit -m "feat: add sticky Header with scroll compression and mobile search toggle"
```

---

### Task 8: Footer component

**Files:**
- Create: `components/layout/footer.tsx`

- [x] **Step 1: Create the component**

Create `components/layout/footer.tsx`:

```tsx
import Link from "next/link";
import { categories } from "@/lib/data/categories";

const INFO_LINKS = [
  { label: "About", href: "/about" },
  { label: "Delivery", href: "/faq#delivery" },
  { label: "How to Buy", href: "/faq#how-to-buy" },
  { label: "FAQ", href: "/faq" },
];

const ACCOUNT_LINKS = [
  { label: "Login", href: "/account/login" },
  { label: "Orders", href: "/account/orders" },
  { label: "Wishlist", href: "/account/wishlist" },
];

const SOCIAL_LINKS = ["Instagram", "Facebook", "TikTok"];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-tarmac text-savanna">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4 md:px-8">
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-savanna/60">
            Information
          </h3>
          <ul className="flex flex-col gap-2">
            {INFO_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram rounded-sm">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-savanna/60">
            Shop
          </h3>
          <ul className="flex flex-col gap-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/shop/${category.slug}`} className="text-sm hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram rounded-sm">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-savanna/60">
            Account
          </h3>
          <ul className="flex flex-col gap-2">
            {ACCOUNT_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram rounded-sm">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-savanna/60">
            Contact &amp; Social
          </h3>
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/contact" className="text-sm hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram rounded-sm">
                Contact Us
              </Link>
            </li>
            {SOCIAL_LINKS.map((label) => (
              <li key={label}>
                <a href="#" className="text-sm hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram rounded-sm">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-steel">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-savanna/60 md:flex-row md:px-8">
          <p>&copy; {year} LePlug Autocare. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram rounded-sm">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram rounded-sm">
              Terms
            </Link>
            <Link href="/returns" className="hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram rounded-sm">
              Returns
            </Link>
          </div>
          <div className="flex gap-2">
            {["M-Pesa", "Visa", "Mastercard"].map((method) => (
              <span
                key={method}
                className="rounded border border-steel px-2 py-1 text-xs font-medium text-savanna/80"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
```

Note: social links use plain text (not icons or logos) since real handles aren't supplied yet (CLAUDE.md §16) and this lucide-react version has no brand icons. Payment "icons" are plain text badges for the same reason — swap for real logos once §16 content and legal clearance arrive.

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/layout/footer.tsx
git commit -m "feat: add Footer with four link columns and payment trust badges"
```

---

### Task 9: Category mega-panel

**Files:**
- Create: `components/layout/category-bar.tsx`

- [x] **Step 1: Inspect the generated NavigationMenu exports**

Run: `grep -n "^export" components/ui/navigation-menu.tsx`

Note the exact exported component names (e.g. `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuTrigger`, `NavigationMenuContent`, `NavigationMenuLink`) — use exactly these in Step 2, adjusting if the generated names differ.

- [x] **Step 2: Create the component**

Create `components/layout/category-bar.tsx` (adjust the `NavigationMenu*` import names per Step 1 if they differ):

```tsx
import Link from "next/link";
import { categories } from "@/lib/data/categories";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export function CategoryBar() {
  return (
    <div className="border-b border-steel bg-savanna">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            {categories.map((category) => (
              <NavigationMenuItem key={category.id}>
                <NavigationMenuTrigger className="text-sm font-medium">
                  {category.name}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-64 gap-1 p-2">
                    {category.subcategories.map((sub) => (
                      <li key={sub.id}>
                        <NavigationMenuLink asChild>
                          <Link href={`/shop/${category.slug}?subcategory=${sub.slug}`}>
                            {sub.name}
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}
```

This component is not mounted anywhere yet — Phase 4 (Shop pages) will render it above the product grid. Building it now keeps it colocated with the rest of the layout primitives per the §15 folder structure.

- [x] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`. If `viewport` isn't a valid prop on the generated `NavigationMenu` (check its type signature in `components/ui/navigation-menu.tsx` if this errors), remove that prop.

Expected: no errors.

- [x] **Step 4: Commit**

```bash
git add components/layout/category-bar.tsx
git commit -m "feat: add category mega-panel for Shop pages (not yet mounted)"
```

---

### Task 10: Wire Header and Footer into the root layout

**Files:**
- Modify: `app/layout.tsx`

- [x] **Step 1: Import and mount Header/Footer around children**

In `app/layout.tsx`, add the imports and wrap `{children}`:

```tsx
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
```

Change the `<body>` content from:

```tsx
<body className="min-h-full flex flex-col font-body">{children}</body>
```

to:

```tsx
<body className="min-h-full flex flex-col font-body">
  <Header />
  <div className="flex-1">{children}</div>
  <Footer />
</body>
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Verify it renders**

Run: `npm run dev` in background (or reuse the already-running dev server from Phase 0/1), then `curl -s http://localhost:3000 | grep -o "LE PLUG AUTOCARE\|LePlug Autocare\|LE PLUG"`.

Expected: matches from both the header logo and footer copyright text.

- [x] **Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: mount Header and Footer in the root layout"
```

---

### Task 11: Phase 2 verification gate

**Files:** none (verification only)

- [x] **Step 1: Run the full test suite**

Run: `npm test` — expect all Phase 1 tests (19) plus the new cart (7) and wishlist (5) store tests to pass: 31 total.

- [x] **Step 2: Run lint**

Run: `npm run lint` — expect no errors.

- [x] **Step 3: Run typecheck**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 4: Visual check in a real browser**

Open `http://localhost:3000` in a browser (not just curl). Confirm:
- Header is sticky and visibly compresses in height after scrolling ~24px down a page with enough content to scroll (temporarily add filler content to the placeholder home page if it's too short to scroll, then revert).
- Tab through the header with keyboard only — every interactive element (nav links, search input, account icon, cart icon, hamburger) shows a visible `murram`-colored focus ring.
- At a 375px viewport width (mobile), the header shows logo + search icon + cart icon + hamburger only (no nav links or account icon visible), and tapping the hamburger opens a full-screen panel, not a small dropdown.
- Footer shows all four columns on desktop and stacks legibly on mobile.

- [x] **Step 5: Commit any fixes found**

```bash
git add -A
git commit -m "fix: resolve issues found in Phase 2 verification gate"
```

(Skip if Steps 1-4 were already clean.)

---

## Definition of done for Phase 2

- [x] Cart and wishlist Zustand stores exist, are unit-tested, and persist to `localStorage`
- [x] Header is sticky, compresses on scroll, and collapses to logo+search+cart+hamburger on mobile with a full-screen nav sheet
- [x] Footer has all four columns plus a bottom bar with copyright, legal links, and payment trust badges
- [x] Breadcrumbs and CategoryBar components exist (unmounted until Phases 4-5 use them)
- [x] Every interactive header/footer element has a visible `murram` focus ring
- [x] `npm test`, `npm run lint`, and `npx tsc --noEmit` all pass clean
- [x] One commit per task above

## Deviations from plan (discovered during execution)

- The `jsdom` test environment takes ~10-30s to spin up on this machine (likely OneDrive file I/O overhead), causing the first `vitest run` attempt on a jsdom-pragma'd file to hit the default 60s Bash timeout as a worker-spawn timeout. Not a real failure — retrying with a longer timeout succeeded. Budget for this on any future jsdom-environment test run in this repo.
- `resize_window` did not actually resize the browser window in this session — the window stayed at its maximized size (1536×864 physical / ~1254×596-ish reported CSS viewport, with visible inconsistency between tools' reported dimensions, likely a 1.25 devicePixelRatio interacting with window snapping on Windows). Could not get a true 375px-viewport screenshot this session. Verified mobile-breakpoint correctness instead via DOM inspection (`getComputedStyle` + `matchMedia` at the real ≥768px viewport, confirming `md:hidden`/`hidden md:flex` elements toggle correctly) rather than a visual mobile screenshot.
- Real keyboard-Tab-driven focus testing via the browser automation tool was inconsistent — the same click+Tab sequence sometimes landed focus on the expected link and sometimes reported focus stuck on `<body>`. One reliable early run did catch two genuine bugs before the flakiness set in:
  - The header logo `<Link>` had no `focus-visible` ring classes at all (fell back to the browser's default outline) — fixed by adding the same `focus-visible:ring-2 focus-visible:ring-murram` pattern used elsewhere.
  - Both search `<input>` elements used `outline-none` with no replacement focus indicator — fixed by adding `focus-within:ring-2 focus-within:ring-murram` to their wrapping containers.
  - Remaining interactive elements were verified statically (grep audit of every `<Link>`/`<a>`/`<button>`/`<input>` in `components/layout/`) rather than re-attempting the flaky live Tab test for each one.
- Found and fixed a real tailwind-merge conflict bug: `MobileNav`'s `SheetContent` className tried to override the base component's `data-[side=right]:w-3/4 data-[side=right]:sm:max-w-sm` with plain `w-full sm:max-w-full` — since the variant prefix chains didn't match, tailwind-merge didn't recognize them as conflicting and kept both, and the more specific base classes won, leaving the "full-screen" mobile nav constrained to ~384px wide. Fixed by matching the exact variant chain (`data-[side=right]:w-full data-[side=right]:sm:max-w-full`). Caught via DOM inspection (`getBoundingClientRect`), not visually — worth remembering when overriding any shadcn component's data-variant-scoped classes.
