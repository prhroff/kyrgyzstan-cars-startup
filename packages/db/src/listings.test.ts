import { describe, expect, it } from "vitest";
import { toPriceUsd } from "./exchange-rates.js";
import { deriveListingSearchFields } from "./listings.js";
import type { DeriveInput } from "./listings.js";

const base: DeriveInput = {
  vehicle: { makeId: 1, modelId: 10, year: 2018 },
  priceAmount: 15_500,
  currency: "USD",
  mileageValue: 100_000,
  mileageUnit: "mi",
  usdKgsRate: 87.5,
};

describe("deriveListingSearchFields", () => {
  it("copies vehicle fields and normalizes mileage", () => {
    expect(deriveListingSearchFields(base)).toEqual({
      makeId: 1,
      modelId: 10,
      year: 2018,
      mileageKm: 160_934,
      priceUsd: 15_500,
    });
  });

  it("converts KGS prices to whole USD", () => {
    expect(
      deriveListingSearchFields({ ...base, priceAmount: 1_312_500, currency: "KGS" }).priceUsd,
    ).toBe(15_000);
  });

  it("allows unknown mileage", () => {
    expect(
      deriveListingSearchFields({ ...base, mileageValue: null, mileageUnit: null }).mileageKm,
    ).toBeNull();
  });

  it("rejects half-specified mileage", () => {
    expect(() => deriveListingSearchFields({ ...base, mileageUnit: null })).toThrow(RangeError);
  });

  it.each([[0], [-1], [15.5]])("rejects price %s", (priceAmount) => {
    expect(() => deriveListingSearchFields({ ...base, priceAmount })).toThrow(RangeError);
  });
});

describe("toPriceUsd", () => {
  it("never rounds a positive price down to 0", () => {
    expect(toPriceUsd(10, "KGS", 87.5)).toBe(1);
  });

  it("rejects a non-positive rate for KGS", () => {
    expect(() => toPriceUsd(1000, "KGS", 0)).toThrow(RangeError);
  });

  it("ignores the rate for USD", () => {
    expect(toPriceUsd(1000, "USD", Number.NaN)).toBe(1000);
  });
});
