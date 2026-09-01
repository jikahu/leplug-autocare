// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { useWishlistStore } from "./wishlist";

describe("useWishlistStore", () => {
  beforeEach(() => {
    useWishlistStore.setState({ productIds: [] });
    localStorage.clear();
  });

  it("adds a product on toggle when not present", () => {
    useWishlistStore.getState().toggle("p1");
    expect(useWishlistStore.getState().productIds).toEqual(["p1"]);
  });

  it("removes a product on toggle when already present", () => {
    useWishlistStore.getState().toggle("p1");
    useWishlistStore.getState().toggle("p1");
    expect(useWishlistStore.getState().productIds).toEqual([]);
  });

  it("reports wishlisted state correctly", () => {
    useWishlistStore.getState().toggle("p1");
    expect(useWishlistStore.getState().isWishlisted("p1")).toBe(true);
    expect(useWishlistStore.getState().isWishlisted("p2")).toBe(false);
  });

  it("clears all products", () => {
    useWishlistStore.getState().toggle("p1");
    useWishlistStore.getState().toggle("p2");
    useWishlistStore.getState().clear();
    expect(useWishlistStore.getState().productIds).toEqual([]);
  });

  it("persists to localStorage under the leplug-wishlist key", () => {
    useWishlistStore.getState().toggle("p1");
    const raw = localStorage.getItem("leplug-wishlist");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).state.productIds).toEqual(["p1"]);
  });
});
