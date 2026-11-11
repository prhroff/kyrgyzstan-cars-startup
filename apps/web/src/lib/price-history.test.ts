import { describe, expect, it } from "vitest";
import type { PricePoint } from "@/data/types";
import { buildStepChart } from "./price-history";

const box = { width: 120, height: 40, pad: 10 };
const at = (day: number) => new Date(Date.UTC(2026, 10, day));
const p = (day: number, usd: number): PricePoint => ({
  priceAmount: usd,
  currency: "USD",
  priceUsd: usd,
  observedAt: at(day),
});

describe("buildStepChart", () => {
  it("needs at least two points", () => {
    expect(buildStepChart([], at(10), box)).toBeNull();
    expect(buildStepChart([p(1, 100)], at(10), box)).toBeNull();
  });

  it("draws steps from the first point to now, higher price on top", () => {
    const chart = buildStepChart([p(1, 200), p(6, 100)], at(11), box);
    expect(chart?.dots).toEqual([
      { x: 10, y: 10 },
      { x: 60, y: 30 },
    ]);
    expect(chart?.path).toBe("M10 10 H60 V30 H110");
  });

  it("puts a flat history in the middle", () => {
    const chart = buildStepChart([p(1, 100), p(3, 100)], at(5), box);
    expect(chart?.dots.every((d) => d.y === 20)).toBe(true);
  });

  it("does not run past the last point when now is earlier (clock skew)", () => {
    const chart = buildStepChart([p(1, 200), p(6, 100)], at(3), box);
    expect(chart?.path.endsWith("H110")).toBe(true);
  });
});
