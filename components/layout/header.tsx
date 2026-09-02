"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, User } from "lucide-react";
import { useCartItemCount } from "@/lib/store/cart";
import { MobileNav } from "./mobile-nav";

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const itemCount = useCartItemCount();
  const router = useRouter();

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 24);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get("q");
    if (typeof query === "string" && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setMobileSearchOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-steel bg-tarmac text-savanna">
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-[height] duration-200 md:px-8 ${
          isScrolled ? "h-14" : "h-20"
        }`}
      >
        <Link
          href="/"
          className="shrink-0 rounded-sm font-heading text-xl font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        >
          LE PLUG
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-sm text-sm font-medium hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form
          onSubmit={handleSearchSubmit}
          role="search"
          className="hidden max-w-sm flex-1 items-center gap-2 rounded-md border border-steel bg-savanna/5 px-3 py-1.5 focus-within:ring-2 focus-within:ring-murram md:flex"
        >
          <Search className="size-4 shrink-0 text-savanna/70" aria-hidden="true" />
          <input
            type="search"
            name="q"
            required
            placeholder="Search parts, accessories..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-savanna/50"
            aria-label="Search products"
          />
        </form>

        <div className="flex items-center gap-3 md:gap-4">
          <button
            type="button"
            onClick={() => setMobileSearchOpen((open) => !open)}
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram md:hidden"
            aria-label="Toggle search"
            aria-expanded={mobileSearchOpen}
          >
            <Search className="size-5" />
          </button>
          <Link
            href="/account/login"
            className="hidden rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram md:block"
            aria-label="Account"
          >
            <User className="size-5" />
          </Link>
          <Link
            href="/cart"
            className="relative rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
          >
            <ShoppingCart className="size-5" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-murram text-[10px] font-bold text-savanna">
                {itemCount}
              </span>
            )}
          </Link>
          <MobileNav navLinks={NAV_LINKS} />
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="border-t border-steel px-4 py-3 md:hidden">
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            className="flex items-center gap-2 rounded-md border border-steel bg-savanna/5 px-3 py-1.5 focus-within:ring-2 focus-within:ring-murram"
          >
            <Search className="size-4 shrink-0 text-savanna/70" aria-hidden="true" />
            <input
              type="search"
              name="q"
              required
              placeholder="Search parts, accessories..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-savanna/50"
              aria-label="Search products"
              autoFocus
            />
          </form>
        </div>
      )}
    </header>
  );
}
