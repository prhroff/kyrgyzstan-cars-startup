import { describe, expect, it } from "vitest";
import { sellerLabel } from "./listing-card";

describe("sellerLabel", () => {
  it("never shows a private seller's name", () => {
    expect(sellerLabel({ type: "private", name: "Азамат" })).toBe("Частное лицо");
    expect(sellerLabel({ type: "private", name: null })).toBe("Частное лицо");
  });

  it("names dealers and importers in quotes", () => {
    expect(sellerLabel({ type: "dealer", name: "Демо Моторс" })).toBe("Дилер «Демо Моторс»");
    expect(sellerLabel({ type: "importer", name: " Демо Импорт " })).toBe("Импортёр «Демо Импорт»");
  });

  it("falls back to the type when the name is empty", () => {
    expect(sellerLabel({ type: "dealer", name: null })).toBe("Дилер");
    expect(sellerLabel({ type: "dealer", name: "   " })).toBe("Дилер");
  });

  it("does not nest quotes", () => {
    expect(sellerLabel({ type: "dealer", name: "Автосалон «Европа»" })).toBe(
      "Дилер Автосалон «Европа»",
    );
  });
});
