import type { MileageUnit } from "./enums.js";

export const KM_PER_MILE = 1.609344;

/**
 * Converts a mileage value to whole kilometres.
 * Returns null for negative, non-finite or non-numeric input.
 */
export function normalizeMileage(value: number, unit: MileageUnit): number | null {
  if (!Number.isFinite(value) || value < 0) return null;
  const km = unit === "mi" ? value * KM_PER_MILE : value;
  return Math.round(km);
}
