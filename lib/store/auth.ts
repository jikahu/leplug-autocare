import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { users as seedUsers } from "@/lib/data/users";
import type { Address, User } from "@/lib/types";

type AuthState = {
  currentUser: User | null;
  users: User[];
  login: (email: string) => boolean;
  register: (name: string, email: string) => boolean;
  logout: () => void;
  updateProfile: (updates: { name: string; email: string }) => void;
  addAddress: (address: Address) => void;
  updateAddress: (addressId: string, updates: Partial<Omit<Address, "id">>) => void;
  removeAddress: (addressId: string) => void;
};

function withUpdatedUser(
  state: Pick<AuthState, "users" | "currentUser">,
  updatedUser: User
): Pick<AuthState, "users" | "currentUser"> {
  return {
    users: state.users.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
    currentUser: updatedUser,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: seedUsers,
      login: (email) => {
        const match = get().users.find(
          (user) => user.email.toLowerCase() === email.toLowerCase()
        );
        if (!match) return false;
        set({ currentUser: match });
        return true;
      },
      register: (name, email) => {
        const exists = get().users.some(
          (user) => user.email.toLowerCase() === email.toLowerCase()
        );
        if (exists) return false;
        const newUser: User = {
          id: `user-${Date.now()}`,
          name,
          email,
          addresses: [],
        };
        set((state) => ({ users: [...state.users, newUser], currentUser: newUser }));
        return true;
      },
      logout: () => set({ currentUser: null }),
      updateProfile: (updates) =>
        set((state) => {
          if (!state.currentUser) return state;
          return withUpdatedUser(state, { ...state.currentUser, ...updates });
        }),
      addAddress: (address) =>
        set((state) => {
          if (!state.currentUser) return state;
          return withUpdatedUser(state, {
            ...state.currentUser,
            addresses: [...state.currentUser.addresses, address],
          });
        }),
      updateAddress: (addressId, updates) =>
        set((state) => {
          if (!state.currentUser) return state;
          return withUpdatedUser(state, {
            ...state.currentUser,
            addresses: state.currentUser.addresses.map((address) =>
              address.id === addressId ? { ...address, ...updates } : address
            ),
          });
        }),
      removeAddress: (addressId) =>
        set((state) => {
          if (!state.currentUser) return state;
          return withUpdatedUser(state, {
            ...state.currentUser,
            addresses: state.currentUser.addresses.filter(
              (address) => address.id !== addressId
            ),
          });
        }),
    }),
    {
      name: "leplug-auth",
      storage: createJSONStorage(() => localStorage),
      // Rehydration is triggered manually (see components/layout/store-hydration.tsx)
      // after the client mounts, so the first client render matches the
      // server-rendered HTML (logged out) instead of causing a hydration
      // mismatch when localStorage already has a saved session.
      skipHydration: true,
    }
  )
);

/**
 * True once the persisted auth session has finished loading from
 * localStorage. See the identical `useCartHasHydrated`/`useWishlistHasHydrated`
 * in lib/store/cart.ts / lib/store/wishlist.ts for the full explanation of
 * why every `.persist` access here is optional-chained and deferred inside a
 * closure `useSyncExternalStore` only invokes client-side: `createJSONStorage`
 * evaluates `localStorage` eagerly, which throws during SSR/`next build` and
 * leaves `useAuthStore.persist` undefined there.
 */
export function useAuthHasHydrated(): boolean {
  return useSyncExternalStore(
    (callback) => useAuthStore.persist?.onFinishHydration(callback) ?? (() => {}),
    () => useAuthStore.persist?.hasHydrated() ?? false,
    () => false
  );
}
