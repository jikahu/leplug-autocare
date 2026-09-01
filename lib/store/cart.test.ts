// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "./cart";

describe("useCartStore", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
    localStorage.clear();
  });

  it("adds a new item", () => {
    useCartStore.getState().addItem("p1", 2);
    expect(useCartStore.getState().items).toEqual([{ productId: "p1", quantity: 2 }]);
  });

  it("increments quantity when adding an existing item again", () => {
    useCartStore.getState().addItem("p1", 1);
    useCartStore.getState().addItem("p1", 2);
    expect(useCartStore.getState().items).toEqual([{ productId: "p1", quantity: 3 }]);
  });

  it("defaults quantity to 1 when not specified", () => {
    useCartStore.getState().addItem("p1");
    expect(useCartStore.getState().items).toEqual([{ productId: "p1", quantity: 1 }]);
  });

  it("removes an item", () => {
    useCartStore.getState().addItem("p1", 1);
    useCartStore.getState().removeItem("p1");
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("updates quantity", () => {
    useCartStore.getState().addItem("p1", 1);
    useCartStore.getState().updateQuantity("p1", 5);
    expect(useCartStore.getState().items).toEqual([{ productId: "p1", quantity: 5 }]);
  });

  it("removes the item when quantity is updated to zero", () => {
    useCartStore.getState().addItem("p1", 1);
    useCartStore.getState().updateQuantity("p1", 0);
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("clears all items", () => {
    useCartStore.getState().addItem("p1", 1);
    useCartStore.getState().addItem("p2", 1);
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("persists items to localStorage under the leplug-cart key", () => {
    useCartStore.getState().addItem("p1", 3);
    const raw = localStorage.getItem("leplug-cart");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).state.items).toEqual([{ productId: "p1", quantity: 3 }]);
  });
});
