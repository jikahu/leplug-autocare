import { describe, it, expect, beforeEach } from "vitest";
import { useCartDrawerStore } from "./cart-drawer";

describe("useCartDrawerStore", () => {
  beforeEach(() => {
    useCartDrawerStore.setState({ isOpen: false });
  });

  it("starts closed", () => {
    expect(useCartDrawerStore.getState().isOpen).toBe(false);
  });

  it("opens", () => {
    useCartDrawerStore.getState().open();
    expect(useCartDrawerStore.getState().isOpen).toBe(true);
  });

  it("closes", () => {
    useCartDrawerStore.getState().open();
    useCartDrawerStore.getState().close();
    expect(useCartDrawerStore.getState().isOpen).toBe(false);
  });
});
