import { maxVehicleYear, MIN_VEHICLE_YEAR, normalizeVin, VIN_LENGTH } from "@repo/core";
import { formatNumber } from "./format";

/**
 * "Введено 15 из 17 символов — проверьте, не пропущен ли символ" (too many → "нет ли лишнего").
 * Counts the VIN after normalization (no spaces/dashes).
 */
export function vinLengthMessage(input: string): string {
  const n = formatNumber(normalizeVin(input).length);
  if (normalizeVin(input).length > VIN_LENGTH) {
    return `Введено ${n} из ${VIN_LENGTH} символов — проверьте, нет ли лишнего символа`;
  }
  return `Введено ${n} из ${VIN_LENGTH} символов — проверьте, не пропущен ли символ`;
}

/** "Укажите год с 1950 по 2027" — same bounds as @repo/core and the DB check. */
export function yearRangeMessage(now: Date = new Date()): string {
  return `Укажите год с ${MIN_VEHICLE_YEAR} по ${maxVehicleYear(now)}`;
}
