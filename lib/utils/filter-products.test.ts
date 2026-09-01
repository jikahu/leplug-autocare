import { describe, it, expect } from "vitest";
import type { Product } from "@/lib/types";
import { filterProducts } from "./filter-products";

const sample: Product[] = [
  { id: "1", slug: "a", sku: "A1", name: "Brake Pads", category: "performance-service-parts", brand: "StopSure", price: 5000, images: [], description: "", keyFeatures: [], stock: "in_stock", compatibleMakes: ["Toyota"] },
  { id: "2", slug: "b", sku: "B1", name: "Seat Covers", category: "interior", brand: "LuxeFit", price: 12000, images: [], description: "", keyFeatures: [], stock: "in_stock", compatibleMakes: ["Subaru"] },
  { id: "3", slug: "c", sku: "C1", name: "Floor Mats", category: "interior", brand: "TerraGuard", price: 4000, images: [], description: "", keyFeatures: [], stock: "out_of_stock", compatibleMakes: ["Toyota"] },
];

describe("filterProducts", () => {
  it("filters by category", () => {
    expect(filterProducts(sample, { category: "interior" }).map((p) => p.id)).toEqual(["2", "3"]);
  });

  it("filters by brand", () => {
    expect(filterProducts(sample, { brand: "LuxeFit" }).map((p) => p.id)).toEqual(["2"]);
  });

  it("filters by vehicle make", () => {
    expect(filterProducts(sample, { make: "Toyota" }).map((p) => p.id)).toEqual(["1", "3"]);
  });

  it("filters by price range", () => {
    expect(filterProducts(sample, { minPrice: 4500, maxPrice: 12000 }).map((p) => p.id)).toEqual(["1", "2"]);
  });

  it("combines multiple filters with AND semantics", () => {
    expect(filterProducts(sample, { category: "interior", make: "Toyota" }).map((p) => p.id)).toEqual(["3"]);
  });

  it("returns all products when no filters are given", () => {
    expect(filterProducts(sample, {})).toHaveLength(3);
  });
});
