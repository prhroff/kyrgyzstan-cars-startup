import { describe, expect, it } from "vitest";
import { FIXTURE_LISTINGS } from "@/data/fixtures";
import type { MakeOptionData } from "@/data/search";
import { EMPTY_FILTERS } from "./filters";
import { catalogMeta, listingMetaDescription, listingMetaTitle } from "./seo";

const n = (s: string) => s.replaceAll(String.fromCodePoint(0xa0), " ");

const ok = FIXTURE_LISTINGS.find((l) => l.id === "demo-ok");
const makes: MakeOptionData[] = [
  { id: "toyota", label: "Toyota", models: [{ id: "toyota:camry", label: "Camry" }] },
];

describe("listing meta", () => {
  it("title has make, model, year, price, city", () => {
    if (!ok) throw new Error("fixture");
    expect(n(listingMetaTitle(ok))).toBe("Toyota Camry 2021 за 24 500 $, Бишкек");
  });

  it("description lists only known specs", () => {
    if (!ok) throw new Error("fixture");
    expect(n(listingMetaDescription(ok))).toBe(
      "Toyota Camry 2021, 68 000 км, автомат, бензин. Цена 24 500 $, Бишкек. Продавец — дилер. В объявлении: цена к рынку, история цены и данные о продавце.",
    );
    const bare = {
      ...ok,
      mileageKm: null,
      city: null,
      vehicle: { ...ok.vehicle, fuelType: null, transmission: null },
    };
    expect(listingMetaDescription(bare).startsWith("Toyota Camry 2021. Цена")).toBe(true);
  });
});

describe("catalogMeta", () => {
  it("all cars", () => {
    const m = catalogMeta(EMPTY_FILTERS, 41, makes);
    expect(m.h1).toBe("Продажа авто в Кыргызстане");
    expect(m.description.startsWith("41 объявление о продаже авто")).toBe(true);
    expect(m.indexable).toBe(true);
  });

  it("make + model is indexable", () => {
    const m = catalogMeta({ ...EMPTY_FILTERS, make: "toyota", model: "toyota:camry" }, 3, makes);
    expect(m.title).toBe("Купить Toyota Camry в Кыргызстане — объявления о продаже");
    expect(m.indexable).toBe(true);
  });

  it("other filters are noindex", () => {
    expect(
      catalogMeta({ ...EMPTY_FILTERS, make: "toyota", priceTo: 20000 }, 3, makes).indexable,
    ).toBe(false);
  });

  it("unknown make falls back to «авто» and is noindex", () => {
    const m = catalogMeta({ ...EMPTY_FILTERS, make: "tesla" }, 0, makes);
    expect(m.h1).toBe("Продажа авто в Кыргызстане");
    expect(m.indexable).toBe(false);
  });
});
