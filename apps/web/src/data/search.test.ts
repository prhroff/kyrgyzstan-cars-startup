import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS } from "@/lib/filters";
import type { CarCardData } from "@/lib/listing-card";
import { makeListings } from "@/dev/fixtures";
import { makeOptions, modelId, search, slugify } from "./search";

const listings = makeListings(60, 3);

function at(i: number): CarCardData {
  const l = listings[i];
  if (!l) throw new Error(`no listing ${i}`);
  return l;
}

describe("slugify / modelId", () => {
  it("makes URL-safe ids", () => {
    expect(slugify("Mercedes-Benz")).toBe("mercedes-benz");
    expect(slugify("Li Auto")).toBe("li-auto");
    expect(modelId("BYD", "Song Plus")).toBe("byd:song-plus");
    expect(modelId("Mercedes-Benz", "E-Класс")).toBe("mercedes-benz:e-класс");
  });
});

describe("search", () => {
  it("no filters: everything, newest first, paged", () => {
    const r = search(listings, EMPTY_FILTERS, "fresh", 1, 10);
    expect(r.total).toBe(60);
    expect(r.pageCount).toBe(6);
    expect(r.items).toHaveLength(10);
    const times = r.items.map((l) => l.publishedAt?.getTime() ?? 0);
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  it("clamps the page into range", () => {
    expect(search(listings, EMPTY_FILTERS, "fresh", 99, 10).page).toBe(6);
    expect(search(listings, EMPTY_FILTERS, "fresh", 0, 10).page).toBe(1);
  });

  it("filters by make, price and fuel together", () => {
    const r = search(
      listings,
      { ...EMPTY_FILTERS, make: "toyota", priceTo: 30000, fuel: ["petrol", "hybrid"] },
      "price_asc",
      1,
      100,
    );
    for (const l of r.items) {
      expect(l.make).toBe("Toyota");
      expect(l.priceUsd).toBeLessThanOrEqual(30000);
      expect(["petrol", "hybrid"]).toContain(l.vehicle.fuelType);
    }
    const prices = r.items.map((l) => l.priceUsd);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it("unknown transmission does not match a transmission filter", () => {
    const l = { ...at(0), vehicle: { ...at(0).vehicle, transmission: null } };
    expect(search([l], { ...EMPTY_FILTERS, transmission: ["manual"] }, "fresh", 1).total).toBe(0);
  });

  it("unknown mileage goes last when sorting by mileage", () => {
    const known = { ...at(0), id: "a", mileageKm: 90_000 };
    const unknown = { ...at(1), id: "b", mileageKm: null };
    expect(
      search([unknown, known], EMPTY_FILTERS, "mileage_asc", 1).items.map((l) => l.id),
    ).toEqual(["a", "b"]);
  });

  it("empty result keeps one page", () => {
    const r = search(listings, { ...EMPTY_FILTERS, priceTo: 1 }, "fresh", 1);
    expect(r).toMatchObject({ total: 0, page: 1, pageCount: 1, items: [] });
  });
});

describe("makeOptions", () => {
  it("groups models under makes, sorted, no duplicates", () => {
    const opts = makeOptions(listings);
    const labels = opts.map((o) => o.label);
    expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b)));
    for (const o of opts) {
      const ids = o.models.map((m) => m.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) expect(id.startsWith(`${o.id}:`)).toBe(true);
    }
  });
});
