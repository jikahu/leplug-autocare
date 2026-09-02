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
