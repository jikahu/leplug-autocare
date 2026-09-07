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

      <p className="text-xs text-tarmac/70">
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
