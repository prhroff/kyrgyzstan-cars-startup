/**
 * VIN validation per ISO 3779 / FMVSS 115.
 *
 * Format: 17 chars, digits and latin letters except I, O, Q.
 * Check digit (position 9) is mandatory for North America (WMI 1–5) and China (L),
 * but many Korean/Japanese/European VINs don't use it. So for other regions a
 * mismatch is reported as "not_applicable" rather than invalid.
 */

export type VinChecksumStatus = "ok" | "mismatch" | "not_applicable";

export type VinValidationResult =
  | { valid: true; vin: string; checksum: Exclude<VinChecksumStatus, "mismatch"> }
  | { valid: false; vin: string; error: "length" | "characters" | "checksum" };

export const VIN_LENGTH = 17;
const VIN_PATTERN = new RegExp(`^[A-HJ-NPR-Z0-9]{${VIN_LENGTH}}$`);
const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2] as const;
const TRANSLITERATION: Readonly<Record<string, number>> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  P: 7,
  R: 9,
  S: 2,
  T: 3,
  U: 4,
  V: 5,
  W: 6,
  X: 7,
  Y: 8,
  Z: 9,
};
/** WMI first characters of regions where the check digit is mandatory. */
const CHECK_DIGIT_REQUIRED = new Set(["1", "2", "3", "4", "5", "L"]);

/** Uppercases and strips spaces/dashes. Does not validate. */
export function normalizeVin(input: string): string {
  return input.toUpperCase().replace(/[\s-]/g, "");
}

/** Computes the expected check digit ("0"–"9" or "X") for a format-valid VIN. */
export function computeVinCheckDigit(vin: string): string {
  let sum = 0;
  for (let i = 0; i < VIN_LENGTH; i++) {
    const ch = vin.charAt(i);
    const value = /\d/.test(ch) ? Number(ch) : (TRANSLITERATION[ch] ?? 0);
    sum += value * (WEIGHTS[i] ?? 0);
  }
  const remainder = sum % 11;
  return remainder === 10 ? "X" : String(remainder);
}

export function validateVin(input: string): VinValidationResult {
  const vin = normalizeVin(input);
  if (vin.length !== VIN_LENGTH) return { valid: false, vin, error: "length" };
  if (!VIN_PATTERN.test(vin)) return { valid: false, vin, error: "characters" };

  const matches = computeVinCheckDigit(vin) === vin.charAt(8);
  if (matches) return { valid: true, vin, checksum: "ok" };
  if (CHECK_DIGIT_REQUIRED.has(vin.charAt(0))) return { valid: false, vin, error: "checksum" };
  return { valid: true, vin, checksum: "not_applicable" };
}

export function isValidVin(input: string): boolean {
  return validateVin(input).valid;
}
