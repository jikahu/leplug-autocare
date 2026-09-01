export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: string;
  subcategory?: string;
  compatibleMakes?: string[];
  brand?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  description: string;
  keyFeatures: string[];
  stock: StockStatus;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
};
