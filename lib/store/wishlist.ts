import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type WishlistState = {
  productIds: string[];
  toggle: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  clear: () => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        })),
      isWishlisted: (productId) => get().productIds.includes(productId),
      clear: () => set({ productIds: [] }),
    }),
    {
      name: "leplug-wishlist",
      storage: createJSONStorage(() => localStorage),
      // Rehydration is triggered manually (see components/layout/store-hydration.tsx)
      // after the client mounts, so the first client render matches the
      // server-rendered HTML (nothing wishlisted) instead of causing a
      // hydration mismatch when localStorage already has saved items.
      skipHydration: true,
    }
  )
);

/**
 * True once the persisted wishlist has finished loading from localStorage.
 * `createJSONStorage` evaluates `localStorage` eagerly, which throws in any
 * environment without it (SSR, `next build`'s static prerendering) — that
 * failure is caught internally and leaves `useWishlistStore.persist`
 * undefined there, so every access below is optional-chained and deferred
 * inside a closure `useSyncExternalStore` only invokes client-side. Its
 * `getServerSnapshot` (the third argument) always returns `false`, so the
 * server-rendered and first client-rendered HTML match — no hydration
 * mismatch — and this never touches `.persist` during SSR/build at all.
 */
export function useWishlistHasHydrated(): boolean {
  return useSyncExternalStore(
    (callback) => useWishlistStore.persist?.onFinishHydration(callback) ?? (() => {}),
    () => useWishlistStore.persist?.hasHydrated() ?? false,
    () => false
  );
}
