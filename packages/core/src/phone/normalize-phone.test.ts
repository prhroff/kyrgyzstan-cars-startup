import { describe, expect, it } from "vitest";
import { KG_MOBILE_OPERATORS } from "./kg-operators.js";
import { normalizePhone, toE164 } from "./normalize-phone.js";

describe("normalizePhone", () => {
  it.each([
    ["0555 12 34 56", "+996555123456"],
    ["+996555123456", "+996555123456"],
    ["555-12-34-56", "+996555123456"],
    ["996555123456", "+996555123456"],
    ["+996 (555) 12-34-56", "+996555123456"],
    ["00996555123456", "+996555123456"],
    ["0555.12.34.56", "+996555123456"],
    ["  0700 123 456  ", "+996700123456"],
    ["0 770 12 34 56", "+996770123456"],
    ["0555–12–34–56", "+996555123456"],
  ])("normalizes %j → %s", (input, expected) => {
    expect(toE164(input)).toBe(expected);
  });

  it("detects the mobile operator", () => {
    expect(normalizePhone("0555123456")).toEqual({
      e164: "+996555123456",
      kind: "mobile",
      operator: "megacom",
      knownPrefix: true,
    });
    expect(normalizePhone("0770123456")?.operator).toBe("beeline");
    expect(normalizePhone("0500123456")?.operator).toBe("o");
  });

  it("keeps a valid-length mobile number with an unknown prefix, flagged", () => {
    expect(normalizePhone("0888123456")).toEqual({
      e164: "+996888123456",
      kind: "mobile",
      operator: null,
      knownPrefix: false,
    });
  });

  it("recognizes landlines", () => {
    expect(normalizePhone("(0312) 12-34-56")).toEqual({
      e164: "+996312123456",
      kind: "fixed",
      operator: null,
      knownPrefix: true,
    });
  });

  it.each([
    [""],
    ["abc"],
    ["0555 12 34 5"], // too short
    ["0555 12 34 567"], // too long
    ["+7 701 123 45 67"], // foreign
    ["+996 055 123 456"], // NSN starting with 0
    ["155123456"], // NSN starting with 1
    ["0555-12-34-56 доб. 1"], // trailing text
    ["+99655512345"], // +996 with 8 digits
  ])("rejects %j", (input) => {
    expect(normalizePhone(input)).toBeNull();
  });

  it("has no prefix assigned to two operators", () => {
    const all = Object.values(KG_MOBILE_OPERATORS).flat();
    expect(new Set(all).size).toBe(all.length);
    for (const p of all) expect(p).toMatch(/^\d{3}$/);
  });
});
