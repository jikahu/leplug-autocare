import { describe, it, expect } from "vitest";
import { getStarCounts } from "./star-rating";

describe("getStarCounts", () => {
  it("returns all full stars for a perfect rating", () => {
    expect(getStarCounts(5)).toEqual({ full: 5, half: false, empty: 0 });
  });

  it("returns a half star for a .5 rating", () => {
    expect(getStarCounts(4.5)).toEqual({ full: 4, half: true, empty: 0 });
  });

  it("rounds down to the nearest half star", () => {
    expect(getStarCounts(4.1)).toEqual({ full: 4, half: false, empty: 1 });
  });

  it("rounds up to the nearest half star", () => {
    expect(getStarCounts(4.3)).toEqual({ full: 4, half: true, empty: 0 });
  });

  it("returns all empty stars for a zero rating", () => {
    expect(getStarCounts(0)).toEqual({ full: 0, half: false, empty: 5 });
  });

  it("clamps ratings above 5", () => {
    expect(getStarCounts(6)).toEqual({ full: 5, half: false, empty: 0 });
  });
});
