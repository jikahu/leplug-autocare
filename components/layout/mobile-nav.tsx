"use client";

import Link from "next/link";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavLink = { label: string; href: string };

export function MobileNav({ navLinks }: { navLinks: NavLink[] }) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="text-savanna hover:bg-savanna/10 md:hidden"
            aria-label="Open menu"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="border-steel bg-tarmac text-savanna data-[side=right]:w-full data-[side=right]:sm:max-w-full"
      >
        <SheetHeader>
          <SheetTitle className="font-heading text-savanna">
            LE PLUG AUTOCARE
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-3 text-lg font-medium hover:bg-savanna/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/account/login"
            className="flex items-center gap-2 rounded-md px-3 py-3 text-lg font-medium hover:bg-savanna/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
          >
            <User className="size-5" aria-hidden="true" />
            Account
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
