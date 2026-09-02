import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/data/categories";
import { ALL_VEHICLE_MAKES } from "@/lib/data/products";
import { buildFilterHref, type ShopFilterParams } from "@/lib/utils/build-filter-url";

const PRICE_BUCKETS: { label: string; min?: string; max?: string }[] = [
  { label: "Under KSh 2,000", max: "2000" },
  { label: "KSh 2,000 – 5,000", min: "2000", max: "5000" },
  { label: "KSh 5,000 – 10,000", min: "5000", max: "10000" },
  { label: "Over KSh 10,000", min: "10000" },
];

type ShopFiltersProps = {
  basePath: string;
  current: ShopFilterParams;
  brands: string[];
  lockedCategory?: string;
};

function FilterPill({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram ${
        active
          ? "border-murram bg-murram text-savanna"
          : "border-steel text-tarmac hover:border-murram hover:text-murram"
      }`}
    >
      {label}
    </Link>
  );
}

function FilterSections({ basePath, current, brands, lockedCategory }: ShopFiltersProps) {
  const activeCategoryId = lockedCategory ?? current.category;
  const activeCategory = activeCategoryId
    ? categories.find((c) => c.id === activeCategoryId)
    : undefined;
  const hasActiveFilters = Boolean(
    current.category ||
      current.subcategory ||
      current.brand ||
      current.make ||
      current.minPrice ||
      current.maxPrice
  );

  return (
    <div className="flex flex-col gap-6">
      {hasActiveFilters && (
        <Link
          href={basePath}
          className="self-start text-sm font-medium text-murram underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-murram"
        >
          Clear all filters
        </Link>
      )}

      {!lockedCategory && (
        <fieldset className="flex flex-col gap-2">
          <legend className="font-heading text-sm font-bold text-tarmac">Category</legend>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <FilterPill
                key={category.id}
                label={category.name}
                active={current.category === category.id}
                href={buildFilterHref(basePath, current, {
                  category: current.category === category.id ? undefined : category.id,
                  subcategory: undefined,
                })}
              />
            ))}
          </div>
        </fieldset>
      )}

      {activeCategory && activeCategory.subcategories.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="font-heading text-sm font-bold text-tarmac">Subcategory</legend>
          <div className="flex flex-wrap gap-2">
            {activeCategory.subcategories.map((sub) => (
              <FilterPill
                key={sub.id}
                label={sub.name}
                active={current.subcategory === sub.slug}
                href={buildFilterHref(basePath, current, {
                  subcategory: current.subcategory === sub.slug ? undefined : sub.slug,
                })}
              />
            ))}
          </div>
        </fieldset>
      )}

      {brands.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="font-heading text-sm font-bold text-tarmac">Brand</legend>
          <div className="flex flex-wrap gap-2">
            {brands.map((brand) => (
              <FilterPill
                key={brand}
                label={brand}
                active={current.brand === brand}
                href={buildFilterHref(basePath, current, {
                  brand: current.brand === brand ? undefined : brand,
                })}
              />
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="font-heading text-sm font-bold text-tarmac">Vehicle Make</legend>
        <div className="flex flex-wrap gap-2">
          {ALL_VEHICLE_MAKES.map((make) => (
            <FilterPill
              key={make}
              label={make}
              active={current.make === make}
              href={buildFilterHref(basePath, current, {
                make: current.make === make ? undefined : make,
              })}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-heading text-sm font-bold text-tarmac">Price</legend>
        <div className="flex flex-wrap gap-2">
          {PRICE_BUCKETS.map((bucket) => {
            const active = current.minPrice === bucket.min && current.maxPrice === bucket.max;
            return (
              <FilterPill
                key={bucket.label}
                label={bucket.label}
                active={active}
                href={buildFilterHref(basePath, current, {
                  minPrice: active ? undefined : bucket.min,
                  maxPrice: active ? undefined : bucket.max,
                })}
              />
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

export function ShopFilters(props: ShopFiltersProps) {
  return (
    <>
      <aside className="hidden w-64 shrink-0 md:block">
        <FilterSections {...props} />
      </aside>
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                Filters
              </Button>
            }
          />
          <SheetContent side="left" className="overflow-y-auto bg-savanna text-tarmac">
            <SheetHeader>
              <SheetTitle className="text-tarmac">Filters</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-4">
              <FilterSections {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
