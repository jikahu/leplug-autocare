import type { Product } from "@/lib/types";

export type ProductFilters = {
  category?: string;
  subcategory?: string;
  brand?: string;
  make?: string;
  minPrice?: number;
  maxPrice?: number;
};

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  return products.filter((product) => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.subcategory && product.subcategory !== filters.subcategory) return false;
    if (filters.brand && product.brand !== filters.brand) return false;
    if (filters.make && !product.compatibleMakes?.includes(filters.make)) return false;
    if (filters.minPrice !== undefined && product.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) return false;
    return true;
  });
}
