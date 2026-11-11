import { FUEL_TYPES, type FuelType, type SteeringSide, type Transmission } from "@repo/core";

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

/**
 * Fuel filter as buyers think about it: five groups. Hybrids open into subtypes; "Газ" covers both
 * gas-only and petrol/gas cars. The URL and the query still use FuelType values.
 */
export const FUEL_GROUPS = [
  { id: "petrol", label: "Бензин", types: ["petrol"] },
  { id: "diesel", label: "Дизель", types: ["diesel"] },
  { id: "gas", label: "Газ", types: ["lpg", "petrol_lpg"] },
  { id: "hybrid", label: "Гибрид", types: ["hybrid", "plug_in_hybrid", "erev"] },
  { id: "electric", label: "Электро", types: ["electric"] },
] as const satisfies readonly { id: string; label: string; types: readonly FuelType[] }[];

export type FuelGroup = (typeof FUEL_GROUPS)[number];

/** Hybrid subtypes in plain words (shown inside "Гибрид"). */
export const HYBRID_SUBTYPE_LABELS: Record<"hybrid" | "plug_in_hybrid" | "erev", string> = {
  hybrid: "Обычный — без зарядки от розетки",
  plug_in_hybrid: "Подключаемый — заряжается от розетки",
  erev: "С увеличенным запасом хода (EREV)",
};

export type GroupState = "all" | "some" | "none";

export function fuelGroupState(selected: readonly FuelType[], group: FuelGroup): GroupState {
  const n = group.types.filter((t) => selected.includes(t)).length;
  return n === 0 ? "none" : n === group.types.length ? "all" : "some";
}

/** Toggles a whole group: anything selected → clear it; nothing → select all. Keeps enum order. */
export function toggleFuelGroup(selected: readonly FuelType[], group: FuelGroup): FuelType[] {
  const types: readonly FuelType[] = group.types;
  const next =
    fuelGroupState(selected, group) === "none"
      ? [...selected, ...types]
      : selected.filter((t) => !types.includes(t));
  return FUEL_TYPES.filter((t) => next.includes(t));
}

export function toggleFuelType(selected: readonly FuelType[], type: FuelType): FuelType[] {
  const next = selected.includes(type) ? selected.filter((t) => t !== type) : [...selected, type];
  return FUEL_TYPES.filter((t) => next.includes(t));
}
