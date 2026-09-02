"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";

/**
 * Rehydrates the persisted cart and wishlist stores from localStorage after
 * the client has mounted. Both stores use `skipHydration: true` so their
 * first client render matches the server-rendered (empty) HTML; this effect
 * then loads the real saved state, and every component subscribed to the
 * stores (header cart badge, wishlist hearts, etc.) re-renders automatically.
 * Renders nothing — mount once, high in the tree (see app/layout.tsx).
 */
export function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
  }, []);

  return null;
}
