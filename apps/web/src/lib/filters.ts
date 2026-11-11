import type { FuelType, SteeringSide, Transmission } from "@repo/core";

export interface FilterValues {
  make: string | null;
  model: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  /** Whole USD. */
  priceFrom: number | null;
  priceTo: number | null;
  city: string | null;
  fuel: FuelType[];
  steering: SteeringSide | null;
  transmission: Transmission[];
}

export const EMPTY_FILTERS: FilterValues = {
  make: null,
  model: null,
  yearFrom: null,
  yearTo: null,
  priceFrom: null,
  priceTo: null,
  city: null,
  fuel: [],
  steering: null,
  transmission: [],
};

/** "15 500" / "15500" → 15500; empty or non-numeric → null. Non-negative integers only. */
export function parseIntegerInput(raw: string): number | null {
  const digits = raw.replace(/\s/g, "");
  if (!/^\d+$/.test(digits)) return null;
  const value = Number(digits);
  return Number.isSafeInteger(value) ? value : null;
}

/** True when both ends are set and from > to. */
export function isInvalidRange(from: number | null, to: number | null): boolean {
  return from !== null && to !== null && from > to;
}

/** Number of filter groups the user has set (for the "Фильтры (3)" button). */
export function countActiveFilters(f: FilterValues): number {
  return [
    f.make !== null,
    f.model !== null,
    f.yearFrom !== null || f.yearTo !== null,
    f.priceFrom !== null || f.priceTo !== null,
    f.city !== null,
    f.fuel.length > 0,
    f.steering !== null,
    f.transmission.length > 0,
  ].filter(Boolean).length;
}
