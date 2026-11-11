import { describe, expect, it } from "vitest";
import { DEFAULT_CATALOG_VIEW, isCatalogView, parseCatalogView } from "./catalog-view";

describe("catalog view", () => {
  it("defaults to rows", () => {
    expect(DEFAULT_CATALOG_VIEW).toBe("list");
    expect(parseCatalogView(undefined)).toBe("list");
  });

  it("accepts known values only", () => {
    expect(parseCatalogView("grid")).toBe("grid");
    expect(parseCatalogView("list")).toBe("list");
    expect(parseCatalogView("GRID")).toBe("list");
    expect(parseCatalogView("")).toBe("list");
    expect(isCatalogView(1)).toBe(false);
  });
});
