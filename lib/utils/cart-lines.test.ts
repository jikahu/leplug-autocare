import { describe, it, expect } from "vitest";
import { getCartLines, getCartSubtotal } from "./cart-lines";
import type { CartItem, Product } from "@/lib/types";

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

describe("getCartLines", () => {
  it("joins a cart item to its product and computes the line total", () => {
    const products = [sampleProduct({ id: "p1", price: 1500 })];
    const items: CartItem[] = [{ productId: "p1", quantity: 3 }];

    const lines = getCartLines(items, products);

    expect(lines).toEqual([
      { productId: "p1", product: products[0], quantity: 3, lineTotal: 4500 },
    ]);
  });

  it("preserves cart item order across multiple lines", () => {
    const products = [
      sampleProduct({ id: "p1", price: 1000 }),
      sampleProduct({ id: "p2", price: 2000 }),
    ];
    const items: CartItem[] = [
      { productId: "p2", quantity: 1 },
      { productId: "p1", quantity: 1 },
    ];

    const lines = getCartLines(items, products);

    expect(lines.map((line) => line.productId)).toEqual(["p2", "p1"]);
  });

  it("skips a cart item whose product no longer exists in the catalog", () => {
    const products = [sampleProduct({ id: "p1", price: 1000 })];
    const items: CartItem[] = [
      { productId: "p1", quantity: 1 },
      { productId: "discontinued", quantity: 1 },
    ];

    const lines = getCartLines(items, products);

    expect(lines).toHaveLength(1);
    expect(lines[0].productId).toBe("p1");
  });

  it("returns an empty array for an empty cart", () => {
    expect(getCartLines([], [sampleProduct({ id: "p1" })])).toEqual([]);
  });
});

describe("getCartSubtotal", () => {
  it("sums line totals across multiple lines", () => {
    const products = [
      sampleProduct({ id: "p1", price: 1000 }),
      sampleProduct({ id: "p2", price: 2500 }),
    ];
    const items: CartItem[] = [
      { productId: "p1", quantity: 2 },
      { productId: "p2", quantity: 1 },
    ];

    const subtotal = getCartSubtotal(getCartLines(items, products));

    expect(subtotal).toBe(4500);
  });

  it("returns 0 for no lines", () => {
    expect(getCartSubtotal([])).toBe(0);
  });
});
