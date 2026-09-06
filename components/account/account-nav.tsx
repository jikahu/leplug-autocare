"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore, useAuthHasHydrated } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Orders", href: "/account/orders" },
  { label: "Wishlist", href: "/account/wishlist" },
  { label: "Profile", href: "/account/profile" },
];

export function AccountNav() {
  const hasHydrated = useAuthHasHydrated();
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account"
      className="flex flex-col gap-1 border-b border-steel/40 pb-4 sm:w-48 sm:shrink-0 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4"
    >
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={pathname === link.href ? "page" : undefined}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram",
            pathname === link.href ? "bg-murram text-savanna" : "text-tarmac hover:bg-tarmac/5"
          )}
        >
          {link.label}
        </Link>
      ))}

      {hasHydrated &&
        (currentUser ? (
          <Button type="button" variant="outline" onClick={logout} className="mt-2">
            Log Out
          </Button>
        ) : (
          <Button render={<Link href="/account/login" />} nativeButton={false} className="mt-2">
            Log In
          </Button>
        ))}
    </nav>
  );
}
