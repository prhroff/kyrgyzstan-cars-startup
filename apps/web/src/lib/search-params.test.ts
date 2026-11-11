import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS } from "./filters";
import { catalogQueryString, pageItems, parseCatalogQuery } from "./search-params";

describe("parseCatalogQuery", () => {
  it("empty query → defaults", () => {
    expect(parseCatalogQuery({})).toEqual({ filters: EMPTY_FILTERS, sort: "fresh", page: 1 });
  });

  it("reads every filter", () => {
    const q = parseCatalogQuery({
      make: "toyota",
      model: "toyota:camry",
      yearFrom: "2018",
      yearTo: "2022",
      priceFrom: "10 000",
      priceTo: "25000",
      city: "Бишкек",
      fuel: "petrol,hybrid",
      steering: "left",
      transmission: ["automatic", "cvt"],
      sort: "price_asc",
      page: "3",
    });
    expect(q).toEqual({
      filters: {
        make: "toyota",
        model: "toyota:camry",
        yearFrom: 2018,
        yearTo: 2022,
        priceFrom: 10000,
        priceTo: 25000,
        city: "Бишкек",
        fuel: ["petrol", "hybrid"],
        steering: "left",
        transmission: ["automatic", "cvt"],
      },
      sort: "price_asc",
      page: 3,
    });
  });

  it("drops garbage instead of failing", () => {
    const q = parseCatalogQuery({
      priceTo: "дёшево",
      fuel: "petrol,nuclear",
      steering: "middle",
      sort: "random",
      page: "-2",
      model: "honda:fit",
    });
    expect(q.filters.priceTo).toBeNull();
    expect(q.filters.fuel).toEqual(["petrol"]);
    expect(q.filters.steering).toBeNull();
    expect(q.filters.model).toBeNull();
    expect(q.sort).toBe("fresh");
    expect(q.page).toBe(1);
  });

  it("a model of another make is dropped", () => {
    expect(parseCatalogQuery({ make: "kia", model: "toyota:camry" }).filters.model).toBeNull();
  });
});

describe("catalogQueryString", () => {
  it("defaults → empty string", () => {
    expect(catalogQueryString({ filters: EMPTY_FILTERS, sort: "fresh", page: 1 })).toBe("");
  });

  it("round-trips through parse", () => {
    const q = parseCatalogQuery({
      make: "kia",
      model: "kia:k5",
      priceTo: "20000",
      fuel: "hybrid,petrol",
      sort: "year_desc",
      page: "2",
    });
    const s = catalogQueryString(q);
    expect(s).toBe(
      "?make=kia&model=kia%3Ak5&priceTo=20000&fuel=petrol%2Chybrid&sort=year_desc&page=2",
    );
    const back = parseCatalogQuery(Object.fromEntries(new URLSearchParams(s)));
    expect(back).toEqual(q);
  });
});

describe("pageItems", () => {
  it("lists all pages when few", () => {
    expect(pageItems(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });
  it("adds gaps around the current page", () => {
    expect(pageItems(5, 10)).toEqual([1, "gap", 4, 5, 6, "gap", 10]);
  });
  it("keeps the start and end compact", () => {
    expect(pageItems(1, 10)).toEqual([1, 2, 3, 4, "gap", 10]);
    expect(pageItems(10, 10)).toEqual([1, "gap", 7, 8, 9, 10]);
  });
});
