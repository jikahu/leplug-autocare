"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useOrderStore } from "@/lib/store/orders";
import { useAuthStore } from "@/lib/store/auth";

/**
 * Rehydrates the persisted cart, wishlist, order, and auth stores from
 * localStorage after the client has mounted. All four stores use
 * `skipHydration: true` so their first client render matches the
 * server-rendered (empty/logged-out) HTML; this effect then loads the real
 * saved state, and every component subscribed to the stores (header cart
 * badge, wishlist hearts, account nav, etc.) re-renders automatically.
 * Renders nothing — mount once, high in the tree (see app/layout.tsx).
 */
export function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
    useOrderStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
  }, []);

  return null;
}
