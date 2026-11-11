import { describe, expect, it } from "vitest";
import { vinLengthMessage, yearRangeMessage } from "./messages";

describe("vinLengthMessage", () => {
  it.each([
    ["", "Введено 0 из 17 символов"],
    ["JTDBR32E60", "Введено 10 из 17 символов"],
    ["JTD-BR3 2E60", "Введено 10 из 17 символов"],
    ["JTDBR32E60JTDBR32E60", "Введено 20 из 17 символов"],
  ])("%j → %s", (input, expected) => {
    expect(vinLengthMessage(input)).toBe(expected);
  });
});

describe("yearRangeMessage", () => {
  it("uses 1950 and next year", () => {
    expect(yearRangeMessage(new Date("2026-11-11T12:00:00Z"))).toBe("Укажите год с 1950 по 2027");
  });
});
