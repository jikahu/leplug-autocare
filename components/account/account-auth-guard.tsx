"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore, useAuthHasHydrated } from "@/lib/store/auth";

export function AccountAuthGuard({ children }: { children: ReactNode }) {
  const hasHydrated = useAuthHasHydrated();
  const currentUser = useAuthStore((state) => state.currentUser);

  if (!hasHydrated) {
    return null;
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-steel/40 bg-tarmac/5 px-6 py-16 text-center">
        <p className="text-sm text-tarmac/70">Log in to view this page.</p>
        <Button render={<Link href="/account/login" />} nativeButton={false}>
          Log In
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
