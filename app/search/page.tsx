import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/product-grid";
import { SortSelect } from "@/components/product/sort-select";
import { products } from "@/lib/data/products";
import { searchProducts } from "@/lib/utils/search-products";
import { sortProducts, SORT_OPTIONS, type SortOption } from "@/lib/utils/sort-products";
import { parseShopSearchParams } from "@/lib/utils/parse-shop-search-params";

const VALID_SORT_VALUES = new Set<SortOption>(SORT_OPTIONS.map((option) => option.value));

export const metadata: Metadata = {
  title: "Search Results — LePlug Autocare",
  description: "Search LePlug Autocare's full catalog of car parts, accessories, and detailing products.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const current = parseShopSearchParams(raw);
  const query = current.q ?? "";

  const matched = query ? searchProducts(products, query) : [];
  const sorted =
    current.sort && VALID_SORT_VALUES.has(current.sort as SortOption)
      ? sortProducts(matched, current.sort as SortOption)
      : matched;

  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <h1 className="font-heading text-3xl font-black text-tarmac">
          {query ? `Search Results for "${query}"` : "Search"}
        </h1>
        <p className="mt-1 text-sm text-tarmac/70">
          {query
            ? `${sorted.length} product${sorted.length === 1 ? "" : "s"} found`
            : "Type a product name, category, or brand in the search bar above."}
        </p>

        {query && sorted.length > 0 && (
          <div className="mt-4 flex justify-end">
            <SortSelect basePath="/search" current={current} />
          </div>
        )}

        {query && (
          <div className="mt-6">
            <ProductGrid products={sorted} emptyState={{ variant: "search", query }} />
          </div>
        )}
      </div>
    </main>
  );
}
