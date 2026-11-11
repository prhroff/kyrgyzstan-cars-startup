import {
  KG_COUNTRY_CODE,
  KG_FIXED_LEADING_DIGIT,
  KG_NSN_LENGTH,
  lookupKgOperator,
  type KgMobileOperator,
} from "./kg-operators.js";

export interface NormalizedPhone {
  /** E.164, e.g. "+996555123456". */
  e164: string;
  kind: "mobile" | "fixed";
  /** Mobile operator if the prefix is known; always null for fixed lines. */
  operator: KgMobileOperator | null;
  /** False for a mobile number whose prefix is not in KG_MOBILE_OPERATORS (still valid by length). */
  knownPrefix: boolean;
}

/** Separators people put inside phone numbers: spaces, dashes (incl. unicode), dots, brackets. */
const SEPARATORS = /[\s\-‐-―.()]/g;

/**
 * Normalizes a Kyrgyz phone number written in any common local format to E.164.
 *
 * Accepts: "0555 12 34 56", "555-12-34-56", "+996555123456", "996 555 123 456",
 * "00996555123456", "(0312) 12-34-56". Returns null for anything that is not a
 * KG number of valid length (foreign numbers, letters, wrong length).
 */
export function normalizePhone(input: string): NormalizedPhone | null {
  const compact = input.trim().replace(SEPARATORS, "");
  if (!/^\+?\d+$/.test(compact)) return null;

  const nsn = extractNsn(compact);
  if (nsn === null) return null;

  const first = nsn.charAt(0);
  if (first === "0" || first === "1") return null;

  const e164 = `+${KG_COUNTRY_CODE}${nsn}`;
  if (first === KG_FIXED_LEADING_DIGIT) {
    return { e164, kind: "fixed", operator: null, knownPrefix: true };
  }
  const operator = lookupKgOperator(nsn);
  return { e164, kind: "mobile", operator, knownPrefix: operator !== null };
}

/** Convenience wrapper: just the E.164 string or null. */
export function toE164(input: string): string | null {
  return normalizePhone(input)?.e164 ?? null;
}

function extractNsn(compact: string): string | null {
  let digits: string;
  if (compact.startsWith("+")) {
    digits = compact.slice(1);
    if (!digits.startsWith(KG_COUNTRY_CODE)) return null;
    digits = digits.slice(KG_COUNTRY_CODE.length);
  } else if (compact.startsWith(`00${KG_COUNTRY_CODE}`)) {
    digits = compact.slice(2 + KG_COUNTRY_CODE.length);
  } else if (
    compact.length === KG_COUNTRY_CODE.length + KG_NSN_LENGTH &&
    compact.startsWith(KG_COUNTRY_CODE)
  ) {
    digits = compact.slice(KG_COUNTRY_CODE.length);
  } else if (compact.length === KG_NSN_LENGTH + 1 && compact.startsWith("0")) {
    digits = compact.slice(1);
  } else {
    digits = compact;
  }
  return digits.length === KG_NSN_LENGTH ? digits : null;
}
