import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryBar } from "@/components/layout/category-bar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ShopFilters } from "@/components/product/shop-filters";
import { SortSelect } from "@/components/product/sort-select";
import { ProductGrid } from "@/components/product/product-grid";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getProductsByCategory } from "@/lib/data/products";
import { filterProducts } from "@/lib/utils/filter-products";
import { sortProducts, SORT_OPTIONS, type SortOption } from "@/lib/utils/sort-products";
import { parseShopSearchParams } from "@/lib/utils/parse-shop-search-params";

const VALID_SORT_VALUES = new Set<SortOption>(SORT_OPTIONS.map((option) => option.value));

type CategoryPageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.name} — LePlug Autocare`,
    description: category.description,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const raw = await searchParams;
  const current = parseShopSearchParams(raw);
  const basePath = `/shop/${category.slug}`;

  const categoryProducts = getProductsByCategory(category.id);

  const filtered = filterProducts(categoryProducts, {
    subcategory: current.subcategory,
    brand: current.brand,
    make: current.make,
    minPrice: current.minPrice ? Number(current.minPrice) : undefined,
    maxPrice: current.maxPrice ? Number(current.maxPrice) : undefined,
  });

  const sorted =
    current.sort && VALID_SORT_VALUES.has(current.sort as SortOption)
      ? sortProducts(filtered, current.sort as SortOption)
      : filtered;

  const brands = Array.from(
    new Set(categoryProducts.map((p) => p.brand).filter((b): b is string => Boolean(b)))
  ).sort();

  return (
    <main>
      <CategoryBar />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: category.name }]} />
        <h1 className="mt-2 font-heading text-3xl font-black text-tarmac">{category.name}</h1>
        <p className="mt-1 max-w-2xl text-sm text-tarmac/70">{category.description}</p>
        <p className="mt-3 text-sm text-tarmac/70">
          {sorted.length} product{sorted.length === 1 ? "" : "s"}
        </p>

        <div className="mt-6 flex flex-col gap-6 md:flex-row">
          <ShopFilters
            basePath={basePath}
            current={current}
            lockedCategory={category.id}
            brands={brands}
          />

          <div className="flex-1">
            <div className="mb-4 flex justify-end">
              <SortSelect basePath={basePath} current={current} />
            </div>
            <ProductGrid products={sorted} emptyState={{ variant: "filters", clearHref: basePath }} />
          </div>
        </div>
      </div>
    </main>
  );
}
