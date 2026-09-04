import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";

export default function SearchLoading() {
  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="h-9 w-64 animate-pulse rounded bg-steel/30" />
        <div className="mt-6">
          <ProductGridSkeleton />
        </div>
      </div>
    </main>
  );
}
