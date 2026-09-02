import Link from "next/link";
import { categories } from "@/lib/data/categories";
import { getCategoryIcon } from "@/lib/utils/category-icons";

export function CategoryTiles() {
  return (
    <section className="bg-savanna">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h2 className="font-heading text-2xl font-black text-tarmac sm:text-3xl">
          Shop by Category
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.id);
            return (
              <Link
                key={category.id}
                href={`/shop/${category.slug}`}
                className="group flex flex-col gap-3 rounded-lg border border-steel/40 bg-tarmac/5 p-5 transition-colors hover:border-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-linear-to-br from-chrome-start to-chrome-end">
                  <Icon className="size-6 text-tarmac/70" aria-hidden="true" />
                </span>
                <span className="font-heading text-lg font-bold text-tarmac group-hover:text-murram">
                  {category.name}
                </span>
                <span className="text-sm text-tarmac/70">{category.description}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
