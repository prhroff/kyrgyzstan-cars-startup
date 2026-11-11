import { describe, expect, it } from "vitest";
import { isValidVehicleYear, maxVehicleYear, MIN_VEHICLE_YEAR } from "./year.js";

const NOW = new Date("2026-11-11T12:00:00Z");

describe("vehicle year range", () => {
  it("lower bound is 1950", () => {
    expect(MIN_VEHICLE_YEAR).toBe(1950);
  });

  it("upper bound is next calendar year (UTC)", () => {
    expect(maxVehicleYear(NOW)).toBe(2027);
    expect(maxVehicleYear(new Date("2026-12-31T23:30:00Z"))).toBe(2027);
    expect(maxVehicleYear(new Date("2027-01-01T00:00:00Z"))).toBe(2028);
  });

  it.each([1950, 2000, 2026, 2027])("accepts %i", (year) => {
    expect(isValidVehicleYear(year, NOW)).toBe(true);
  });

  it.each([1949, 2028, 2026.5, Number.NaN])("rejects %s", (year) => {
    expect(isValidVehicleYear(year, NOW)).toBe(false);
  });
});
