import type { ShopFilterParams } from "./build-filter-url";

export type RawSearchParams = Record<string, string | string[] | undefined>;

// Must list every key in ShopFilterParams — any key missing here is silently dropped.
const KEYS: (keyof ShopFilterParams)[] = [
  "q",
  "category",
  "subcategory",
  "brand",
  "make",
  "minPrice",
  "maxPrice",
  "sort",
];

export function parseShopSearchParams(raw: RawSearchParams): ShopFilterParams {
  const result: ShopFilterParams = {};
  for (const key of KEYS) {
    const value = raw[key];
    const single = Array.isArray(value) ? value[0] : value;
    if (single) result[key] = single;
  }
  return result;
}
