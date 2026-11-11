import { describe, expect, it } from "vitest";
import { convertPrice, formatMileageKm, formatNumber, formatPrice, pluralRu } from "./format";

const n = (s: string) => s.replaceAll(String.fromCodePoint(0xa0), " ");

describe("formatNumber", () => {
  it("groups thousands with NBSP", () => {
    expect(n(formatNumber(1350000))).toBe("1 350 000");
    expect(n(formatNumber(15500))).toBe("15 500");
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(0)).toBe("0");
    expect(n(formatNumber(-12000))).toBe("-12 000");
  });

  it("uses a non-breaking space", () => {
    expect(formatNumber(1000)).toBe(`1${String.fromCodePoint(0xa0)}000`);
  });

  it("rejects non-finite numbers", () => {
    expect(() => formatNumber(Number.NaN)).toThrow(RangeError);
  });
});

describe("formatPrice", () => {
  it("formats USD and KGS the Russian way", () => {
    expect(n(formatPrice(15500, "USD"))).toBe("15 500 $");
    expect(n(formatPrice(1350000, "KGS"))).toBe("1 350 000 сом");
  });
});

describe("convertPrice", () => {
  it("USD → KGS rounds to thousands", () => {
    expect(convertPrice(15500, "USD", "KGS", 87.45)).toBe(1355000);
  });

  it("KGS → USD rounds to whole dollars", () => {
    expect(convertPrice(1350000, "KGS", "USD", 87.45)).toBe(15437);
  });

  it("same currency is identity", () => {
    expect(convertPrice(123, "USD", "USD", 87.45)).toBe(123);
  });

  it("rejects a bad rate", () => {
    expect(() => convertPrice(1, "USD", "KGS", 0)).toThrow(RangeError);
    expect(() => convertPrice(1, "USD", "KGS", Number.NaN)).toThrow(RangeError);
  });
});

describe("formatMileageKm", () => {
  it("formats km and keeps unknown as null", () => {
    expect(n(formatMileageKm(86000) ?? "")).toBe("86 000 км");
    expect(formatMileageKm(null)).toBeNull();
  });
});

describe("pluralRu", () => {
  const forms = ["объявление", "объявления", "объявлений"] as const;
  it.each([
    [0, "объявлений"],
    [1, "объявление"],
    [2, "объявления"],
    [5, "объявлений"],
    [11, "объявлений"],
    [14, "объявлений"],
    [21, "объявление"],
    [104, "объявления"],
    [111, "объявлений"],
    [1001, "объявление"],
  ])("%i → %s", (n, expected) => {
    expect(pluralRu(n, forms)).toBe(expected);
  });
});
