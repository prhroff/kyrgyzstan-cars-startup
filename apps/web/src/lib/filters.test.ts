import { FUEL_TYPES } from "@repo/core";
import { describe, expect, it } from "vitest";
import {
  countActiveFilters,
  EMPTY_FILTERS,
  FUEL_GROUPS,
  fuelGroupState,
  HYBRID_SUBTYPE_LABELS,
  isInvalidRange,
  parseIntegerInput,
  toggleFuelGroup,
  toggleFuelType,
} from "./filters";

describe("parseIntegerInput", () => {
  it("parses digits with spaces and NBSP", () => {
    expect(parseIntegerInput("15500")).toBe(15500);
    expect(parseIntegerInput(" 15 500 ")).toBe(15500);
    expect(
      parseIntegerInput(`1${String.fromCodePoint(0xa0)}350${String.fromCodePoint(0xa0)}000`),
    ).toBe(1350000);
  });

  it("returns null for empty, negative, fractional and junk", () => {
    expect(parseIntegerInput("")).toBeNull();
    expect(parseIntegerInput("-5")).toBeNull();
    expect(parseIntegerInput("1.5")).toBeNull();
    expect(parseIntegerInput("abc")).toBeNull();
    expect(parseIntegerInput("99999999999999999999")).toBeNull();
  });
});

describe("isInvalidRange", () => {
  it("flags only from > to with both set", () => {
    expect(isInvalidRange(2020, 2018)).toBe(true);
    expect(isInvalidRange(2018, 2020)).toBe(false);
    expect(isInvalidRange(2020, 2020)).toBe(false);
    expect(isInvalidRange(null, 2018)).toBe(false);
    expect(isInvalidRange(2020, null)).toBe(false);
  });
});

describe("countActiveFilters", () => {
  it("is 0 for empty filters", () => {
    expect(countActiveFilters(EMPTY_FILTERS)).toBe(0);
  });

  it("counts groups, not individual values", () => {
    expect(
      countActiveFilters({
        ...EMPTY_FILTERS,
        make: "toyota",
        yearFrom: 2018,
        yearTo: 2022,
        fuel: ["petrol", "hybrid"],
      }),
    ).toBe(3);
  });
});

describe("fuel groups", () => {
  const hybrid = FUEL_GROUPS.find((g) => g.id === "hybrid");
  const gas = FUEL_GROUPS.find((g) => g.id === "gas");
  if (!hybrid || !gas) throw new Error("groups");

  it("cover every fuel type exactly once", () => {
    const all = FUEL_GROUPS.flatMap((g) => [...g.types]);
    expect([...all].sort()).toEqual([...FUEL_TYPES].sort());
  });

  it("group state: none / some / all", () => {
    expect(fuelGroupState([], hybrid)).toBe("none");
    expect(fuelGroupState(["erev"], hybrid)).toBe("some");
    expect(fuelGroupState(["hybrid", "plug_in_hybrid", "erev"], hybrid)).toBe("all");
  });

  it("toggling a group selects all of it, or clears a partial selection", () => {
    expect(toggleFuelGroup(["petrol"], gas)).toEqual(["petrol", "lpg", "petrol_lpg"]);
    expect(toggleFuelGroup(["petrol", "erev"], hybrid)).toEqual(["petrol"]);
  });

  it("toggling one subtype keeps enum order", () => {
    expect(toggleFuelType(["erev"], "hybrid")).toEqual(["hybrid", "erev"]);
    expect(toggleFuelType(["hybrid", "erev"], "hybrid")).toEqual(["erev"]);
  });

  it("every hybrid subtype has a plain label", () => {
    for (const t of hybrid.types) expect(HYBRID_SUBTYPE_LABELS[t]).toBeTruthy();
  });
});
