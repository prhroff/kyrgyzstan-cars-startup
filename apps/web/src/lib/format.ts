import type { Currency } from "@repo/core";

/** U+00A0 — keeps "15 500" and "$" on one line. */
const NBSP = String.fromCodePoint(0xa0);

const CURRENCY_SUFFIX: Record<Currency, string> = {
  USD: "$",
  KGS: "сом",
};

/** Groups thousands with NBSP: 1350000 → "1 350 000". Integers only (prices are whole units). */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) throw new RangeError(`not a finite number: ${value}`);
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  const digits = String(Math.abs(rounded));
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
}

/** "15 500 $", "1 350 000 сом" (Russian order: amount, then currency). */
export function formatPrice(amount: number, currency: Currency): string {
  return `${formatNumber(amount)}${NBSP}${CURRENCY_SUFFIX[currency]}`;
}

/**
 * Converts between USD and KGS with a USD→KGS rate (KGS per 1 USD).
 * Result is a whole unit; KGS is rounded to thousands (that is how prices are quoted in KG).
 */
export function convertPrice(
  amount: number,
  from: Currency,
  to: Currency,
  usdKgsRate: number,
): number {
  if (!(usdKgsRate > 0)) throw new RangeError(`invalid USD→KGS rate: ${usdKgsRate}`);
  if (from === to) return amount;
  if (from === "USD") return Math.round((amount * usdKgsRate) / 1000) * 1000;
  return Math.round(amount / usdKgsRate);
}

/** "86 000 км"; null → null (caller decides how to show "unknown"). */
export function formatMileageKm(km: number | null): string | null {
  return km === null ? null : `${formatNumber(km)}${NBSP}км`;
}

/** Russian plural form: pluralRu(21, ["объявление", "объявления", "объявлений"]) → "объявление". */
export function pluralRu(
  n: number,
  forms: readonly [one: string, few: string, many: string],
): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last === 1) return forms[0];
  if (last >= 2 && last <= 4) return forms[1];
  return forms[2];
}
