import { describe, expect, it } from "vitest";
import {
  convertPrice,
  formatDate,
  formatDaysOnSite,
  formatEngineVolume,
  formatMemberSince,
  formatMileageKm,
  formatNumber,
  formatPhone,
  formatPrice,
  percentChange,
  pluralRu,
} from "./format";

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

describe("formatDaysOnSite", () => {
  const now = new Date("2026-11-11T12:00:00Z");
  const ago = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000);

  it("is null for an unpublished listing", () => {
    expect(formatDaysOnSite(null, now)).toBeNull();
  });

  it.each([
    [0, "опубликовано сегодня"],
    [23, "опубликовано сегодня"],
    [24, "на сайте 1 день"],
    [24 * 3, "на сайте 3 дня"],
    [24 * 11, "на сайте 11 дней"],
    [24 * 21 + 5, "на сайте 21 день"],
  ])("%i h ago → %s", (hours, expected) => {
    expect(formatDaysOnSite(ago(hours), now)).toBe(expected);
  });

  it("treats a future date as today", () => {
    expect(formatDaysOnSite(ago(-5), now)).toBe("опубликовано сегодня");
  });

  it("groups large numbers", () => {
    expect(n(formatDaysOnSite(ago(24 * 1200), now) ?? "")).toBe("на сайте 1 200 дней");
  });
});

describe("formatDate", () => {
  const now = new Date("2026-11-11T12:00:00Z");
  it("omits the current year, uses genitive month", () => {
    expect(n(formatDate(new Date("2026-10-30T10:00:00Z"), now))).toBe("30 октября");
  });
  it("keeps another year", () => {
    expect(n(formatDate(new Date("2025-03-01T10:00:00Z"), now))).toBe("1 марта 2025");
  });
  it("counts the day in Bishkek time (UTC+6)", () => {
    expect(n(formatDate(new Date("2026-10-30T19:00:00Z"), now))).toBe("31 октября");
  });
});

describe("formatMemberSince", () => {
  it("is a whole phrase with genitive month", () => {
    expect(formatMemberSince(new Date("2026-03-15T00:00:00Z"))).toBe("На сайте с марта 2026");
  });
});

describe("formatPhone", () => {
  it("groups a KG number", () => {
    expect(n(formatPhone("+996555123456"))).toBe("+996 555 123 456");
  });
  it("leaves other numbers as is", () => {
    expect(formatPhone("+79991234567")).toBe("+79991234567");
  });
});

describe("percentChange", () => {
  it("rounds to whole percent, keeps the sign", () => {
    expect(percentChange(15500, 16500)).toBe(-6);
    expect(percentChange(16500, 15500)).toBe(6);
    expect(percentChange(100, 100)).toBe(0);
  });
  it("rejects a non-positive base", () => {
    expect(() => percentChange(1, 0)).toThrow(RangeError);
  });
});

describe("formatEngineVolume", () => {
  it("rounds to one decimal, keeps unknown as null", () => {
    expect(n(formatEngineVolume(2487) ?? "")).toBe("2.5 л");
    expect(formatEngineVolume(null)).toBeNull();
  });
});
