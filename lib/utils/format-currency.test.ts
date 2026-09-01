import { describe, it, expect } from "vitest";
import { formatCurrency } from "./format-currency";

describe("formatCurrency", () => {
  it("formats whole numbers with KSh prefix and thousands separators", () => {
    expect(formatCurrency(4500)).toBe("KSh 4,500");
  });

  it("formats numbers under 1000 without a separator", () => {
    expect(formatCurrency(850)).toBe("KSh 850");
  });

  it("rounds fractional KES to the nearest whole shilling", () => {
    expect(formatCurrency(1299.6)).toBe("KSh 1,300");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("KSh 0");
  });
});
