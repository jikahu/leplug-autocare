// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { useOrderStore } from "./orders";
import type { Order } from "@/lib/types";

function sampleOrder(overrides: Partial<Order>): Order {
  return {
    id: "ORD-SAMPLE",
    userId: "guest",
    items: [{ productId: "p1", quantity: 1 }],
    total: 1000,
    deliveryFee: 300,
    status: "processing",
    placedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("useOrderStore", () => {
  beforeEach(() => {
    useOrderStore.setState({ orders: [] });
    localStorage.clear();
  });

  it("starts with no orders", () => {
    expect(useOrderStore.getState().orders).toEqual([]);
  });

  it("adds a placed order", () => {
    const order = sampleOrder({ id: "ORD-1" });
    useOrderStore.getState().placeOrder(order);
    expect(useOrderStore.getState().orders).toEqual([order]);
  });

  it("keeps newest orders first", () => {
    useOrderStore.getState().placeOrder(sampleOrder({ id: "ORD-1" }));
    useOrderStore.getState().placeOrder(sampleOrder({ id: "ORD-2" }));
    expect(useOrderStore.getState().orders.map((o) => o.id)).toEqual(["ORD-2", "ORD-1"]);
  });

  it("persists orders to localStorage under the leplug-orders key", () => {
    const order = sampleOrder({ id: "ORD-1" });
    useOrderStore.getState().placeOrder(order);
    const raw = localStorage.getItem("leplug-orders");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!).state.orders).toEqual([order]);
  });
});
