import { describe, expect, it } from "vitest";
import { catalogCrumbs, listingCrumbs } from "./breadcrumbs";
import { parseCatalogQuery } from "./search-params";

const query = (href: string) =>
  parseCatalogQuery(Object.fromEntries(new URL(href, "http://x").searchParams)).filters;

const toyota = { id: "toyota", label: "Toyota" };
const camry = { id: "toyota:camry", label: "Camry" };

describe("breadcrumbs", () => {
  it("whole catalog: the last step is the current page", () => {
    expect(catalogCrumbs({})).toEqual([
      { label: "Главная", href: "/" },
      { label: "Автомобили", href: null },
    ]);
  });

  it("make and model: each step links one level up, city is kept", () => {
    const crumbs = catalogCrumbs({ make: toyota, model: camry, city: "Ош" });
    expect(crumbs.map((c) => c.label)).toEqual(["Главная", "Автомобили", "Toyota", "Camry"]);
    expect(crumbs[3]?.href).toBeNull();
    const all = query(crumbs[1]?.href ?? "");
    expect([all.make, all.model, all.city]).toEqual([null, null, "Ош"]);
    const make = query(crumbs[2]?.href ?? "");
    expect([make.make, make.model, make.city]).toEqual(["toyota", null, "Ош"]);
  });

  it("model without make is ignored", () => {
    expect(catalogCrumbs({ model: camry }).map((c) => c.label)).toEqual(["Главная", "Автомобили"]);
  });

  it("listing page: every step is a link down to the model", () => {
    const crumbs = listingCrumbs({ make: toyota, model: camry });
    expect(crumbs.every((c) => c.href !== null)).toBe(true);
    const model = query(crumbs[3]?.href ?? "");
    expect([model.make, model.model]).toEqual(["toyota", "toyota:camry"]);
  });
});
