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

      <div className="flex min-w-0 flex-1 flex-col gap-1">
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
              onClick={() => updateQuantity(line.productId, Math.max(1, line.quantity - 1))}
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
            className="rounded-sm p-1.5 text-steel hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <span className="shrink-0 self-center font-semibold text-tarmac">{formatCurrency(line.lineTotal)}</span>
    </div>
  );
}
