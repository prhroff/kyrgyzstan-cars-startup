import { maxVehicleYear, MIN_VEHICLE_YEAR, normalizeVin, VIN_LENGTH } from "@repo/core";
import { formatNumber } from "./format";

/** "Введено 15 из 17 символов" — counts what the VIN will be after normalization (no spaces/dashes). */
export function vinLengthMessage(input: string): string {
  return `Введено ${formatNumber(normalizeVin(input).length)} из ${VIN_LENGTH} символов`;
}

/** "Укажите год с 1950 по 2027" — same bounds as @repo/core and the DB check. */
export function yearRangeMessage(now: Date = new Date()): string {
  return `Укажите год с ${MIN_VEHICLE_YEAR} по ${maxVehicleYear(now)}`;
}
