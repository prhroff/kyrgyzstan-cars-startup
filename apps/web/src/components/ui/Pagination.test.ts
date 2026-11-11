import { describe, expect, it } from "vitest";
import { pageHref } from "./Pagination";

describe("pageHref", () => {
  it("adds the page, keeps other params", () => {
    expect(pageHref("/cars?make=kia", 3)).toBe("/cars?make=kia&page=3");
  });
  it("page 1 has no parameter", () => {
    expect(pageHref("/cars?page=4&make=kia", 1)).toBe("/cars?make=kia");
    expect(pageHref("/cars", 1)).toBe("/cars");
  });
  it("replaces an existing page", () => {
    expect(pageHref("/cars?page=2", 5)).toBe("/cars?page=5");
  });
});
