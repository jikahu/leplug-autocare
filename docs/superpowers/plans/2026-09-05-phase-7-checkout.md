# Phase 7 — Checkout Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build the `/checkout` page per CLAUDE.md §4.7 and the roadmap's Phase 7 scope: a multi-step flow (delivery details → delivery zone/fee → payment method → order review → confirmation) that completes end-to-end and writes a mock `Order`, per CLAUDE.md §13 ("no payment method actually processes money this phase — 'Place Order' writes to mock order data").

**Architecture:**

- **This worktree branches from `master` at its current tip** (`9c69037`, after Phase 6 merged) — `/cart`, the cart drawer, `useCartStore`, `useCartHasHydrated`, `getCartLines`/`getCartSubtotal`, and `deliveryFee`/`freeDeliveryRemaining` all already exist and are reused directly below.
- **Four numbered wizard steps, not five.** CLAUDE.md's phrasing ("delivery details → delivery zone/fee → payment method selection → order review → confirmation") describes five *stages* of the flow, but "confirmation" is the terminal success state you land on after a successful "Place Order" action — not a step you navigate into with Back/Next like the other four. The numbered stepper (`CheckoutSteps`, styled with the `font-stencil` treatment CLAUDE.md §3 explicitly reserves for "checkout step indicators") shows exactly the four steps a user moves between: **1. Delivery details, 2. Delivery zone, 3. Payment, 4. Review.** Placing the order swaps the whole flow out for a distinct confirmation view, the same way Phase 6's `CartPageContent` swaps to `EmptyCart` rather than treating "empty" as a fifth cart state.
- **No new route.** CLAUDE.md §15 lists exactly one file, `app/checkout/page.tsx` — the whole wizard lives at that one URL, with step transitions handled by client-side component state (`useState<number>`), not routing. `page.tsx` stays a server component (for `Metadata`) and delegates everything interactive to a `"use client"` `CheckoutFlow` orchestrator, mirroring the exact split `/cart` and `/account/wishlist` already established in Phase 6.
- **No login, no saved-address book.** Phase 8 ("Accounts") hasn't been built yet — there's no mock user session and no `lib/data/users.ts`. This phase treats checkout as guest checkout: delivery details are collected fresh in a form every time (not pulled from a `User.addresses` list), and the new `Order` this phase writes uses a fixed placeholder `userId: "guest"`. Phase 8 can swap this for a real logged-in user's id once mock auth exists — that's a one-line change in `CheckoutFlow`, not a structural one.
- **A new, persisted `useOrderStore` (`lib/store/orders.ts`) is the actual "mock order data" CLAUDE.md §13 refers to.** It mirrors `useCartStore`/`useWishlistStore` exactly: `persist` + `skipHydration: true`, rehydrated by the existing `StoreHydration` component (modified to add one more `.rehydrate()` call — the same pattern already used for the other two stores). "Place Order" pushes a real `Order` built from the actual cart contents into this store, then clears the cart. This gives Phase 8's future "order history" page real data to read instead of disconnected static mock orders — a more coherent design than writing to a store nothing populates. Unlike Phase 6's `useCartHasHydrated`/`useWishlistHasHydrated`, this phase does **not** add a `useOrderHasHydrated` hook: nothing built in *this* phase reads `useOrderStore`'s persisted data back on mount (the confirmation screen shows the order it just created, from fresh in-memory state, not a re-read of the store) — adding that hook now, for a future phase's benefit, would be speculative. Phase 8 should add it then, following the exact precedent already documented in Phase 6's own deviations log.
- **Radio selections use plain `<input type="radio">`, not a new shadcn component.** Delivery zone (2 options) and payment method (3 options) are both native, fully keyboard-and-screen-reader-accessible via the browser's built-in radio-group behavior — the same reasoning Phase 5 used for `StarRatingInput` ("don't need Radix/Base UI wrapping; native elements... are already accessible"). No `npx shadcn add radio-group` needed this phase.
- **The "Card" payment option collects no card fields at all** — just a one-line note that card details would be collected here in a real checkout. This phase never renders anything that could be mistaken for a real card-number/expiry/CVV input, even as an inert mock. "M-Pesa" does collect a phone number (an authentic, low-sensitivity detail of the real Kenyan M-Pesa STK-push flow, not a payment credential) so its selection card includes one text input.
- **Delivery zone and payment method labels/descriptions live in one shared file** (`components/checkout/types.ts`, alongside the two checkout-only types `DeliveryDetails` and `PaymentMethod`) so the selection step and the review step both derive their display labels from the same array instead of maintaining two separate copies of "Nairobi Metro" / "M-Pesa" / etc. that could drift.
- **Refreshing `/checkout` after a successful "Place Order" shows the empty-cart state, not the confirmation again.** `placedOrder` (which controls showing the confirmation) is local component state, not persisted; the cart is genuinely empty by then (cleared on success), so a reload correctly falls through to the empty-cart branch. The order itself is not lost — it's safely in `useOrderStore` — this is a deliberate, documented scope boundary (a "confirmation survives a hard refresh" flow would need a URL-addressable order, e.g. `/checkout/[orderId]`, which CLAUDE.md's folder structure doesn't call for this phase) not an oversight.
- **Form validation follows the exact inline, field-level pattern already established by `ProductReviews`** (Phase 5) — a `FormErrors` object built in the submit handler, `aria-invalid`/`aria-describedby` wiring, a `role="alert"` summary banner, per-field error text cleared as the user retypes. No new validation utility is extracted to `lib/utils/` — CLAUDE.md's codebase convention (confirmed by inspecting `product-reviews.tsx`) keeps this kind of presence-check validation inline in the component, reserving `lib/utils/` for genuinely reusable data computations.
- **`generateOrderId()` avoids `Date.now()`-only uniqueness** (which could produce identical ids for two calls in the same millisecond on a fast machine) by also mixing in `Math.random()` — cheap, and lets its test assert format/length without any timing-dependent flakiness.

**Tech Stack:** Existing stack, no new dependencies. Next.js 16.3.4 App Router, reusing `lib/store/cart.ts` (`useCartStore`, `useCartHasHydrated`), `lib/utils/cart-lines.ts` (`getCartLines`, `getCartSubtotal`, `CartLine`), `lib/utils/delivery-fee.ts` (`deliveryFee`), `lib/utils/format-currency.ts` (`formatCurrency`), `lib/types` (`Address`, `Order`), `components/ui/button.tsx` (`Button`), `components/cart/empty-cart.tsx` (`EmptyCart`), `lib/utils` (`cn`). Vitest for the two new pure/store units, following the codebase's co-located `foo.ts` + `foo.test.ts` convention. Baseline confirmed clean on this worktree before starting: `npm test` → 80 passed (14 files), `npm run lint` → clean, `npx tsc --noEmit` → clean (after one `next build` to generate `.next/types`), `npm run build` → succeeds (pre-existing "Big Shoulders Stencil font override" warning only, not a regression).

---

### Task 1: `generateOrderId` utility (TDD)

**Files:**
- Create: `lib/utils/generate-order-id.ts`
- Create: `lib/utils/generate-order-id.test.ts`

- [x] **Step 1: Write the failing test**

Create `lib/utils/generate-order-id.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { generateOrderId } from "./generate-order-id";

describe("generateOrderId", () => {
  it("starts with ORD- followed by uppercase alphanumeric characters", () => {
    expect(generateOrderId()).toMatch(/^ORD-[0-9A-Z]+$/);
  });

  it("is at least 8 characters after the prefix", () => {
    const id = generateOrderId();
    expect(id.replace("ORD-", "").length).toBeGreaterThanOrEqual(8);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm test -- generate-order-id`
Expected: FAIL — cannot find module `./generate-order-id`.

- [x] **Step 3: Write minimal implementation**

Create `lib/utils/generate-order-id.ts`:

```ts
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${timestamp}${random}`;
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npm test -- generate-order-id`
Expected: PASS, 2 tests.

- [x] **Step 5: Commit**

```bash
git add lib/utils/generate-order-id.ts lib/utils/generate-order-id.test.ts
git commit -m "feat: add generateOrderId utility"
```

---

### Task 2: `useOrderStore` and `StoreHydration` wiring (TDD)

**Files:**
- Create: `lib/store/orders.ts`
- Create: `lib/store/orders.test.ts`
- Modify: `components/layout/store-hydration.tsx`

- [x] **Step 1: Write the failing test**

Create `lib/store/orders.test.ts`:

```ts
// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { useOrderStore } from "./orders";
import type { Order } from "@/lib/types";

function sampleOrder(overrides: Partial<Order>): Order {
  return {
    id: "ORD-SAMPLE",
    userId: "guest",
    items: [{ productId: "p1", quantity: 1 }],
    total: 1000,
    deliveryFee: 300,
    status: "processing",
    placedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("useOrderStore", () => {
  beforeEach(() => {
    useOrderStore.setState({ orders: [] });
    localStorage.clear();
  });

  it("starts with no orders", () => {
    expect(useOrderStore.getState().orders).toEqual([]);
  });

  it("adds a placed order", () => {
    const order = sampleOrder({ id: "ORD-1" });
    useOrderStore.getState().placeOrder(order);
    expect(useOrderStore.getState().orders).toEqual([order]);
  });

  it("keeps newest orders first", () => {
    useOrderStore.getState().placeOrder(sampleOrder({ id: "ORD-1" }));
    useOrderStore.getState().placeOrder(sampleOrder({ id: "ORD-2" }));
    expect(useOrderStore.getState().orders.map((o) => o.id)).toEqual(["ORD-2", "ORD-1"]);
  });

  it("persists orders to localStorage under the leplug-orders key", () => {
    const order = sampleOrder({ id: "ORD-1" });
    useOrderStore.getState().placeOrder(order);
    const raw = localStorage.getItem("leplug-orders");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).state.orders).toEqual([order]);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm test -- orders`
Expected: FAIL — cannot find module `./orders`.

- [x] **Step 3: Write minimal implementation**

Create `lib/store/orders.ts`:

```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Order } from "@/lib/types";

type OrderState = {
  orders: Order[];
  placeOrder: (order: Order) => void;
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      placeOrder: (order) =>
        set((state) => ({ orders: [order, ...state.orders] })),
    }),
    {
      name: "leplug-orders",
      storage: createJSONStorage(() => localStorage),
      // Rehydration is triggered manually (see components/layout/store-hydration.tsx)
      // after the client mounts, so the first client render matches the
      // server-rendered HTML (no orders) instead of causing a hydration
      // mismatch when localStorage already has saved orders.
      skipHydration: true,
    }
  )
);
```

- [x] **Step 4: Run test to verify it passes**

Run: `npm test -- orders`
Expected: PASS, 4 tests.

- [x] **Step 5: Wire it into `StoreHydration`**

Modify `components/layout/store-hydration.tsx` — replace its full contents:

```tsx
"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useOrderStore } from "@/lib/store/orders";

/**
 * Rehydrates the persisted cart, wishlist, and order stores from localStorage
 * after the client has mounted. All three stores use `skipHydration: true` so
 * their first client render matches the server-rendered (empty) HTML; this
 * effect then loads the real saved state, and every component subscribed to
 * the stores (header cart badge, wishlist hearts, etc.) re-renders automatically.
 * Renders nothing — mount once, high in the tree (see app/layout.tsx).
 */
export function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
    useOrderStore.persist.rehydrate();
  }, []);

  return null;
}
```

- [x] **Step 6: Verify it compiles and the full suite still passes**

Run: `npx tsc --noEmit` — expect no errors.
Run: `npm test` — expect all tests passing (84+, no regressions).

- [x] **Step 7: Commit**

```bash
git add lib/store/orders.ts lib/store/orders.test.ts components/layout/store-hydration.tsx
git commit -m "feat: add order store, wire into StoreHydration"
```

---

### Task 3: Checkout shared types and option lists

**Files:**
- Create: `components/checkout/types.ts`

- [x] **Step 1: Create the file**

Create `components/checkout/types.ts`:

```ts
import type { Address } from "@/lib/types";

export type DeliveryDetails = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
};

export type PaymentMethod = "mpesa" | "card" | "cod";

export const DELIVERY_ZONE_OPTIONS: {
  value: Address["zone"];
  label: string;
  description: string;
}[] = [
  {
    value: "nairobi_metro",
    label: "Nairobi Metro",
    description: "Delivery within Nairobi and immediate environs.",
  },
  {
    value: "outside_nairobi",
    label: "Outside Nairobi",
    description: "Delivery to the rest of Kenya.",
  },
];

export const PAYMENT_METHOD_OPTIONS: {
  value: PaymentMethod;
  label: string;
  description: string;
}[] = [
  { value: "mpesa", label: "M-Pesa", description: "Pay via M-Pesa STK push to your phone." },
  { value: "card", label: "Card", description: "Pay with Visa or Mastercard." },
  { value: "cod", label: "Cash on Delivery", description: "Pay in cash when your order arrives." },
];
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/checkout/types.ts
git commit -m "feat: add checkout shared types and option lists"
```

---

### Task 4: `CheckoutSteps` component

**Files:**
- Create: `components/checkout/checkout-steps.tsx`

- [x] **Step 1: Create the component**

Create `components/checkout/checkout-steps.tsx`:

```tsx
import { cn } from "@/lib/utils";

const STEPS = ["Delivery", "Zone", "Payment", "Review"] as const;

export function CheckoutSteps({ currentStep }: { currentStep: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4">
      {STEPS.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isComplete = stepNumber < currentStep;

        return (
          <li
            key={label}
            aria-current={isActive ? "step" : undefined}
            className="flex items-center gap-2"
          >
            <span
              aria-hidden="true"
              className={cn(
                "font-stencil flex size-8 shrink-0 items-center justify-center rounded-full border text-sm",
                isActive
                  ? "border-murram bg-murram text-savanna"
                  : isComplete
                    ? "border-acacia bg-acacia text-savanna"
                    : "border-steel/40 text-tarmac/50"
              )}
            >
              {stepNumber}
            </span>
            <span
              className={cn(
                "hidden text-sm sm:inline",
                isActive ? "font-medium text-tarmac" : "text-tarmac/50"
              )}
            >
              {label}
            </span>
            {stepNumber < STEPS.length && (
              <span aria-hidden="true" className="mx-1 h-px w-4 bg-steel/40 sm:w-8" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/checkout/checkout-steps.tsx
git commit -m "feat: add CheckoutSteps component"
```

---

### Task 5: `CheckoutAddressStep` component

**Files:**
- Create: `components/checkout/checkout-address-step.tsx`

- [x] **Step 1: Create the component**

Create `components/checkout/checkout-address-step.tsx`:

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import type { DeliveryDetails } from "@/components/checkout/types";

type FormErrors = Partial<Record<keyof DeliveryDetails, string>>;

export function CheckoutAddressStep({
  details,
  onChange,
  onNext,
}: {
  details: DeliveryDetails;
  onChange: (details: DeliveryDetails) => void;
  onNext: () => void;
}) {
  const [errors, setErrors] = useState<FormErrors>({});

  function clearFieldError(field: keyof DeliveryDetails) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function updateField(field: keyof DeliveryDetails, value: string) {
    onChange({ ...details, [field]: value });
    clearFieldError(field);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (!details.fullName.trim()) nextErrors.fullName = "Enter your full name.";
    if (!details.phone.trim()) nextErrors.phone = "Enter a phone number we can reach you on.";
    if (!details.line1.trim()) nextErrors.line1 = "Enter your delivery address.";
    if (!details.city.trim()) nextErrors.city = "Enter your city or town.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <h2 className="font-heading text-xl font-bold text-tarmac">Delivery Details</h2>
      {Object.keys(errors).length > 0 && (
        <p role="alert" className="text-sm font-medium text-murram">
          Fix the errors below before continuing.
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="checkout-name" className="text-sm font-medium text-tarmac">
          Full name
        </label>
        <input
          id="checkout-name"
          type="text"
          value={details.fullName}
          onChange={(e) => updateField("fullName", e.target.value)}
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? "checkout-name-error" : undefined}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
        {errors.fullName && (
          <p id="checkout-name-error" className="text-xs text-murram">
            {errors.fullName}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="checkout-phone" className="text-sm font-medium text-tarmac">
          Phone number
        </label>
        <input
          id="checkout-phone"
          type="tel"
          value={details.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "checkout-phone-error" : undefined}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
        {errors.phone && (
          <p id="checkout-phone-error" className="text-xs text-murram">
            {errors.phone}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="checkout-line1" className="text-sm font-medium text-tarmac">
          Address
        </label>
        <input
          id="checkout-line1"
          type="text"
          value={details.line1}
          onChange={(e) => updateField("line1", e.target.value)}
          placeholder="Street, building, apartment"
          aria-invalid={Boolean(errors.line1)}
          aria-describedby={errors.line1 ? "checkout-line1-error" : undefined}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
        {errors.line1 && (
          <p id="checkout-line1-error" className="text-xs text-murram">
            {errors.line1}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="checkout-line2" className="text-sm font-medium text-tarmac">
          Apartment, suite, etc. <span className="text-tarmac/50">(optional)</span>
        </label>
        <input
          id="checkout-line2"
          type="text"
          value={details.line2}
          onChange={(e) => updateField("line2", e.target.value)}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="checkout-city" className="text-sm font-medium text-tarmac">
          City / Town
        </label>
        <input
          id="checkout-city"
          type="text"
          value={details.city}
          onChange={(e) => updateField("city", e.target.value)}
          aria-invalid={Boolean(errors.city)}
          aria-describedby={errors.city ? "checkout-city-error" : undefined}
          className="w-full rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        />
        {errors.city && (
          <p id="checkout-city-error" className="text-xs text-murram">
            {errors.city}
          </p>
        )}
      </div>

      <Button type="submit">Continue to Delivery</Button>
    </form>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/checkout/checkout-address-step.tsx
git commit -m "feat: add CheckoutAddressStep component"
```

---

### Task 6: `CheckoutDeliveryStep` component

**Files:**
- Create: `components/checkout/checkout-delivery-step.tsx`

- [x] **Step 1: Create the component**

Create `components/checkout/checkout-delivery-step.tsx`:

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format-currency";
import { deliveryFee } from "@/lib/utils/delivery-fee";
import { DELIVERY_ZONE_OPTIONS } from "@/components/checkout/types";
import type { Address } from "@/lib/types";

export function CheckoutDeliveryStep({
  zone,
  onChange,
  subtotal,
  onNext,
  onBack,
}: {
  zone: Address["zone"] | null;
  onChange: (zone: Address["zone"]) => void;
  subtotal: number;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="max-w-lg space-y-4">
      <h2 className="font-heading text-xl font-bold text-tarmac">Delivery Zone</h2>

      <fieldset className="space-y-3">
        <legend className="sr-only">Choose a delivery zone</legend>
        {DELIVERY_ZONE_OPTIONS.map((option) => {
          const fee = deliveryFee(option.value, subtotal);
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-4",
                zone === option.value ? "border-murram bg-murram/5" : "border-steel/40"
              )}
            >
              <span className="flex items-start gap-3">
                <input
                  type="radio"
                  name="delivery-zone"
                  value={option.value}
                  checked={zone === option.value}
                  onChange={() => onChange(option.value)}
                  className="mt-1 accent-murram"
                />
                <span>
                  <span className="block font-medium text-tarmac">{option.label}</span>
                  <span className="block text-sm text-tarmac/70">{option.description}</span>
                </span>
              </span>
              <span className="shrink-0 font-semibold text-tarmac">
                {fee === 0 ? "Free" : formatCurrency(fee)}
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext} disabled={!zone}>
          Continue to Payment
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
git add components/checkout/checkout-delivery-step.tsx
git commit -m "feat: add CheckoutDeliveryStep component"
```

---

### Task 7: `CheckoutPaymentStep` component

**Files:**
- Create: `components/checkout/checkout-payment-step.tsx`

- [x] **Step 1: Create the component**

Create `components/checkout/checkout-payment-step.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PAYMENT_METHOD_OPTIONS, type PaymentMethod } from "@/components/checkout/types";

export function CheckoutPaymentStep({
  method,
  onChangeMethod,
  mpesaPhone,
  onChangeMpesaPhone,
  onNext,
  onBack,
}: {
  method: PaymentMethod | null;
  onChangeMethod: (method: PaymentMethod) => void;
  mpesaPhone: string;
  onChangeMpesaPhone: (phone: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  function handleNext() {
    if (!method) {
      setError("Choose a payment method to continue.");
      return;
    }
    if (method === "mpesa" && !mpesaPhone.trim()) {
      setError("Enter the M-Pesa phone number to send the payment request to.");
      return;
    }
    setError(null);
    onNext();
  }

  return (
    <div className="max-w-lg space-y-4">
      <h2 className="font-heading text-xl font-bold text-tarmac">Payment Method</h2>
      {error && (
        <p role="alert" className="text-sm font-medium text-murram">
          {error}
        </p>
      )}

      <fieldset className="space-y-3">
        <legend className="sr-only">Choose a payment method</legend>
        {PAYMENT_METHOD_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-4",
              method === option.value ? "border-murram bg-murram/5" : "border-steel/40"
            )}
          >
            <input
              type="radio"
              name="payment-method"
              value={option.value}
              checked={method === option.value}
              onChange={() => {
                onChangeMethod(option.value);
                setError(null);
              }}
              className="mt-1 accent-murram"
            />
            <span>
              <span className="block font-medium text-tarmac">{option.label}</span>
              <span className="block text-sm text-tarmac/70">{option.description}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {method === "mpesa" && (
        <div className="space-y-1">
          <label htmlFor="mpesa-phone" className="text-sm font-medium text-tarmac">
            M-Pesa phone number
          </label>
          <input
            id="mpesa-phone"
            type="tel"
            value={mpesaPhone}
            onChange={(e) => onChangeMpesaPhone(e.target.value)}
            placeholder="07XX XXX XXX"
            className="w-full max-w-xs rounded-md border border-steel/40 bg-savanna px-3 py-2 text-sm text-tarmac focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
          />
        </div>
      )}

      {method === "card" && (
        <p className="text-sm text-tarmac/70">
          Card details would be collected securely here in a real checkout. No payment is
          processed in this demo.
        </p>
      )}

      {method === "cod" && (
        <p className="text-sm text-tarmac/70">
          Have the exact amount ready for the courier on delivery.
        </p>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={handleNext}>
          Review Order
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
git add components/checkout/checkout-payment-step.tsx
git commit -m "feat: add CheckoutPaymentStep component"
```

---

### Task 8: `CheckoutReviewStep` component

**Files:**
- Create: `components/checkout/checkout-review-step.tsx`

- [x] **Step 1: Create the component**

Create `components/checkout/checkout-review-step.tsx`:

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format-currency";
import type { CartLine } from "@/lib/utils/cart-lines";
import {
  DELIVERY_ZONE_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  type DeliveryDetails,
  type PaymentMethod,
} from "@/components/checkout/types";
import type { Address } from "@/lib/types";

export function CheckoutReviewStep({
  details,
  zone,
  method,
  lines,
  subtotal,
  fee,
  total,
  onBack,
  onPlaceOrder,
}: {
  details: DeliveryDetails;
  zone: Address["zone"];
  method: PaymentMethod;
  lines: CartLine[];
  subtotal: number;
  fee: number;
  total: number;
  onBack: () => void;
  onPlaceOrder: () => void;
}) {
  const zoneLabel = DELIVERY_ZONE_OPTIONS.find((option) => option.value === zone)?.label ?? zone;
  const methodLabel =
    PAYMENT_METHOD_OPTIONS.find((option) => option.value === method)?.label ?? method;

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="font-heading text-xl font-bold text-tarmac">Review Order</h2>

      <div className="space-y-1 rounded-lg border border-steel/40 p-4 text-sm">
        <p className="font-medium text-tarmac">Deliver to</p>
        <p className="text-tarmac/70">
          {details.fullName} &middot; {details.phone}
        </p>
        <p className="text-tarmac/70">
          {details.line1}
          {details.line2 ? `, ${details.line2}` : ""}, {details.city}
        </p>
        <p className="text-tarmac/70">{zoneLabel}</p>
      </div>

      <div className="rounded-lg border border-steel/40 p-4 text-sm">
        <p className="font-medium text-tarmac">Payment</p>
        <p className="text-tarmac/70">{methodLabel}</p>
      </div>

      <div className="divide-y divide-steel/20 rounded-lg border border-steel/40 px-4">
        {lines.map((line) => (
          <div key={line.productId} className="flex items-center justify-between py-3 text-sm">
            <span className="text-tarmac">
              {line.product.name} &times; {line.quantity}
            </span>
            <span className="font-medium text-tarmac">{formatCurrency(line.lineTotal)}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2 rounded-lg border border-steel/40 bg-savanna p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-tarmac/70">Subtotal</span>
          <span className="text-tarmac">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-tarmac/70">Delivery</span>
          <span className="text-tarmac">{fee === 0 ? "Free" : formatCurrency(fee)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-steel/40 pt-2 text-base">
          <span className="font-semibold text-tarmac">Total</span>
          <span className="font-heading font-bold text-murram">{formatCurrency(total)}</span>
        </div>
      </div>

      <p className="text-xs text-tarmac/60">
        Prices shown are final. This is a demo checkout — no payment is actually processed and no
        order is really shipped.
      </p>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onPlaceOrder}>
          Place Order
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
git add components/checkout/checkout-review-step.tsx
git commit -m "feat: add CheckoutReviewStep component"
```

---

### Task 9: `CheckoutConfirmation` component

**Files:**
- Create: `components/checkout/checkout-confirmation.tsx`

- [x] **Step 1: Create the component**

Create `components/checkout/checkout-confirmation.tsx`:

```tsx
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format-currency";
import type { Order } from "@/lib/types";

export function CheckoutConfirmation({ order }: { order: Order }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-steel/40 bg-savanna px-6 py-12 text-center">
      <CheckCircle2 className="size-12 text-acacia" aria-hidden="true" />
      <h2 className="font-heading text-2xl font-bold text-tarmac">Order placed</h2>
      <p className="text-sm text-tarmac/70">
        Thanks — your order <span className="font-stencil text-tarmac">{order.id}</span> has been
        received.
      </p>
      <p className="text-lg font-semibold text-murram">{formatCurrency(order.total)}</p>
      <p className="max-w-md text-xs text-tarmac/60">
        This is a demo order — no payment was processed and nothing will actually ship.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button render={<Link href="/shop" />} nativeButton={false}>
          Continue Shopping
        </Button>
        <Button render={<Link href="/account/orders" />} nativeButton={false} variant="outline">
          View My Orders
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
git add components/checkout/checkout-confirmation.tsx
git commit -m "feat: add CheckoutConfirmation component"
```

---

### Task 10: `CheckoutFlow` orchestrator

**Files:**
- Create: `components/checkout/checkout-flow.tsx`

- [x] **Step 1: Create the component**

Create `components/checkout/checkout-flow.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useCartStore, useCartHasHydrated } from "@/lib/store/cart";
import { useOrderStore } from "@/lib/store/orders";
import { products } from "@/lib/data/products";
import { getCartLines, getCartSubtotal } from "@/lib/utils/cart-lines";
import { deliveryFee } from "@/lib/utils/delivery-fee";
import { generateOrderId } from "@/lib/utils/generate-order-id";
import { EmptyCart } from "@/components/cart/empty-cart";
import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { CheckoutAddressStep } from "@/components/checkout/checkout-address-step";
import { CheckoutDeliveryStep } from "@/components/checkout/checkout-delivery-step";
import { CheckoutPaymentStep } from "@/components/checkout/checkout-payment-step";
import { CheckoutReviewStep } from "@/components/checkout/checkout-review-step";
import { CheckoutConfirmation } from "@/components/checkout/checkout-confirmation";
import type { DeliveryDetails, PaymentMethod } from "@/components/checkout/types";
import type { Address, Order } from "@/lib/types";

export function CheckoutFlow() {
  const hasHydrated = useCartHasHydrated();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);
  const placeOrder = useOrderStore((state) => state.placeOrder);

  const [step, setStep] = useState(1);
  const [details, setDetails] = useState<DeliveryDetails>({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
  });
  const [zone, setZone] = useState<Address["zone"] | null>(null);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  if (!hasHydrated) {
    return null;
  }

  if (placedOrder) {
    return <CheckoutConfirmation order={placedOrder} />;
  }

  const lines = getCartLines(items, products);

  if (lines.length === 0) {
    return <EmptyCart />;
  }

  const subtotal = getCartSubtotal(lines);
  const fee = zone ? deliveryFee(zone, subtotal) : 0;
  const total = subtotal + fee;

  function handlePlaceOrder() {
    if (!zone || !method) return;
    const order: Order = {
      id: generateOrderId(),
      userId: "guest",
      items,
      total,
      deliveryFee: fee,
      status: "processing",
      placedAt: new Date().toISOString(),
    };
    placeOrder(order);
    clearCart();
    setPlacedOrder(order);
  }

  return (
    <div className="space-y-8">
      <CheckoutSteps currentStep={step} />

      {step === 1 && (
        <CheckoutAddressStep details={details} onChange={setDetails} onNext={() => setStep(2)} />
      )}
      {step === 2 && (
        <CheckoutDeliveryStep
          zone={zone}
          onChange={setZone}
          subtotal={subtotal}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <CheckoutPaymentStep
          method={method}
          onChangeMethod={setMethod}
          mpesaPhone={mpesaPhone}
          onChangeMpesaPhone={setMpesaPhone}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && zone && method && (
        <CheckoutReviewStep
          details={details}
          zone={zone}
          method={method}
          lines={lines}
          subtotal={subtotal}
          fee={fee}
          total={total}
          onBack={() => setStep(3)}
          onPlaceOrder={handlePlaceOrder}
        />
      )}
    </div>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add components/checkout/checkout-flow.tsx
git commit -m "feat: add CheckoutFlow orchestrator"
```

---

### Task 11: `/checkout` page

**Files:**
- Create: `app/checkout/page.tsx`

- [x] **Step 1: Create the page**

Create `app/checkout/page.tsx`:

```tsx
import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";

export const metadata: Metadata = {
  title: "Checkout — LePlug Autocare",
  description: "Complete your order — delivery details, payment, and confirmation.",
};

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <h1 className="font-heading text-3xl font-black text-tarmac">Checkout</h1>
      <div className="mt-6">
        <CheckoutFlow />
      </div>
    </main>
  );
}
```

- [x] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit` — expect no errors.

- [x] **Step 3: Commit**

```bash
git add app/checkout/page.tsx
git commit -m "feat: add /checkout page"
```

---

### Task 12: Phase 7 verification gate

**Files:** None (verification only — fix-forward if issues are found, in the same files touched above).

- [x] **Step 1: Run the full automated suite**

Run in order:
```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```
Expected: all four clean (build may repeat the pre-existing "Big Shoulders Stencil font override" warning — not a regression, ignore it). Confirm `/checkout` appears in the build's route table (it will be dynamic, `ƒ`, or static, `○` — either is fine; there's no `searchParams`/`params` dependency, so check which Next.js actually chooses and don't be surprised either way).

- [x] **Step 2: Start the dev server and add items to the cart**

```bash
npm run dev
```
In a browser, add 1–2 products to the cart from `/shop`, then navigate to `/checkout` (via the cart drawer's or `/cart`'s "Proceed to Checkout" link, which have pointed here since Phase 6 and previously 404'd).

- [x] **Step 3: Walk the full happy path**

- **Step 1 (Delivery):** try clicking "Continue" with empty fields — expect inline field errors and the `role="alert"` summary, matching `ProductReviews`' pattern. Fill in name, phone, address, city (leave apartment/suite blank) and continue.
- **Step 2 (Zone):** confirm "Continue to Payment" is disabled until a zone is picked; pick each zone in turn and confirm the fee shown matches `deliveryFee` (KSh 300 Nairobi Metro / KSh 600 Outside Nairobi under the free-delivery threshold, "Free" above it) — verify this against your actual cart subtotal.
- **Step 3 (Payment):** confirm "Review Order" is blocked with an error until a method is chosen; pick M-Pesa and confirm it also requires the phone number field before proceeding; confirm Card shows only the informational note (no fake card fields); confirm COD shows its note.
- **Step 4 (Review):** confirm the address, zone, payment method, line items, subtotal, delivery fee, and total all match what was entered/selected in the prior steps exactly.
- Click "Place Order". Expected: the flow is replaced by the confirmation screen showing a generated order id (format `ORD-XXXXXXXX`) and the correct total; the header's cart badge drops to 0; the cart drawer/`/cart` page now shows empty.
- Click "Back" at each step along the way (before placing the order) and confirm previously-entered data is still there (state isn't lost navigating between steps).

- [x] **Step 4: Verify the empty-cart guard**

With an empty cart, navigate directly to `/checkout`. Expected: `EmptyCart` renders (same component/copy as `/cart`'s empty state) — heading, message, "Browse Shop" button to `/shop`. No stepper, no broken step defaulting to step 1 with nothing to check out.

- [x] **Step 5: Verify the order was actually recorded**

After placing an order, open the browser console and run:
```js
JSON.parse(localStorage.getItem("leplug-orders")).state.orders
```
Expected: an array containing the just-placed order with the correct `items`, `total`, `deliveryFee`, `status: "processing"`, and a recent `placedAt` timestamp.

- [x] **Step 6: Keyboard and focus check**

Using Tab/Shift+Tab and Enter/Space only (no mouse), walk through all four steps: confirm every input, radio, and button has a visible `murram` focus ring; confirm the delivery-zone and payment-method radios can be selected with arrow keys within their group (native browser behavior); confirm the whole flow — including submitting the address form with Enter — is completable without a mouse.

- [x] **Step 7: Record deviations and mark the plan complete**

If Steps 1–6 surfaced any real deviation from this plan (a bug fixed, a judgment call made that isn't already captured in the Architecture section above), append a `## Deviations from plan (discovered during execution)` section at the end of this file, following the same style as the Phase 6 plan's equivalent section. If nothing deviated, still append that section stating so explicitly. Then check off every remaining box in this plan.

- [x] **Step 8: Stop the dev server and commit any fix-forward changes**

If Steps 1–6 required code fixes, commit them now with an appropriate `fix:` message. Then:

```bash
git add docs/superpowers/plans/2026-09-05-phase-7-checkout.md
git commit -m "docs: mark Phase 7 plan complete, record deviations from plan"
```

---

## Definition of done for Phase 7

- [x] `/checkout` completable end-to-end with mock data: delivery details → delivery zone/fee → payment method → order review → confirmation
- [x] Field-level inline validation on the delivery-details form; zone/payment steps block advancing until a valid selection is made
- [x] Delivery fee shown matches the existing `deliveryFee` util exactly (zone-based, free above the threshold)
- [x] "Place Order" writes a real `Order` to the new persisted `useOrderStore` and clears the cart
- [x] Empty-cart guard on `/checkout` (reuses `EmptyCart`)
- [x] `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build` all clean
- [x] Keyboard focus visible throughout; entire flow completable without a mouse

---

## Deviations from plan (discovered during execution)

**Execution mode changed mid-phase.** The plan was written for `superpowers:subagent-driven-development` (fresh implementer + two reviewer subagents per task), and Task 1 started that way. Partway through Task 1, the Claude Code auto-mode classifier began denying every reviewer-subagent dispatch (implementer dispatches still worked). The user chose a hybrid — keep dispatching implementer subagents, do the spec-compliance and code-quality review inline instead — but the very next dispatch (Task 2's implementer) was also denied. From Task 2 onward, every task (implementation, verification, and review) was done directly in this session instead of via subagents: each file was still written to match the plan's exact specified code, verified with `npx tsc --noEmit` and `npm run lint`/`npm test` after every single file, and committed one task at a time — the same granularity the subagent workflow would have produced, just without a separate subagent process per step. This is a tooling/environment circumstance, not a plan or scope change; every task's actual deliverable matches this document exactly.

**Real bug found in manual verification, fixed (Task 12): missing focus management on step transitions.** Each of the four wizard steps in `CheckoutFlow` is a fully separate React subtree — when `step` changes, the previous step's DOM (including whatever button the user just clicked, e.g. "Continue to Delivery") is unmounted and replaced. Confirmed via direct keyboard testing that this drops browser focus back to `<body>` on every transition, with nothing to tell a keyboard or screen-reader user that a new step appeared or where to find it. Fixed in `components/checkout/checkout-flow.tsx` by wrapping the active step's content (and, separately, the confirmation view) in a `tabIndex={-1}` container with a ref, and moving focus to it in a `useEffect` keyed on `step` (and on `placedOrder` for the confirmation) — the same "focus the new view's container after a route-like transition" pattern used by most accessible SPA routers. Verified by hand afterward: submitting the address form with Enter now lands focus on the Delivery Zone step's container (confirmed via `document.activeElement`), from which a single Tab reaches the first radio option.

**Manual verification covered the full happy path plus the documented edge cases**, all confirmed working exactly as designed:
- Empty-cart guard on a fresh visit to `/checkout` (renders `EmptyCart`, no stepper).
- Field-level validation on the address step (empty-submission shows the `role="alert"` banner plus all four per-field messages; correcting a field clears its own error).
- Delivery-zone step: "Continue" genuinely disabled with no zone picked; fee shown for each zone matched `deliveryFee(zone, subtotal)` exactly for a below-threshold cart (KSh 300 / KSh 600, not "Free").
- Payment step: "Review Order" blocked with an error both for no method selected and for M-Pesa selected with an empty phone field; Card/COD show only their informational text, no fake payment-detail inputs.
- Review step showed the address, zone, payment method, line item, subtotal, delivery fee, and total exactly matching what was entered/selected in the prior three steps.
- "Place Order" produced a real `ORD-XXXXXXXX`-format id, the correct total, cleared the header's cart badge to 0, and wrote a matching entry (`items`, `total`, `deliveryFee`, `status: "processing"`, a real `placedAt`) into `localStorage`'s `leplug-orders` key — confirmed by reading it directly, not just trusting the UI.
- Reloading `/checkout` after a completed order shows `EmptyCart`, not the confirmation again — exactly the documented, deliberate behavior (the order itself remained intact in `useOrderStore` throughout).
- Full keyboard operability end-to-end: tabbed through every address field, submitted with Enter, tabbed into the delivery-zone radio group, selected an option with Space (native browser radio behavior — no custom keyboard handling needed), and confirmed "Continue" enabled immediately.

No other deviations. `npm test` (86 passed), `npm run lint`, `npx tsc --noEmit`, and `npm run build` are all clean at the final commit, and the build's route table lists `/checkout` as a prerendered static route (`○`) alongside `/cart` and `/account/wishlist`, with no repeat of the SSR-safety issue Phase 6 had to fix — this phase's `hasHydrated` guard reused the existing `useCartHasHydrated` hook rather than reimplementing hydration-checking logic.
