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

/** Engine volume in litres: 2487 → "2.5 л"; null (EVs, unknown) → null. */
export function formatEngineVolume(cc: number | null): string | null {
  return cc === null ? null : `${(cc / 1000).toFixed(1)}${NBSP}л`;
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

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * How long a listing has been on the site, counted in full 24-hour days:
 * "опубликовано сегодня" / "на сайте 5 дней". Null = not published yet.
 * `now` comes from the caller so server and client render the same text.
 */
export function formatDaysOnSite(publishedAt: Date | null, now: Date): string | null {
  if (publishedAt === null) return null;
  // A future date (clock skew) counts as today.
  const days = Math.max(0, Math.floor((now.getTime() - publishedAt.getTime()) / DAY_MS));
  if (days === 0) return "опубликовано сегодня";
  return `на сайте ${formatNumber(days)} ${pluralRu(days, ["день", "дня", "дней"])}`;
}

/** Genitive month names: "30 октября", "с марта 2026". */
const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
] as const;

/** Calendar parts in Kyrgyzstan time (UTC+6, no DST), so server and client agree. */
function bishkekParts(date: Date): { day: number; month: number; year: number } {
  const shifted = new Date(date.getTime() + 6 * 60 * 60 * 1000);
  return {
    day: shifted.getUTCDate(),
    month: shifted.getUTCMonth(),
    year: shifted.getUTCFullYear(),
  };
}

function monthGenitive(month: number): string {
  const name = MONTHS_GENITIVE[month];
  if (name === undefined) throw new RangeError(`invalid month: ${month}`);
  return name;
}

/** "30 октября 2026"; without the year when it equals `now`'s year: "30 октября". */
export function formatDate(date: Date, now: Date): string {
  const d = bishkekParts(date);
  const base = `${d.day}${NBSP}${monthGenitive(d.month)}`;
  return d.year === bishkekParts(now).year ? base : `${base} ${d.year}`;
}

/** "На сайте с марта 2026" — the phrase is whole, so it can be translated as one string. */
export function formatMemberSince(date: Date): string {
  const d = bishkekParts(date);
  return `На сайте с ${monthGenitive(d.month)} ${d.year}`;
}

/** "+996 555 123 456" for KG numbers in E.164; anything else is returned as is. */
export function formatPhone(e164: string): string {
  const m = /^\+996(\d{3})(\d{3})(\d{3})$/.exec(e164);
  return m ? `+996${NBSP}${m[1]}${NBSP}${m[2]}${NBSP}${m[3]}` : e164;
}

/** Signed change between two prices in whole percent: (15500, 16500) → -6. */
export function percentChange(current: number, previous: number): number {
  if (!(previous > 0)) throw new RangeError(`invalid previous price: ${previous}`);
  return Math.round(((current - previous) / previous) * 100);
}
