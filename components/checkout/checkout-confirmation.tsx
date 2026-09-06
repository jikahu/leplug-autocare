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
