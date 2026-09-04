import { describe, it, expect } from "vitest";
import { parseShopSearchParams } from "./parse-shop-search-params";

describe("parseShopSearchParams", () => {
  it("returns an empty object for empty input", () => {
    expect(parseShopSearchParams({})).toEqual({});
  });

  it("passes through single string values for known keys", () => {
    expect(parseShopSearchParams({ category: "exterior", sort: "price-asc" })).toEqual({
      category: "exterior",
      sort: "price-asc",
    });
  });

  it("parses the search query param", () => {
    expect(parseShopSearchParams({ q: "brake pads" })).toEqual({ q: "brake pads" });
  });

  it("ignores unknown keys", () => {
    expect(parseShopSearchParams({ category: "exterior", utm_source: "google" })).toEqual({
      category: "exterior",
    });
  });

  it("takes the first value when a key is repeated in the URL", () => {
    expect(parseShopSearchParams({ brand: ["ShineWorks", "StopSure"] })).toEqual({
      brand: "ShineWorks",
    });
  });

  it("drops empty string values", () => {
    expect(parseShopSearchParams({ category: "" })).toEqual({});
  });
});
