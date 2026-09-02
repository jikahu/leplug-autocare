import { describe, it, expect } from "vitest";
import { searchProducts } from "./search-products";
import type { Product } from "@/lib/types";

const PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "led-fog-light-kit",
    sku: "LP-EXT-001",
    name: "LED Fog Light Kit",
    category: "exterior",
    brand: "BrightBeam",
    price: 4500,
    images: [],
    description: "",
    keyFeatures: [],
    stock: "in_stock",
  },
  {
    id: "2",
    slug: "ceramic-brake-pads",
    sku: "LP-PER-001",
    name: "Ceramic Brake Pads",
    category: "performance-service-parts",
    brand: "StopSure",
    price: 5400,
    images: [],
    description: "",
    keyFeatures: [],
    stock: "in_stock",
  },
  {
    id: "3",
    slug: "car-shampoo",
    sku: "LP-CAR-001",
    name: "Premium Car Shampoo",
    category: "car-care-detailing",
    brand: "ShineWorks",
    price: 1200,
    images: [],
    description: "",
    keyFeatures: [],
    stock: "in_stock",
  },
];

describe("searchProducts", () => {
  it("matches by product name, case-insensitive", () => {
    expect(searchProducts(PRODUCTS, "fog light")).toEqual([PRODUCTS[0]]);
    expect(searchProducts(PRODUCTS, "FOG LIGHT")).toEqual([PRODUCTS[0]]);
  });

  it("matches by brand", () => {
    expect(searchProducts(PRODUCTS, "shineworks")).toEqual([PRODUCTS[2]]);
  });

  it("matches by category id", () => {
    expect(searchProducts(PRODUCTS, "performance")).toEqual([PRODUCTS[1]]);
  });

  it("returns an empty array for no matches", () => {
    expect(searchProducts(PRODUCTS, "xyz-nonexistent")).toEqual([]);
  });

  it("returns an empty array for a blank query", () => {
    expect(searchProducts(PRODUCTS, "   ")).toEqual([]);
  });

  it("trims surrounding whitespace from the query", () => {
    expect(searchProducts(PRODUCTS, "  shampoo  ")).toEqual([PRODUCTS[2]]);
  });
});
