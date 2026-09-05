"use client";

import { useCartStore, useCartHasHydrated } from "@/lib/store/cart";
import { getCartLines, getCartSubtotal } from "@/lib/utils/cart-lines";
import { products } from "@/lib/data/products";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { EmptyCart } from "@/components/cart/empty-cart";

export function CartPageContent() {
  const hasHydrated = useCartHasHydrated();
  const items = useCartStore((state) => state.items);

  // Wait for the persisted cart to load from localStorage before deciding
  // whether to show the empty state — otherwise a returning visitor with
  // items in their cart briefly sees "Your cart is empty" flash in on
  // every visit to this page (unlike the drawer, which only opens well
  // after hydration finishes, `/cart` is a direct navigation target).
  if (!hasHydrated) {
    return null;
  }

  const lines = getCartLines(items, products);

  if (lines.length === 0) {
    return <EmptyCart />;
  }

  const subtotal = getCartSubtotal(lines);

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <div className="flex-1 rounded-lg border border-steel/40 px-4">
        {lines.map((line) => (
          <CartLineItem key={line.productId} line={line} />
        ))}
      </div>
      <div className="md:w-80 md:shrink-0">
        <CartSummary subtotal={subtotal} />
      </div>
    </div>
  );
}
