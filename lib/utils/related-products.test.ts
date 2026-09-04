import { describe, it, expect } from "vitest";
import { getRelatedProducts } from "./related-products";
import type { Product } from "@/lib/types";

function sampleProduct(overrides: Partial<Product>): Product {
  return {
    id: "sample",
    slug: "sample",
    sku: "SKU-SAMPLE",
    name: "Sample Product",
    category: "exterior",
    price: 1000,
    images: [],
    description: "",
    keyFeatures: [],
    stock: "in_stock",
    ...overrides,
  };
}

describe("getRelatedProducts", () => {
  it("excludes the product itself", () => {
    const product = sampleProduct({ id: "p1", category: "exterior" });
    const all = [product, sampleProduct({ id: "p2", category: "exterior" })];
    const related = getRelatedProducts(product, all);
    expect(related.some((p) => p.id === "p1")).toBe(false);
  });

  it("ranks a same-subcategory match above a same-category-only match", () => {
    const product = sampleProduct({ id: "p1", category: "exterior", subcategory: "lighting" });
    const sameSubcategory = sampleProduct({ id: "p2", category: "exterior", subcategory: "lighting" });
    const sameCategoryOnly = sampleProduct({ id: "p3", category: "exterior", subcategory: "wipers" });
    const related = getRelatedProducts(product, [product, sameCategoryOnly, sameSubcategory]);
    expect(related[0].id).toBe("p2");
  });

  it("includes products that only share a compatible make", () => {
    const product = sampleProduct({ id: "p1", category: "exterior", compatibleMakes: ["Toyota"] });
    const sharesMake = sampleProduct({ id: "p2", category: "interior", compatibleMakes: ["Toyota"] });
    const noOverlap = sampleProduct({ id: "p3", category: "interior", compatibleMakes: ["Ford"] });
    const related = getRelatedProducts(product, [product, sharesMake, noOverlap]);
    expect(related.some((p) => p.id === "p2")).toBe(true);
    expect(related.some((p) => p.id === "p3")).toBe(false);
  });

  it("defaults to at most 4 related products", () => {
    const product = sampleProduct({ id: "p1", category: "exterior" });
    const others = Array.from({ length: 10 }, (_, i) => sampleProduct({ id: `p${i + 2}`, category: "exterior" }));
    const related = getRelatedProducts(product, [product, ...others]);
    expect(related).toHaveLength(4);
  });

  it("respects a custom limit", () => {
    const product = sampleProduct({ id: "p1", category: "exterior" });
    const others = Array.from({ length: 10 }, (_, i) => sampleProduct({ id: `p${i + 2}`, category: "exterior" }));
    const related = getRelatedProducts(product, [product, ...others], 2);
    expect(related).toHaveLength(2);
  });

  it("returns an empty array when nothing shares category, subcategory, or make", () => {
    const product = sampleProduct({ id: "p1", category: "exterior" });
    const unrelated = sampleProduct({ id: "p2", category: "interior" });
    const related = getRelatedProducts(product, [product, unrelated]);
    expect(related).toHaveLength(0);
  });
});
