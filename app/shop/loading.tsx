import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";

export default function ShopLoading() {
  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="h-9 w-64 animate-pulse rounded bg-steel/30" />
        <div className="mt-6 flex flex-col gap-6 md:flex-row">
          <div className="hidden w-64 shrink-0 md:block" />
          <div className="flex-1">
            <ProductGridSkeleton />
          </div>
        </div>
      </div>
    </main>
  );
}
