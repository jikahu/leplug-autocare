import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Order } from "@/lib/types";

type OrderState = {
  orders: Order[];
  placeOrder: (order: Order) => void;
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      placeOrder: (order) =>
        set((state) => ({ orders: [order, ...state.orders] })),
    }),
    {
      name: "leplug-orders",
      storage: createJSONStorage(() => localStorage),
      // Rehydration is triggered manually (see components/layout/store-hydration.tsx)
      // after the client mounts, so the first client render matches the
      // server-rendered HTML (no orders) instead of causing a hydration
      // mismatch when localStorage already has saved orders.
      skipHydration: true,
    }
  )
);

/**
 * True once the persisted orders have finished loading from localStorage.
 * See `useCartHasHydrated` (lib/store/cart.ts) for the full explanation of
 * why every `.persist` access here is optional-chained and deferred inside a
 * closure `useSyncExternalStore` only invokes client-side. Added in Phase 8
 * for `/account/orders`, the first page that reads this store's persisted
 * data back on mount — Phase 7 itself never needed this hook.
 */
export function useOrderHasHydrated(): boolean {
  return useSyncExternalStore(
    (callback) => useOrderStore.persist?.onFinishHydration(callback) ?? (() => {}),
    () => useOrderStore.persist?.hasHydrated() ?? false,
    () => false
  );
}
