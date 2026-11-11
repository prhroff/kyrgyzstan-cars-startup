import { describe, expect, it } from "vitest";
import { ALL_CITIES, resolveCity } from "./city";

describe("resolveCity", () => {
  it("defaults to Bishkek", () => {
    expect(resolveCity(null, null)).toEqual({
      city: "Бишкек",
      heading: "Авто в Бишкеке",
      optionId: "Бишкек",
    });
  });

  it("cookie is the default when the URL has no city", () => {
    expect(resolveCity(null, "Ош").heading).toBe("Авто в Оше");
    expect(resolveCity(null, ALL_CITIES)).toMatchObject({
      city: null,
      heading: "Авто в Кыргызстане",
    });
  });

  it("URL wins over the cookie (a shared link opens as sent)", () => {
    expect(resolveCity("Ош", "Бишкек").heading).toBe("Авто в Оше");
  });

  it("any city from the URL is honoured with a neutral heading", () => {
    expect(resolveCity("Токмок", "Бишкек")).toEqual({
      city: "Токмок",
      heading: "Авто: Токмок",
      optionId: "Токмок",
    });
  });

  it("garbage cookie falls back to the default", () => {
    expect(resolveCity(null, "Москва").city).toBe("Бишкек");
    expect(resolveCity("  ", null).city).toBe("Бишкек");
  });
});
