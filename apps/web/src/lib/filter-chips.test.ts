import { describe, expect, it } from "vitest";
import type { MakeOptionData } from "@/data/search";
import { filterChips } from "./filter-chips";
import { EMPTY_FILTERS } from "./filters";

const n = (s: string) => s.replaceAll(String.fromCodePoint(0xa0), " ");
const makes: MakeOptionData[] = [
  { id: "toyota", label: "Toyota", models: [{ id: "toyota:camry", label: "Camry" }] },
];

describe("filterChips", () => {
  it("no filters, no chips", () => {
    expect(filterChips(EMPTY_FILTERS, makes)).toEqual([]);
  });

  it("labels every kind of filter in panel order", () => {
    const chips = filterChips(
      {
        ...EMPTY_FILTERS,
        make: "toyota",
        model: "toyota:camry",
        yearFrom: 2018,
        priceTo: 20000,
        city: "Ош",
        body: ["sedan"],
        fuel: ["lpg", "petrol_lpg", "erev"],
        steering: "right",
        origin: ["korea"],
        inTransit: true,
        belowMarket: true,
      },
      makes,
    );
    expect(chips.map((c) => n(c.label))).toEqual([
      "Toyota",
      "Camry",
      "Год от 2018",
      "Цена до 20 000 $",
      "Ош",
      "Седан",
      "Газ",
      "Гибрид: с увеличенным запасом хода (EREV)",
      "Руль: правый",
      "Из Кореи",
      "В пути",
      "Ниже рынка",
    ]);
  });

  it("removing a make also removes its model", () => {
    const f = { ...EMPTY_FILTERS, make: "toyota", model: "toyota:camry" };
    const chip = filterChips(f, makes).find((c) => c.key === "make");
    expect(chip?.remove(f)).toMatchObject({ make: null, model: null });
  });

  it("removing a full fuel group removes all its types", () => {
    const f = {
      ...EMPTY_FILTERS,
      fuel: ["petrol" as const, "lpg" as const, "petrol_lpg" as const],
    };
    const chip = filterChips(f, makes).find((c) => c.key === "fuel:gas");
    expect(chip?.remove(f).fuel).toEqual(["petrol"]);
  });

  it("year range uses a dash", () => {
    const chips = filterChips({ ...EMPTY_FILTERS, yearFrom: 2015, yearTo: 2020 }, makes);
    expect(chips[0]?.label).toBe("Год 2015 – 2020");
  });
});
