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
          <p role="status" className="text-xs text-tarmac/70">
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
