import {
  FUEL_TYPES,
  STEERING_SIDES,
  TRANSMISSIONS,
  type FuelType,
  type SteeringSide,
  type Transmission,
} from "@repo/core";
import { SORTS, type Sort } from "@/data/types";
import { EMPTY_FILTERS, parseIntegerInput, type FilterValues } from "./filters";

/**
 * Catalog state <-> URL query, so a search can be shared as a link.
 * Parsing is lenient: an unknown or malformed value is dropped, never an error page.
 * Example: /cars?make=toyota&model=toyota:camry&priceTo=20000&fuel=petrol,hybrid&sort=price_asc&page=2
 */

export interface CatalogQuery {
  filters: FilterValues;
  sort: Sort;
  page: number;
}

export const DEFAULT_SORT: Sort = "fresh";

/** Next.js `searchParams` shape. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(raw: RawSearchParams, key: string): string | null {
  const v = raw[key];
  const s = Array.isArray(v) ? v[0] : v;
  const trimmed = s?.trim();
  return trimmed === undefined || trimmed === "" ? null : trimmed;
}

function oneOf<T extends string>(values: readonly T[], s: string | null): T | null {
  return values.find((v) => v === s) ?? null;
}

/** "petrol,hybrid" or repeated keys → known values in enum order, no duplicates. */
function list<T extends string>(values: readonly T[], raw: RawSearchParams, key: string): T[] {
  const v = raw[key];
  const parts = (Array.isArray(v) ? v : [v ?? ""]).flatMap((s) => s.split(","));
  return values.filter((x) => parts.includes(x));
}

function int(raw: RawSearchParams, key: string): number | null {
  const s = first(raw, key);
  return s === null ? null : parseIntegerInput(s);
}

export function parseCatalogQuery(raw: RawSearchParams): CatalogQuery {
  const make = first(raw, "make");
  const model = first(raw, "model");
  const page = int(raw, "page");
  return {
    filters: {
      make,
      // A model only makes sense under its make ("toyota:camry" needs make=toyota).
      model: make !== null && model?.startsWith(`${make}:`) ? model : null,
      yearFrom: int(raw, "yearFrom"),
      yearTo: int(raw, "yearTo"),
      priceFrom: int(raw, "priceFrom"),
      priceTo: int(raw, "priceTo"),
      city: first(raw, "city"),
      fuel: list<FuelType>(FUEL_TYPES, raw, "fuel"),
      steering: oneOf<SteeringSide>(STEERING_SIDES, first(raw, "steering")),
      transmission: list<Transmission>(TRANSMISSIONS, raw, "transmission"),
    },
    sort: oneOf(SORTS, first(raw, "sort")) ?? DEFAULT_SORT,
    page: page !== null && page >= 1 ? page : 1,
  };
}

/** Only non-default values go to the URL, in a fixed order — equal searches give equal links. */
export function catalogQueryString(q: Partial<CatalogQuery>): string {
  const f = q.filters ?? EMPTY_FILTERS;
  const p = new URLSearchParams();
  const set = (key: string, v: string | number | null) => {
    if (v !== null) p.set(key, String(v));
  };
  set("make", f.make);
  set("model", f.make === null ? null : f.model);
  set("yearFrom", f.yearFrom);
  set("yearTo", f.yearTo);
  set("priceFrom", f.priceFrom);
  set("priceTo", f.priceTo);
  set("city", f.city);
  if (f.fuel.length > 0) p.set("fuel", f.fuel.join(","));
  set("steering", f.steering);
  if (f.transmission.length > 0) p.set("transmission", f.transmission.join(","));
  if (q.sort && q.sort !== DEFAULT_SORT) p.set("sort", q.sort);
  if (q.page && q.page > 1) p.set("page", String(q.page));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export const SORT_LABELS: Record<Sort, string> = {
  fresh: "Сначала новые объявления",
  price_asc: "Сначала дешевле",
  price_desc: "Сначала дороже",
  year_desc: "Сначала новее по году",
  mileage_asc: "Сначала с меньшим пробегом",
};

/** Page numbers with gaps: (5, 10) → [1, "gap", 4, 5, 6, "gap", 10]. */
export function pageItems(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((n) => pages.add(n));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((n) => pages.add(n));
  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  for (const n of sorted) {
    const prev = out.at(-1);
    if (typeof prev === "number" && n - prev > 1) out.push("gap");
    out.push(n);
  }
  return out;
}
