import { formatCurrency } from "@/lib/utils/format-currency";
import { freeDeliveryRemaining } from "@/lib/utils/delivery-fee";

export function CartTotals({ subtotal }: { subtotal: number }) {
  const remaining = freeDeliveryRemaining(subtotal);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-tarmac/70">Subtotal</span>
        <span className="font-medium text-tarmac">{formatCurrency(subtotal)}</span>
      </div>

      <div aria-live="polite" aria-atomic="true">
        {remaining > 0 ? (
          <>
            <p className="text-xs text-tarmac/60">
              Add {formatCurrency(remaining)} more for free delivery.
            </p>
            <p className="text-xs text-tarmac/60">Delivery calculated at checkout.</p>
          </>
        ) : (
          <p className="text-xs font-medium text-acacia">You&apos;ve unlocked free delivery.</p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-steel/40 pt-2 text-base">
        <span className="font-semibold text-tarmac">Total</span>
        <span aria-live="polite" aria-atomic="true" className="font-heading font-bold text-murram">
          {formatCurrency(subtotal)}
        </span>
      </div>
    </div>
  );
}
