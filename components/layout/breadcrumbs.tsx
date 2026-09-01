import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-tarmac/70">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link
            href="/"
            className="rounded-sm hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
          >
            Home
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
            {item.href && index < items.length - 1 ? (
              <Link
                href={item.href}
                className="rounded-sm hover:text-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-tarmac">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
