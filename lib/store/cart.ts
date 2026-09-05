import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/lib/types";

type CartState = {
  items: CartItem[];
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (productId, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.productId === productId);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.productId === productId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, { productId, quantity }] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.productId !== productId)
              : state.items.map((item) =>
                  item.productId === productId ? { ...item, quantity } : item
                ),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "leplug-cart",
      storage: createJSONStorage(() => localStorage),
      // Rehydration is triggered manually (see components/layout/store-hydration.tsx)
      // after the client mounts, so the first client render matches the
      // server-rendered HTML (empty cart) instead of causing a hydration
      // mismatch when localStorage already has saved items.
      skipHydration: true,
    }
  )
);

export function useCartItemCount(): number {
  return useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
}

/**
 * True once the persisted cart has finished loading from localStorage.
 * `createJSONStorage` evaluates `localStorage` eagerly, which throws in any
 * environment without it (SSR, `next build`'s static prerendering) — that
 * failure is caught internally and leaves `useCartStore.persist` undefined
 * there, so every access below is optional-chained and deferred inside a
 * closure `useSyncExternalStore` only invokes client-side. Its
 * `getServerSnapshot` (the third argument) always returns `false`, so the
 * server-rendered and first client-rendered HTML match — no hydration
 * mismatch — and this never touches `.persist` during SSR/build at all.
 */
export function useCartHasHydrated(): boolean {
  return useSyncExternalStore(
    (callback) => useCartStore.persist?.onFinishHydration(callback) ?? (() => {}),
    () => useCartStore.persist?.hasHydrated() ?? false,
    () => false
  );
}
