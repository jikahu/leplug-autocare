import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { AccountNav } from "@/components/account/account-nav";
import { AccountAuthGuard } from "@/components/account/account-auth-guard";
import { OrdersList } from "@/components/account/orders-list";

export const metadata: Metadata = {
  title: "Your Orders — LePlug Autocare",
  description: "View your LePlug Autocare order history.",
};

export default function OrdersPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <Breadcrumbs items={[{ label: "Orders" }]} />
      <h1 className="mt-2 font-heading text-3xl font-black text-tarmac">Your Orders</h1>
      <div className="mt-6 flex flex-col gap-8 sm:flex-row">
        <AccountNav />
        <div className="flex-1">
          <AccountAuthGuard>
            <OrdersList />
          </AccountAuthGuard>
        </div>
      </div>
    </main>
  );
}
