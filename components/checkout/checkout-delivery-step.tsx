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
