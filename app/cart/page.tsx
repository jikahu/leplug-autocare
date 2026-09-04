import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CartPageContent } from "@/components/cart/cart-page-content";

export const metadata: Metadata = {
  title: "Your Cart — LePlug Autocare",
  description: "Review the items in your cart, update quantities, and proceed to checkout.",
};

export default function CartPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Cart" }]} />
      <h1 className="mt-2 font-heading text-3xl font-black text-tarmac">Your Cart</h1>
      <div className="mt-6">
        <CartPageContent />
      </div>
    </main>
  );
}
