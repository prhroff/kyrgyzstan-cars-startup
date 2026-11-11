import { describe, expect, it } from "vitest";
import { normalizeMileage } from "./mileage.js";

describe("normalizeMileage", () => {
  it("keeps kilometres as is", () => {
    expect(normalizeMileage(120_000, "km")).toBe(120_000);
  });

  it("converts miles to whole kilometres", () => {
    expect(normalizeMileage(1, "mi")).toBe(2);
    expect(normalizeMileage(100_000, "mi")).toBe(160_934);
    expect(normalizeMileage(62_137, "mi")).toBe(100_000);
  });

  it("rounds fractional input", () => {
    expect(normalizeMileage(1234.6, "km")).toBe(1235);
  });

  it("accepts zero (new cars)", () => {
    expect(normalizeMileage(0, "mi")).toBe(0);
  });

  it.each([[-1], [Number.NaN], [Number.POSITIVE_INFINITY]])("rejects %s", (value) => {
    expect(normalizeMileage(value, "km")).toBeNull();
  });
});
