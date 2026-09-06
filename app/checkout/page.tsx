import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";

export const metadata: Metadata = {
  title: "Checkout — LePlug Autocare",
  description: "Complete your order — delivery details, payment, and confirmation.",
};

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <h1 className="font-heading text-3xl font-black text-tarmac">Checkout</h1>
      <div className="mt-6">
        <CheckoutFlow />
      </div>
    </main>
  );
}
