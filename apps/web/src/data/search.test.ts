import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS } from "@/lib/filters";
import type { CarCardData } from "@/lib/listing-card";
import { makeListings } from "@/dev/fixtures";
import { makeCounts, makeOptions, modelId, rankSimilar, search, slugify } from "./search";

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

describe("rankSimilar", () => {
  const c = (id: string, model: string, priceUsd: number, bodyType: string | null = "sedan") => ({
    id,
    make: "Toyota",
    model,
    priceUsd,
    bodyType,
  });
  const target = c("t", "Camry", 20_000);

  it("same model first, then same segment within ±20%, closest price first", () => {
    const ranked = rankSimilar(
      target,
      [
        c("seg-far", "Corolla", 25_000),
        c("seg-near", "Corolla", 19_000),
        c("model-far", "Camry", 35_000),
        c("model-near", "Camry", 21_000),
        c("other-body", "RAV4", 20_000, "crossover"),
        c("t", "Camry", 20_000),
      ],
      10,
    );
    expect(ranked.map((r) => r.id)).toEqual(["model-near", "model-far", "seg-near"]);
  });

  it("unknown segment of the target: only the same model", () => {
    const ranked = rankSimilar(
      { ...target, bodyType: null },
      [c("seg", "Corolla", 20_000, null)],
      4,
    );
    expect(ranked).toEqual([]);
  });

  it("respects the limit", () => {
    const many = Array.from({ length: 10 }, (_, i) => c(`m${i}`, "Camry", 20_000 + i));
    expect(rankSimilar(target, many, 4)).toHaveLength(4);
  });
});

describe("makeCounts", () => {
  it("counts per make, most first, ties alphabetical", () => {
    const counts = makeCounts([
      { ...at(0), make: "Kia" },
      { ...at(1), make: "Toyota" },
      { ...at(2), make: "Toyota" },
      { ...at(3), make: "BYD" },
    ]);
    expect(counts).toEqual([
      { id: "toyota", label: "Toyota", count: 2 },
      { id: "byd", label: "BYD", count: 1 },
      { id: "kia", label: "Kia", count: 1 },
    ]);
  });
});

describe("new filters", () => {
  it("text, body, origin, in transit and below market", () => {
    const base = at(0);
    const l = {
      ...base,
      make: "Toyota",
      model: "Camry",
      trim: "2.5 Hybrid SE",
      availability: "in_transit" as const,
      market: "below" as const,
      vehicle: { ...base.vehicle, bodyType: "sedan" as const, originCountry: "korea" as const },
    };
    const f = {
      ...EMPTY_FILTERS,
      q: "camry  HYBRID",
      body: ["sedan" as const],
      origin: ["korea" as const],
      inTransit: true,
      belowMarket: true,
    };
    expect(search([l], f, "fresh", 1).total).toBe(1);
    expect(search([{ ...l, market: "fair" }], f, "fresh", 1).total).toBe(0);
    expect(search([{ ...l, availability: "in_stock" }], f, "fresh", 1).total).toBe(0);
    expect(search([l], { ...f, q: "rav4" }, "fresh", 1).total).toBe(0);
  });

  it("unknown body type never matches a body filter", () => {
    const base = at(0);
    const l = { ...base, vehicle: { ...base.vehicle, bodyType: null } };
    expect(search([l], { ...EMPTY_FILTERS, body: ["sedan"] }, "fresh", 1).total).toBe(0);
  });
});
