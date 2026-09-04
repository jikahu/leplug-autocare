import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { NoResults, type NoResultsProps } from "@/components/product/no-results";

export function ProductGrid({
  products,
  emptyState,
}: {
  products: Product[];
  emptyState: NoResultsProps;
}) {
  if (products.length === 0) {
    return <NoResults {...emptyState} />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
