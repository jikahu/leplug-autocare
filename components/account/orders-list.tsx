"use client";

import { useOrderStore, useOrderHasHydrated } from "@/lib/store/orders";
import { useAuthStore } from "@/lib/store/auth";
import { OrderCard } from "@/components/account/order-card";
import { EmptyOrders } from "@/components/account/empty-orders";

export function OrdersList() {
  const hasHydrated = useOrderHasHydrated();
  const orders = useOrderStore((state) => state.orders);
  const currentUser = useAuthStore((state) => state.currentUser);

  if (!hasHydrated || !currentUser) {
    return null;
  }

  const myOrders = orders.filter((order) => order.userId === currentUser.id);

  if (myOrders.length === 0) {
    return <EmptyOrders />;
  }

  return (
    <div className="space-y-4">
      {myOrders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
