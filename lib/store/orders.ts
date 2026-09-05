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
