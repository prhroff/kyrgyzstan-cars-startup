/**
 * Kyrgyz mobile numbering plan — the ONLY place operator prefixes live.
 *
 * A prefix is the first 3 digits of the 9-digit national significant number
 * (+996 XXX YYY YYY). Prefixes get reassigned and new ranges appear, so an
 * unknown prefix is NOT a reason to reject a number: normalizePhone returns it
 * with `knownPrefix: false`. Update this list when operators publish new ranges.
 */
export const KG_MOBILE_OPERATORS = {
  megacom: [
    "550",
    "551",
    "552",
    "553",
    "554",
    "555",
    "556",
    "557",
    "558",
    "559",
    "755",
    "990",
    "995",
    "996",
    "997",
    "998",
    "999",
  ],
  beeline: [
    "220",
    "221",
    "222",
    "223",
    "224",
    "225",
    "226",
    "227",
    "228",
    "229",
    "770",
    "771",
    "772",
    "773",
    "774",
    "775",
    "776",
    "777",
    "778",
    "779",
  ],
  o: [
    "500",
    "501",
    "502",
    "503",
    "504",
    "505",
    "506",
    "507",
    "508",
    "509",
    "700",
    "701",
    "702",
    "703",
    "704",
    "705",
    "706",
    "707",
    "708",
    "709",
  ],
} as const satisfies Record<string, readonly string[]>;

export type KgMobileOperator = keyof typeof KG_MOBILE_OPERATORS;

export const KG_COUNTRY_CODE = "996";

/** Length of the national significant number (without country code and trunk 0). */
export const KG_NSN_LENGTH = 9;

/** First digit of the NSN for geographic (landline) numbers, e.g. 312 — Bishkek. */
export const KG_FIXED_LEADING_DIGIT = "3";

const prefixToOperator = new Map<string, KgMobileOperator>(
  (Object.entries(KG_MOBILE_OPERATORS) as [KgMobileOperator, readonly string[]][]).flatMap(
    ([operator, prefixes]) => prefixes.map((p) => [p, operator] as const),
  ),
);

export function lookupKgOperator(nsn: string): KgMobileOperator | null {
  return prefixToOperator.get(nsn.slice(0, 3)) ?? null;
}
