import { describe, it, expect } from "vitest";
import type { Product } from "@/lib/types";
import { sortProducts } from "./sort-products";

const sample: Product[] = [
  { id: "1", slug: "a", sku: "A1", name: "A", category: "x", price: 3000, images: [], description: "", keyFeatures: [], stock: "in_stock", rating: 4.2, tags: [] },
  { id: "2", slug: "b", sku: "B1", name: "B", category: "x", price: 1000, images: [], description: "", keyFeatures: [], stock: "in_stock", rating: 4.8, tags: ["Bestseller"] },
  { id: "3", slug: "c", sku: "C1", name: "C", category: "x", price: 2000, images: [], description: "", keyFeatures: [], stock: "in_stock", rating: 3.9, tags: ["New"] },
];

describe("sortProducts", () => {
  it("sorts price low to high", () => {
    expect(sortProducts(sample, "price-asc").map((p) => p.id)).toEqual(["2", "3", "1"]);
  });

  it("sorts price high to low", () => {
    expect(sortProducts(sample, "price-desc").map((p) => p.id)).toEqual(["1", "3", "2"]);
  });

  it("sorts by rating descending", () => {
    expect(sortProducts(sample, "rating").map((p) => p.id)).toEqual(["2", "1", "3"]);
  });

  it("sorts bestselling first (tagged Bestseller)", () => {
    expect(sortProducts(sample, "bestselling")[0].id).toBe("2");
  });

  it("does not mutate the input array", () => {
    const copy = [...sample];
    sortProducts(sample, "price-asc");
    expect(sample).toEqual(copy);
  });
});
