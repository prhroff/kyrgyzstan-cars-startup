import { describe, expect, it } from "vitest";
import { wrapIndex } from "./Gallery";

describe("wrapIndex", () => {
  it("moves and wraps around both ends", () => {
    expect(wrapIndex(0, 1, 3)).toBe(1);
    expect(wrapIndex(2, 1, 3)).toBe(0);
    expect(wrapIndex(0, -1, 3)).toBe(2);
    expect(wrapIndex(1, -4, 3)).toBe(0);
  });

  it("is 0 for an empty list", () => {
    expect(wrapIndex(0, 1, 0)).toBe(0);
  });
});
