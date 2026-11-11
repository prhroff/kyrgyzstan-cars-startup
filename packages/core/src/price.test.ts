import { describe, expect, it } from "vitest";
import type { ParsedPrice } from "./price.js";
import { parsePrice } from "./price.js";

const usd = (amount: number): ParsedPrice => ({
  amount,
  currency: "USD",
  currencyInferred: false,
  scaleInferred: false,
});
const kgs = (amount: number): ParsedPrice => ({
  amount,
  currency: "KGS",
  currencyInferred: false,
  scaleInferred: false,
});

describe("parsePrice", () => {
  describe("explicit currency", () => {
    it.each([
      ["15 500$", usd(15500)],
      ["$15 500", usd(15500)],
      ["$15,500", usd(15500)],
      ["15500 usd", usd(15500)],
      ["15.500 $", usd(15500)],
      ["15 500 долларов", usd(15500)],
      ["15500 у.е.", usd(15500)],
      ["15к$", usd(15000)],
      ["15.5k $", usd(15500)],
      ["15.5 тыс. долл", usd(15500)],
      ["1.2 млн сом", kgs(1_200_000)],
      ["1,2 млн сом", kgs(1_200_000)],
      ["1.250 млн сом", kgs(1_250_000)],
      ["850 000 сом", kgs(850_000)],
      ["850000сом", kgs(850_000)],
      ["850 000 с", kgs(850_000)],
      ["850 тыс сом", kgs(850_000)],
      ["1 200 000 KGS", kgs(1_200_000)],
      ["2 ляма сом", kgs(2_000_000)],
      ["1.200.000 сом", kgs(1_200_000)],
      ["1,200,000.50 сом", kgs(1_200_001)],
      ["500$", usd(500)],
      ["15" + String.fromCharCode(0xa0) + "500 $", usd(15500)],
      ["850 000 " + String.fromCodePoint(0x20c0), kgs(850_000)],
    ])("%j", (input, expected) => {
      expect(parsePrice(input)).toEqual(expected);
    });
  });

  describe("no currency — heuristic", () => {
    it("treats amounts < 300 000 as USD", () => {
      expect(parsePrice("15.5k")).toEqual({
        amount: 15500,
        currency: "USD",
        currencyInferred: true,
        scaleInferred: false,
      });
      expect(parsePrice("15 500")).toMatchObject({
        amount: 15500,
        currency: "USD",
        currencyInferred: true,
      });
    });

    it("treats amounts ≥ 300 000 as KGS", () => {
      expect(parsePrice("1.2 млн")).toEqual({
        amount: 1_200_000,
        currency: "KGS",
        currencyInferred: true,
        scaleInferred: false,
      });
      expect(parsePrice("850 000")).toMatchObject({ currency: "KGS", currencyInferred: true });
    });

    it("reads bare numbers < 1000 as thousands USD", () => {
      expect(parsePrice("15.5")).toEqual({
        amount: 15500,
        currency: "USD",
        currencyInferred: true,
        scaleInferred: true,
      });
      expect(parsePrice("15")).toMatchObject({ amount: 15000, scaleInferred: true });
    });
  });

  describe("defaultCurrency", () => {
    it("beats the heuristic", () => {
      expect(parsePrice("850 000", { defaultCurrency: "USD" })).toMatchObject({
        amount: 850_000,
        currency: "USD",
        currencyInferred: true,
      });
      expect(parsePrice("15 500", { defaultCurrency: "KGS" })).toMatchObject({ currency: "KGS" });
    });

    it("applies to bare thousands", () => {
      expect(parsePrice("850", { defaultCurrency: "KGS" })).toEqual({
        amount: 850_000,
        currency: "KGS",
        currencyInferred: true,
        scaleInferred: true,
      });
    });

    it("never overrides an explicit currency", () => {
      expect(parsePrice("15 500$", { defaultCurrency: "KGS" })).toEqual(usd(15500));
    });
  });

  describe("invalid", () => {
    it.each([
      [""],
      ["   "],
      ["договорная"],
      ["0"],
      ["0$"],
      ["-15000"],
      ["-15 000 $"],
      ["15-16k"],
      ["15 000 €"],
      ["1 500 000 руб"],
      ["$15 500 сом"],
      ["abc 15000"],
      ["15 000 $ торг"],
      ["99999999999 сом"],
      ["1..2"],
      ["1.20.000 сом"],
    ])("%j → null", (input) => {
      expect(parsePrice(input)).toBeNull();
    });
  });
});
