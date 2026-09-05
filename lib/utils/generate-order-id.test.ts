import { describe, it, expect } from "vitest";
import { generateOrderId } from "./generate-order-id";

describe("generateOrderId", () => {
  it("starts with ORD- followed by uppercase alphanumeric characters", () => {
    expect(generateOrderId()).toMatch(/^ORD-[0-9A-Z]+$/);
  });

  it("is at least 8 characters after the prefix", () => {
    const id = generateOrderId();
    expect(id.replace("ORD-", "").length).toBeGreaterThanOrEqual(8);
  });
});
