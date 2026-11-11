import { describe, expect, it } from "vitest";
import { allMakesHref, COLLECTIONS, collectionHref, makeHref } from "./collections";
import { parseCatalogQuery } from "./search-params";

const query = (href: string) =>
  parseCatalogQuery(Object.fromEntries(new URL(href, "http://x").searchParams));

describe("collections", () => {
  it("has the eight home tiles with unique ids", () => {
    expect(COLLECTIONS.map((c) => c.label)).toEqual([
      "Седаны",
      "Кроссоверы",
      "Минивэны",
      "Электро и гибриды",
      "Из Кореи",
      "Из Китая",
      "В пути",
      "Ниже рынка",
    ]);
    expect(new Set(COLLECTIONS.map((c) => c.id)).size).toBe(COLLECTIONS.length);
  });

  it("every tile survives the URL round trip with its filters and city", () => {
    for (const c of COLLECTIONS) {
      const f = query(collectionHref(c, "Ош")).filters;
      expect(f.city).toBe("Ош");
      for (const [key, value] of Object.entries(c.filters)) {
        expect(f[key as keyof typeof f]).toEqual(value);
      }
    }
  });

  it("whole country leaves the city out", () => {
    const sedans = COLLECTIONS.find((c) => c.id === "sedan");
    if (!sedans) throw new Error("sedan tile");
    expect(collectionHref(sedans, null)).toBe("/cars?body=sedan");
  });

  it("make link", () => {
    expect(makeHref("toyota", "Бишкек")).toBe(
      `/cars?make=toyota&city=${encodeURIComponent("Бишкек")}`,
    );
  });
});

describe("allMakesHref", () => {
  it("opens the make picker, keeps the city", () => {
    expect(allMakesHref(null)).toBe("/cars?pick=make");
    expect(allMakesHref("Ош")).toBe(`/cars?city=${encodeURIComponent("Ош")}&pick=make`);
  });
});
