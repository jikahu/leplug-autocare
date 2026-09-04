import { ProductDetailSkeleton } from "@/components/product/product-detail-skeleton";

export default function ProductLoading() {
  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="h-4 w-48 animate-pulse rounded bg-steel/30" />
        <ProductDetailSkeleton />
      </div>
    </main>
  );
}
