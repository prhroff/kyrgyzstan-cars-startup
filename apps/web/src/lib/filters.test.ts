import { describe, expect, it } from "vitest";
import { countActiveFilters, EMPTY_FILTERS, isInvalidRange, parseIntegerInput } from "./filters";

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
