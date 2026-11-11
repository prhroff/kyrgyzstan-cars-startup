import { describe, expect, it } from "vitest";
import { CATALOG } from "./catalog.js";
import { REGIONS } from "./regions.js";
import { slugify } from "./slugify.js";

describe("slugify", () => {
  it.each([
    ["Mercedes-Benz", "mercedes-benz"],
    ["ID.4", "id-4"],
    ["Land Cruiser Prado", "land-cruiser-prado"],
    ["CR-V", "cr-v"],
    [" 001 ", "001"],
  ])("%j → %s", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });
});

describe("seed data", () => {
  it("has ~30 makes with unique slugs", () => {
    const slugs = CATALOG.map((m) => slugify(m.name));
    expect(slugs.length).toBeGreaterThanOrEqual(30);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has unique, non-empty model slugs within each make", () => {
    for (const make of CATALOG) {
      const slugs = make.models.map((m) => slugify(typeof m === "string" ? m : m.name));
      expect(
        slugs.every((s) => s.length > 0),
        make.name,
      ).toBe(true);
      expect(new Set(slugs).size, make.name).toBe(slugs.length);
    }
  });

  it("has consistent generation years without overlaps per model", () => {
    for (const make of CATALOG) {
      for (const model of make.models) {
        if (typeof model === "string" || !model.generations) continue;
        const gens = [...model.generations].sort((a, b) => a.yearFrom - b.yearFrom);
        gens.forEach((gen, i) => {
          const label = `${make.name} ${model.name} ${gen.code}`;
          if (gen.yearTo !== undefined)
            expect(gen.yearTo, label).toBeGreaterThanOrEqual(gen.yearFrom);
          const next = gens[i + 1];
          if (next) {
            expect(gen.yearTo, `${label} must end before the next one`).toBeDefined();
            expect(next.yearFrom, label).toBeGreaterThanOrEqual(gen.yearTo ?? Infinity);
          }
        });
      }
    }
  });

  it("has unique region and city slugs and includes Bishkek and Osh", () => {
    const regionSlugs = REGIONS.map((r) => r.slug);
    const citySlugs = REGIONS.flatMap((r) => r.cities.map((c) => c.slug));
    expect(new Set(regionSlugs).size).toBe(regionSlugs.length);
    expect(new Set(citySlugs).size).toBe(citySlugs.length);
    expect(citySlugs).toEqual(expect.arrayContaining(["bishkek", "osh"]));
    expect(REGIONS.filter((r) => r.type === "oblast")).toHaveLength(7);
  });
});
