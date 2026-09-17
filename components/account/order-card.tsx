import Link from "next/link";
import { formatCurrency } from "@/lib/utils/format-currency";
import { getCartLines } from "@/lib/utils/cart-lines";
import { products } from "@/lib/data/products";
import type { Order } from "@/lib/types";

const STATUS_LABELS: Record<Order["status"], string> = {
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};

export function OrderCard({ order }: { order: Order }) {
  const lines = getCartLines(order.items, products);
  const placedDate = new Date(order.placedAt).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="rounded-lg border border-steel/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-stencil text-sm text-tarmac">{order.id}</p>
          <p className="text-xs text-tarmac/70">Placed {placedDate}</p>
        </div>
        <span className="rounded-full bg-acacia/10 px-3 py-1 text-xs font-medium text-acacia">
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <ul className="mt-3 space-y-1 text-sm text-tarmac/80">
        {lines.map((line) => (
          <li key={line.productId}>
            <Link
              href={`/product/${line.product.slug}`}
              className="rounded-sm hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
            >
              {line.product.name}
            </Link>{" "}
            &times; {line.quantity}
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between border-t border-steel/40 pt-3 text-sm">
        <span className="text-tarmac/70">Total</span>
        <span className="font-semibold text-murram">{formatCurrency(order.total)}</span>
      </div>
    </div>
  );
}
