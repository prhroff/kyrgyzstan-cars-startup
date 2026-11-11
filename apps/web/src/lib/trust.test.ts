import { describe, expect, it } from "vitest";
import { FIXTURE_LISTINGS, FIXTURE_NOW } from "@/data/fixtures";
import type { ListingDetail } from "@/data/types";
import { buildTrustItems, priceChanges, type TrustItem } from "./trust";

const n = (s: string | null) => s?.replaceAll(String.fromCodePoint(0xa0), " ") ?? null;

function fixture(id: string): ListingDetail {
  const l = FIXTURE_LISTINGS.find((x) => x.id === id);
  if (!l) throw new Error(`no fixture ${id}`);
  return l;
}

function item(l: ListingDetail, id: TrustItem["id"]): TrustItem {
  const it = buildTrustItems(l, FIXTURE_NOW).find((x) => x.id === id);
  if (!it) throw new Error(`no item ${id}`);
  return it;
}

/** docs/tone-of-voice.md: words we never use about trust. */
const BANNED = /гарант|провер(ен|ено)|подтвержд|подозрит|обман|мошенн|скрывает|надёжн|чист/i;

describe("buildTrustItems", () => {
  it("always returns the five MVP items in a fixed order", () => {
    expect(buildTrustItems(fixture("demo-ok"), FIXTURE_NOW).map((i) => i.id)).toEqual([
      "market",
      "vin",
      "seller-listings",
      "days-on-site",
      "price-changes",
    ]);
  });

  it("one observed price: did not change", () => {
    expect(item(fixture("demo-novin"), "price-changes")).toMatchObject({
      status: "fact",
      title: "Цена не менялась с публикации",
    });
  });

  it("all good: every item is a fact with a source", () => {
    const items = buildTrustItems(fixture("demo-ok"), FIXTURE_NOW);
    expect(items.every((i) => i.status === "fact" && i.source)).toBe(true);
    expect(n(item(fixture("demo-ok"), "market").title)).toBe(
      "Цена на 3% ниже похожих объявлений за 30 дней",
    );
    expect(item(fixture("demo-ok"), "market").detail).toBe("Сравнили с 27 похожими объявлениями");
    expect(item(fixture("demo-ok"), "vin").title).toBe("VIN указан, формат корректен");
    expect(item(fixture("demo-ok"), "seller-listings").title).toBe(
      "У продавца 4 объявления на сайте",
    );
    expect(item(fixture("demo-ok"), "days-on-site").title).toBe("На сайте 12 дней");
    expect(item(fixture("demo-ok"), "price-changes").title).toBe("Цена менялась 2 раза");
    expect(n(item(fixture("demo-ok"), "price-changes").detail)).toBe(
      "Было 25 500 $, сейчас 24 500 $ (−4%)",
    );
  });

  it("warnings: far below market and a VIN with a wrong check digit", () => {
    const l = fixture("demo-warn");
    expect(item(l, "market").status).toBe("warning");
    expect(item(l, "vin").status).toBe("warning");
    expect(item(l, "vin").detail).toContain("контрольная цифра не сходится");
  });

  it("no VIN: neutral warning, no blame", () => {
    const vin = item(fixture("demo-novin"), "vin");
    expect(vin).toMatchObject({ status: "warning", title: "VIN не указан продавцом" });
  });

  it("almost no data: honest «нет данных», never a negative claim", () => {
    const l = fixture("demo-nodata");
    expect(item(l, "market")).toMatchObject({ status: "unknown", source: null });
    expect(item(l, "market").title).toContain("нет данных");
    expect(item(l, "days-on-site").status).toBe("unknown");
    expect(item(l, "price-changes")).toMatchObject({
      status: "unknown",
      title: "История цены: нет данных",
    });
  });

  it("price above market is a fact, not a warning", () => {
    const base = fixture("demo-ok");
    const l: ListingDetail = {
      ...base,
      marketEstimate: base.marketEstimate && { ...base.marketEstimate, diffPercent: 25 },
    };
    expect(item(l, "market")).toMatchObject({ status: "fact" });
    expect(item(l, "market").title).toContain("выше");
  });

  it("frame number instead of VIN gets its own hint", () => {
    const base = fixture("demo-ok");
    const l: ListingDetail = { ...base, vehicle: { ...base.vehicle, vin: "GX1106012345" } };
    expect(item(l, "vin").detail).toContain("номер кузова");
  });

  it("no text uses banned trust words", () => {
    for (const l of FIXTURE_LISTINGS) {
      for (const i of buildTrustItems(l, FIXTURE_NOW)) {
        expect([i.title, i.detail, i.source].join(" ")).not.toMatch(BANNED);
      }
    }
  });
});

describe("priceChanges", () => {
  it("ignores re-observed equal prices", () => {
    const at = new Date();
    const p = (usd: number) => ({
      priceAmount: usd,
      currency: "USD" as const,
      priceUsd: usd,
      observedAt: at,
    });
    expect(priceChanges([p(100), p(100), p(90), p(90)])).toBe(1);
    expect(priceChanges([])).toBe(0);
  });
});
