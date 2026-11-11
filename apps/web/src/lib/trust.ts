import { validateVin } from "@repo/core";
import type { ListingDetail, PricePoint } from "@/data/types";
import {
  formatDate,
  formatMemberSince,
  formatNumber,
  formatPrice,
  percentChange,
  pluralRu,
} from "./format";

/**
 * "Что известно об этой машине" — only facts the site itself can check (docs/tone-of-voice.md,
 * «Доверие»). Seller statements (customs, availability) belong to the specs block, not here.
 */

/** fact = we found it; warning = worth a look (neutral tone); unknown = honest "нет данных". */
export type TrustStatus = "fact" | "warning" | "unknown";

export type TrustItemId = "market" | "vin" | "seller-listings" | "days-on-site" | "price-changes";

export interface TrustItem {
  id: TrustItemId;
  status: TrustStatus;
  /** The fact itself, one sentence. */
  title: string;
  /** Optional second line: number behind the fact or what the buyer can do. */
  detail: string | null;
  /** Where the fact comes from. Null only for "нет данных". */
  source: string | null;
  /** Date of the fact, already formatted. */
  date: string | null;
}

/**
 * Price this far below similar listings is worth a look. Placeholder until the market formula
 * exists (it will come with its own threshold), see docs/decisions.md.
 */
export const MARKET_WARNING_BELOW_PERCENT = -15;

const SOURCE_SITE = "Данные сайта";
const SOURCE_MARKET = "Расчёт сайта по объявлениям о продаже в Кыргызстане";

function listingsWord(n: number): string {
  return pluralRu(n, ["объявление", "объявления", "объявлений"]);
}

function marketItem(l: ListingDetail, now: Date): TrustItem {
  const m = l.marketEstimate;
  if (m === null) {
    return {
      id: "market",
      status: "unknown",
      title: "Цена к рынку: нет данных",
      detail: null,
      source: null,
      date: null,
    };
  }
  const pct = Math.abs(m.diffPercent);
  const period = `${formatNumber(m.periodDays)} ${pluralRu(m.periodDays, ["день", "дня", "дней"])}`;
  const title =
    m.diffPercent < 0
      ? `Цена на ${pct}% ниже похожих объявлений за ${period}`
      : m.diffPercent > 0
        ? `Цена на ${pct}% выше похожих объявлений за ${period}`
        : `Цена совпадает с похожими объявлениями за ${period}`;
  return {
    id: "market",
    status: m.diffPercent <= MARKET_WARNING_BELOW_PERCENT ? "warning" : "fact",
    title,
    detail: `Сравнили с ${formatNumber(m.comparedCount)} ${pluralRu(m.comparedCount, ["похожим объявлением", "похожими объявлениями", "похожими объявлениями"])}`,
    source: SOURCE_MARKET,
    date: formatDate(m.computedAt, now),
  };
}

function vinItem(l: ListingDetail): TrustItem {
  const vin = l.vehicle.vin;
  if (vin === null) {
    return {
      id: "vin",
      status: "warning",
      title: "VIN не указан продавцом",
      detail: "Попросите VIN у продавца, чтобы проверить историю машины",
      source: "Объявление",
      date: null,
    };
  }
  const result = validateVin(vin);
  if (result.valid) {
    return {
      id: "vin",
      status: "fact",
      title: "VIN указан, формат корректен",
      detail: result.vin,
      source: "VIN указал продавец, формат проверил сайт",
      date: null,
    };
  }
  return {
    id: "vin",
    status: "warning",
    title: "VIN указан, но формат не совпадает со стандартом",
    detail:
      result.error === "checksum"
        ? `${result.vin} — контрольная цифра не сходится. Уточните VIN у продавца`
        : `${result.vin} — возможно, это номер кузова. Уточните VIN у продавца`,
    source: "VIN указал продавец, формат проверил сайт",
    date: null,
  };
}

function sellerItem(l: ListingDetail): TrustItem {
  const n = l.seller.activeListings;
  return {
    id: "seller-listings",
    status: "fact",
    title: `У продавца ${formatNumber(n)} ${listingsWord(n)} на сайте`,
    detail: formatMemberSince(l.seller.memberSince),
    source: SOURCE_SITE,
    date: null,
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

function daysItem(l: ListingDetail, now: Date): TrustItem {
  if (l.publishedAt === null) {
    return {
      id: "days-on-site",
      status: "unknown",
      title: "Дата публикации: нет данных",
      detail: null,
      source: null,
      date: null,
    };
  }
  const days = Math.max(0, Math.floor((now.getTime() - l.publishedAt.getTime()) / DAY_MS));
  return {
    id: "days-on-site",
    status: "fact",
    title:
      days === 0
        ? "Опубликовано сегодня"
        : `На сайте ${formatNumber(days)} ${pluralRu(days, ["день", "дня", "дней"])}`,
    detail: null,
    source: SOURCE_SITE,
    date: `Опубликовано ${formatDate(l.publishedAt, now)}`,
  };
}

/** Points where the price actually changed (same price re-observed is not a change). */
export function priceChanges(history: readonly PricePoint[]): number {
  let changes = 0;
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1];
    const cur = history[i];
    if (prev && cur && cur.priceUsd !== prev.priceUsd) changes++;
  }
  return changes;
}

function priceItem(l: ListingDetail, now: Date): TrustItem {
  const changes = priceChanges(l.priceHistory);
  const first = l.priceHistory[0];
  const last = l.priceHistory.at(-1);
  // No observations at all is "нет данных", not "не менялась".
  if (!first || !last) {
    return {
      id: "price-changes",
      status: "unknown",
      title: "История цены: нет данных",
      detail: null,
      source: null,
      date: null,
    };
  }
  if (changes === 0) {
    return {
      id: "price-changes",
      status: "fact",
      title: "Цена не менялась с публикации",
      detail: null,
      source: SOURCE_SITE,
      date: null,
    };
  }
  const pct = percentChange(last.priceUsd, first.priceUsd);
  const times = pluralRu(changes, ["раз", "раза", "раз"]);
  const sign = pct > 0 ? "+" : pct < 0 ? "−" : "";
  return {
    id: "price-changes",
    status: "fact",
    title: `Цена менялась ${formatNumber(changes)} ${times}`,
    detail: `Было ${formatPrice(first.priceAmount, first.currency)}, сейчас ${formatPrice(last.priceAmount, last.currency)} (${sign}${Math.abs(pct)}%)`,
    source: SOURCE_SITE,
    date: `Последнее изменение ${formatDate(last.observedAt, now)}`,
  };
}

export function buildTrustItems(listing: ListingDetail, now: Date): TrustItem[] {
  return [
    marketItem(listing, now),
    vinItem(listing),
    sellerItem(listing),
    daysItem(listing, now),
    priceItem(listing, now),
  ];
}
