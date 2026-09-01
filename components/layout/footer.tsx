import Link from "next/link";
import { categories } from "@/lib/data/categories";

const INFO_LINKS = [
  { label: "About", href: "/about" },
  { label: "Delivery", href: "/faq#delivery" },
  { label: "How to Buy", href: "/faq#how-to-buy" },
  { label: "FAQ", href: "/faq" },
];

const ACCOUNT_LINKS = [
  { label: "Login", href: "/account/login" },
  { label: "Orders", href: "/account/orders" },
  { label: "Wishlist", href: "/account/wishlist" },
];

const SOCIAL_LINKS = ["Instagram", "Facebook", "TikTok"];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-tarmac text-savanna">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4 md:px-8">
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-savanna/60">
            Information
          </h3>
          <ul className="flex flex-col gap-2">
            {INFO_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-sm text-sm hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-savanna/60">
            Shop
          </h3>
          <ul className="flex flex-col gap-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/shop/${category.slug}`}
                  className="rounded-sm text-sm hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-savanna/60">
            Account
          </h3>
          <ul className="flex flex-col gap-2">
            {ACCOUNT_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-sm text-sm hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-savanna/60">
            Contact &amp; Social
          </h3>
          <ul className="flex flex-col gap-2">
            <li>
              <Link
                href="/contact"
                className="rounded-sm text-sm hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
              >
                Contact Us
              </Link>
            </li>
            {SOCIAL_LINKS.map((label) => (
              <li key={label}>
                <a
                  href="#"
                  className="rounded-sm text-sm hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-steel">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-savanna/60 md:flex-row md:px-8">
          <p>&copy; {year} LePlug Autocare. All rights reserved.</p>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="rounded-sm hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="rounded-sm hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
            >
              Terms
            </Link>
            <Link
              href="/returns"
              className="rounded-sm hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
            >
              Returns
            </Link>
          </div>
          <div className="flex gap-2">
            {["M-Pesa", "Visa", "Mastercard"].map((method) => (
              <span
                key={method}
                className="rounded border border-steel px-2 py-1 text-xs font-medium text-savanna/80"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
