import { describe, expect, it } from "vitest";
import { createRng, DEV_NOW, EDGE_CASE_LISTINGS, MAKE_OPTIONS, makeListings } from "./fixtures";

describe("fixtures", () => {
  it("is deterministic for a seed", () => {
    expect(makeListings(20, 7)).toEqual(makeListings(20, 7));
    expect(makeListings(20, 7)).not.toEqual(makeListings(20, 8));
  });

  it("rng stays in [0, 1)", () => {
    const rng = createRng(1);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("produces integer prices and consistent currencies", () => {
    for (const l of [...makeListings(200), ...EDGE_CASE_LISTINGS]) {
      expect(Number.isInteger(l.priceAmount)).toBe(true);
      expect(Number.isInteger(l.priceUsd)).toBe(true);
      expect(l.priceUsd).toBeGreaterThan(0);
      if (l.currency === "USD") expect(l.priceAmount).toBe(l.priceUsd);
      if (l.mileageKm !== null) expect(Number.isInteger(l.mileageKm)).toBe(true);
    }
  });

  it("in-transit cars are never marked as customs-cleared", () => {
    for (const l of makeListings(200)) {
      if (l.availability === "in_transit") expect(l.customsCleared).toBe(false);
    }
  });

  it("covers the variety the UI must handle", () => {
    const all = makeListings(200);
    expect(new Set(all.map((l) => l.currency))).toEqual(new Set(["USD", "KGS"]));
    expect(new Set(all.map((l) => l.availability))).toEqual(new Set(["in_stock", "in_transit"]));
    expect(all.some((l) => l.photos.length === 0)).toBe(true);
    expect(all.some((l) => l.city === null)).toBe(true);
    expect(all.some((l) => l.market === null)).toBe(true);
    for (const origin of ["korea", "usa", "china"]) {
      expect(all.some((l) => l.vehicle.originCountry === origin)).toBe(true);
    }
  });

  it("photos are local neutral placeholders only", () => {
    for (const l of [...makeListings(100), ...EDGE_CASE_LISTINGS]) {
      for (const p of l.photos) expect(p.url).toMatch(/^\/placeholders\/car-[1-4]\.svg$/);
    }
  });

  it("make options have unique ids and at least one model", () => {
    const ids = MAKE_OPTIONS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const m of MAKE_OPTIONS) expect(m.models.length).toBeGreaterThan(0);
  });
});

describe("fixture consistency", () => {
  it("EVs have no engine volume, combustion cars do", () => {
    for (const l of makeListings(200)) {
      if (l.vehicle.fuelType === "electric") expect(l.vehicle.engineVolumeCc).toBeNull();
      else expect(l.vehicle.engineVolumeCc).toBeGreaterThan(0);
    }
  });

  it("a hybrid trim name never comes with a non-hybrid fuel", () => {
    for (const l of makeListings(300)) {
      if (l.trim?.includes("Hybrid")) expect(l.vehicle.fuelType).toBe("hybrid");
    }
  });
});

describe("fixture sellers", () => {
  it("covers private sellers, dealers and importers", () => {
    const types = new Set(makeListings(200).map((l) => l.seller.type));
    expect(types).toEqual(new Set(["private", "dealer", "importer"]));
  });

  it("published within the 30-day auto-removal window, never in the future", () => {
    const month = 30 * 24 * 60 * 60 * 1000;
    for (const l of [...makeListings(200), ...EDGE_CASE_LISTINGS]) {
      if (l.publishedAt === null) continue;
      const age = DEV_NOW.getTime() - l.publishedAt.getTime();
      expect(age).toBeGreaterThanOrEqual(0);
      expect(age).toBeLessThan(month);
    }
  });
});
