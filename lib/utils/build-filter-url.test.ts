import { describe, it, expect } from "vitest";
import { buildFilterHref } from "./build-filter-url";

describe("buildFilterHref", () => {
  it("returns the base path when there are no active filters", () => {
    expect(buildFilterHref("/shop", {}, {})).toBe("/shop");
  });

  it("adds a single filter as a query param", () => {
    expect(buildFilterHref("/shop", {}, { category: "exterior" })).toBe("/shop?category=exterior");
  });

  it("preserves existing filters not being updated", () => {
    expect(
      buildFilterHref("/shop", { category: "exterior", brand: "ShineWorks" }, { sort: "price-asc" })
    ).toBe("/shop?category=exterior&brand=ShineWorks&sort=price-asc");
  });

  it("overwrites an existing filter with a new value", () => {
    expect(buildFilterHref("/shop", { category: "exterior" }, { category: "interior" })).toBe(
      "/shop?category=interior"
    );
  });

  it("removes a filter when the update sets it to undefined", () => {
    expect(
      buildFilterHref("/shop", { category: "exterior", brand: "ShineWorks" }, { category: undefined })
    ).toBe("/shop?brand=ShineWorks");
  });

  it("always orders params the same way regardless of insertion order", () => {
    expect(buildFilterHref("/shop", { sort: "newest", category: "exterior" }, {})).toBe(
      "/shop?category=exterior&sort=newest"
    );
  });

  it("keeps the search query (q) ordered first", () => {
    expect(buildFilterHref("/search", { q: "brake pads" }, { sort: "price-asc" })).toBe(
      "/search?q=brake%20pads&sort=price-asc"
    );
  });

  it("URL-encodes param values", () => {
    expect(buildFilterHref("/shop", {}, { brand: "A&W Parts" })).toBe("/shop?brand=A%26W%20Parts");
  });
});
