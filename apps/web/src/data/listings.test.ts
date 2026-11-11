import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS } from "@/lib/filters";
import {
  getCatalogStats,
  getCities,
  getLatestListings,
  getListing,
  getListingsByIds,
  getSimilarListings,
  searchListings,
} from "./listings";

describe("listings data layer", () => {
  it("getListing: closed listings are reachable, unknown id is null", async () => {
    expect((await getListing("demo-sold"))?.status).toBe("sold");
    expect(await getListing("nope")).toBeNull();
  });

  it("lists contain only active listings and no contacts", async () => {
    const r = await searchListings(EMPTY_FILTERS, "fresh", 1);
    const latest = await getLatestListings(50);
    for (const card of [...r.items, ...latest]) {
      expect(card).not.toHaveProperty("contacts");
      expect((await getListing(card.id))?.status).toBe("active");
    }
  });

  it("similar: never the listing itself, same model first", async () => {
    const ok = await getListing("demo-ok");
    if (!ok) throw new Error("fixture");
    const similar = await getSimilarListings(ok, 4);
    expect(similar.length).toBeGreaterThan(0);
    expect(similar.map((s) => s.id)).not.toContain(ok.id);
    expect(similar[0]?.model).toBe(ok.model);
  });

  it("cities: unique, sorted in Russian order", async () => {
    const cities = await getCities();
    expect(new Set(cities).size).toBe(cities.length);
    expect(cities).toEqual([...cities].sort((a, b) => a.localeCompare(b, "ru")));
  });

  it("stats: city subset of the country, make counts add up", async () => {
    const all = await getCatalogStats(null);
    const bishkek = await getCatalogStats("Бишкек");
    expect(bishkek.total).toBeGreaterThan(0);
    expect(bishkek.total).toBeLessThan(all.total);
    expect(all.makes.reduce((n, m) => n + m.count, 0)).toBe(all.total);
  });

  it("by ids: keeps order, skips closed and unknown", async () => {
    const r = await getListingsByIds(["demo-novin", "demo-sold", "nope", "demo-ok"]);
    expect(r.map((l) => l.id)).toEqual(["demo-novin", "demo-ok"]);
  });
});
