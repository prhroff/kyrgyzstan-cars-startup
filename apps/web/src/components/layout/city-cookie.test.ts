import { describe, expect, it } from "vitest";
import { decodeCityCookie } from "./city-cookie";

describe("decodeCityCookie", () => {
  it("decodes a Cyrillic city", () => {
    expect(decodeCityCookie(encodeURIComponent("Ош"))).toBe("Ош");
  });
  it("missing or malformed → null", () => {
    expect(decodeCityCookie(undefined)).toBeNull();
    expect(decodeCityCookie("%E0%A4%A")).toBeNull();
  });
});
