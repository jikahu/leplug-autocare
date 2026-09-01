import { describe, it, expect } from "vitest";
import { deliveryFee } from "./delivery-fee";

describe("deliveryFee", () => {
  it("charges KSh 300 for Nairobi Metro under the free threshold", () => {
    expect(deliveryFee("nairobi_metro", 2000)).toBe(300);
  });

  it("charges KSh 600 for Outside Nairobi under the free threshold", () => {
    expect(deliveryFee("outside_nairobi", 2000)).toBe(600);
  });

  it("is free for Nairobi Metro at exactly the KSh 5,000 threshold", () => {
    expect(deliveryFee("nairobi_metro", 5000)).toBe(0);
  });

  it("is free for Outside Nairobi above the KSh 5,000 threshold", () => {
    expect(deliveryFee("outside_nairobi", 7500)).toBe(0);
  });
});
