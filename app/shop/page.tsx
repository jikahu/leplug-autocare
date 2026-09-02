import type { Metadata } from "next";
import { CategoryBar } from "@/components/layout/category-bar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ShopFilters } from "@/components/product/shop-filters";
import { SortSelect } from "@/components/product/sort-select";
import { ProductGrid } from "@/components/product/product-grid";
import { products } from "@/lib/data/products";
import { filterProducts } from "@/lib/utils/filter-products";
import { sortProducts, type SortOption } from "@/lib/utils/sort-products";
import { parseShopSearchParams } from "@/lib/utils/parse-shop-search-params";

export const metadata: Metadata = {
  title: "Shop All Products — LePlug Autocare",
  description: "Browse every car part, accessory, and detailing product LePlug Autocare carries.",
};

const SORT_OPTIONS = new Set<SortOption>(["price-asc", "price-desc", "newest", "bestselling", "rating"]);

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const current = parseShopSearchParams(raw);

  const filtered = filterProducts(products, {
    category: current.category,
    subcategory: current.subcategory,
    brand: current.brand,
    make: current.make,
    minPrice: current.minPrice ? Number(current.minPrice) : undefined,
    maxPrice: current.maxPrice ? Number(current.maxPrice) : undefined,
  });

  const sorted =
    current.sort && SORT_OPTIONS.has(current.sort as SortOption)
      ? sortProducts(filtered, current.sort as SortOption)
      : filtered;

  const brands = Array.from(
    new Set(
      products
        .filter((p) => !current.category || p.category === current.category)
        .map((p) => p.brand)
        .filter((b): b is string => Boolean(b))
    )
  ).sort();

  return (
    <main>
      <CategoryBar />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <Breadcrumbs items={[{ label: "Shop" }]} />
        <h1 className="mt-2 font-heading text-3xl font-black text-tarmac">Shop All Products</h1>
        <p className="mt-1 text-sm text-tarmac/70">
          {sorted.length} product{sorted.length === 1 ? "" : "s"}
        </p>

        <div className="mt-6 flex flex-col gap-6 md:flex-row">
          <ShopFilters basePath="/shop" current={current} brands={brands} />

          <div className="flex-1">
            <div className="mb-4 flex justify-end">
              <SortSelect basePath="/shop" current={current} />
            </div>
            <ProductGrid products={sorted} emptyState={{ variant: "filters", clearHref: "/shop" }} />
          </div>
        </div>
      </div>
    </main>
  );
}
