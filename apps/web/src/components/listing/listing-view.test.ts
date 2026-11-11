import { describe, expect, it } from "vitest";
import { FIXTURE_LISTINGS, FIXTURE_NOW } from "@/data/fixtures";
import type { ListingDetail } from "@/data/types";
import { closedText } from "./ClosedListing";
import { specRows } from "./ListingSpecs";

const n = (s: string | null) => s?.replaceAll(String.fromCodePoint(0xa0), " ") ?? null;

function fixture(id: string): ListingDetail {
  const l = FIXTURE_LISTINGS.find((x) => x.id === id);
  if (!l) throw new Error(`no fixture ${id}`);
  return l;
}

const value = (l: ListingDetail, label: string) =>
  specRows(l).find((r) => r.label === label)?.value;

describe("specRows", () => {
  it("unknown customs / negotiable stay null («нет данных»), never «нет»", () => {
    const l = fixture("demo-novin");
    expect(l.customsCleared).toBeNull();
    expect(value(l, "Растаможка")).toBeNull();
    expect(value(l, "Торг")).toBeNull();
  });

  it("false is a stated «нет», shown as such", () => {
    const base = fixture("demo-ok");
    const l = { ...base, customsCleared: false, negotiable: false };
    expect(value(l, "Растаможка")).toBe("Не растаможен");
    expect(value(l, "Торг")).toBe("Без торга");
  });

  it("formats known values", () => {
    const l = fixture("demo-ok");
    expect(n(value(l, "Пробег") ?? null)).toBe("68 000 км");
    expect(n(value(l, "Двигатель") ?? null)).toBe("2.5 л");
    expect(value(l, "Откуда машина")).toBe("Пригнана из США");
  });
});

describe("closedText", () => {
  it("sold: attributes the status to the seller, with the date", () => {
    expect(n(closedText(fixture("demo-sold"), FIXTURE_NOW).detail)).toBe(
      "Продавец отметил машину проданной 10 ноября",
    );
  });

  it("removed and archived read the same", () => {
    const removed = closedText({ status: "removed", closedAt: null }, FIXTURE_NOW);
    const archived = closedText({ status: "archived", closedAt: null }, FIXTURE_NOW);
    expect(removed).toEqual(archived);
    expect(removed).toEqual({ title: "Объявление снято с публикации", detail: null });
  });
});
