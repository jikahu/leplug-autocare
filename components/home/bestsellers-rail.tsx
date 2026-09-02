import { products } from "@/lib/data/products";
import { sortProducts } from "@/lib/utils/sort-products";
import { ProductCard } from "@/components/product/product-card";

export function BestsellersRail() {
  const bestsellers = sortProducts(
    products.filter((product) => product.tags?.includes("Bestseller")),
    "rating"
  ).slice(0, 8);

  if (bestsellers.length === 0) return null;

  return (
    <section className="bg-savanna">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h2 className="font-heading text-2xl font-black text-tarmac sm:text-3xl">Bestsellers</h2>
        <p className="mt-1 text-sm text-tarmac/70">What Nairobi drivers are buying most.</p>
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
          {bestsellers.map((product, index) => (
            <div key={product.id} className="relative w-56 shrink-0 snap-start sm:w-64">
              <span
                className="pointer-events-none absolute left-1 top-16 z-10 font-stencil text-3xl font-bold text-murram/25"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
