import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS } from "@/lib/filters";
import {
  getCities,
  getLatestListings,
  getListing,
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

  it("similar: never the listing itself, same make first", async () => {
    const ok = await getListing("demo-ok");
    if (!ok) throw new Error("fixture");
    const similar = await getSimilarListings(ok, 4);
    expect(similar).toHaveLength(4);
    expect(similar.map((s) => s.id)).not.toContain(ok.id);
    expect(similar[0]?.make).toBe(ok.make);
  });

  it("cities: unique, sorted in Russian order", async () => {
    const cities = await getCities();
    expect(new Set(cities).size).toBe(cities.length);
    expect(cities).toEqual([...cities].sort((a, b) => a.localeCompare(b, "ru")));
  });
});
