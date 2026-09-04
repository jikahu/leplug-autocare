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
