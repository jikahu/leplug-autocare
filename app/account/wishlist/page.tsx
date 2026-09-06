import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { AccountNav } from "@/components/account/account-nav";
import { WishlistGrid } from "@/components/account/wishlist-grid";

export const metadata: Metadata = {
  title: "Your Wishlist — LePlug Autocare",
  description: "Products you've saved to buy later.",
};

export default function WishlistPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Wishlist" }]} />
      <h1 className="mt-2 font-heading text-3xl font-black text-tarmac">Your Wishlist</h1>
      <div className="mt-6 flex flex-col gap-8 sm:flex-row">
        <AccountNav />
        <div className="flex-1">
          <WishlistGrid />
        </div>
      </div>
    </main>
  );
}
