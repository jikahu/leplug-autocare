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
      <SheetContent
        side="right"
        className="border-steel bg-savanna text-tarmac data-[side=right]:w-11/12 data-[side=right]:sm:max-w-sm"
      >
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
