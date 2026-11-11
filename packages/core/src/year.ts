/**
 * Allowed vehicle (model) year range — single source for UI validation, parsers and the DB check.
 * Upper bound is the next calendar year: model year N goes on sale in year N-1.
 */

export const MIN_VEHICLE_YEAR = 1950;

/** Latest allowed model year for the given moment (UTC calendar year + 1). */
export function maxVehicleYear(now: Date = new Date()): number {
  return now.getUTCFullYear() + 1;
}

export function isValidVehicleYear(year: number, now: Date = new Date()): boolean {
  return Number.isInteger(year) && year >= MIN_VEHICLE_YEAR && year <= maxVehicleYear(now);
}
