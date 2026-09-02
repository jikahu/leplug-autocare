export type ShopFilterParams = {
  q?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  make?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
};

const PARAM_ORDER: (keyof ShopFilterParams)[] = [
  "q",
  "category",
  "subcategory",
  "brand",
  "make",
  "minPrice",
  "maxPrice",
  "sort",
];

export function buildFilterHref(
  basePath: string,
  current: ShopFilterParams,
  updates: Partial<ShopFilterParams>
): string {
  const merged: ShopFilterParams = { ...current, ...updates };
  const pairs: string[] = [];
  for (const key of PARAM_ORDER) {
    const value = merged[key];
    if (value) pairs.push(`${key}=${encodeURIComponent(value)}`);
  }
  return pairs.length > 0 ? `${basePath}?${pairs.join("&")}` : basePath;
}
