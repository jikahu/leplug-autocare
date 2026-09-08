import Link from "next/link";
import Image from "next/image";
import { categories } from "@/lib/data/categories";

export function CategoryTiles() {
  return (
    <section className="bg-savanna">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h2 className="font-heading text-2xl font-black text-tarmac sm:text-3xl">
          Shop by Category
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {categories.map((category) => {
            return (
              <Link
                key={category.id}
                href={`/shop/${category.slug}`}
                className="group flex flex-col overflow-hidden rounded-lg border border-steel/40 transition-colors hover:border-murram focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden bg-tarmac">
                  <Image
                    src={category.heroImage}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-tarmac/85 via-tarmac/10 to-transparent" />
                  <span className="absolute bottom-3 left-3 font-heading text-lg font-bold text-savanna">
                    {category.name}
                  </span>
                </div>
                <span className="bg-tarmac/5 px-4 py-3 text-sm text-tarmac/70">
                  {category.description}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
