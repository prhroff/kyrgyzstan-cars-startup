import type { Currency } from "./enums.js";

export interface ParsedPrice {
  /** Integer amount in WHOLE currency units (dollars / soms). */
  amount: number;
  currency: Currency;
  /** True when the currency was not written in the text (taken from defaultCurrency or the heuristic). */
  currencyInferred: boolean;
  /** True when a bare number < 1000 was read as thousands ("15.5" → 15 500). */
  scaleInferred: boolean;
}

export interface ParsePriceOptions {
  /** Currency to assume when the text has none (e.g. a Telegram channel that always posts in USD). Beats the heuristic. */
  defaultCurrency?: Currency;
}

/** Without an explicit currency, amounts below this are assumed USD, otherwise KGS. */
export const USD_KGS_HEURISTIC_THRESHOLD = 300_000;
/** Bare numbers below this (no currency, no multiplier) are read as thousands. */
export const BARE_THOUSANDS_THRESHOLD = 1000;
/** Postgres INTEGER upper bound — prices are stored as Int. */
const MAX_AMOUNT = 2_147_483_647;
/** Unicode KGS sign (U+20C0), normalized to the word "сом" before parsing. */
const SOM_SIGN = String.fromCodePoint(0x20c0);

const CURRENCY_MARKERS: readonly { pattern: RegExp; currency: Currency }[] = [
  {
    pattern: /^(?:\$|us\$|usd|у\.?\s?е\.?|долл?(?:ар(?:а|ов)?)?\.?|бакс(?:а|ов)?)$/u,
    currency: "USD",
  },
  { pattern: /^(?:сом(?:а|ов)?|kgs|som|с\.?)$/u, currency: "KGS" },
];

const MULTIPLIERS: readonly { pattern: RegExp; factor: number }[] = [
  { pattern: /^(?:k|к|т\.?|тыс\.?|тысяч[аи]?)$/u, factor: 1_000 },
  { pattern: /^(?:m|млн\.?|миллион(?:а|ов)?|лям(?:а|ов)?)$/u, factor: 1_000_000 },
];

/** Splits the text into: prefix currency, number, and the trailing words (multiplier / currency). */
const PRICE_PATTERN = /^(?<pre>\$|us\$|usd)?\s*(?<num>\d[\d\s',.]*?)\s*(?<rest>[^\d\s.,'].*)?$/u;

/**
 * Parses a free-form price as written in KG car ads.
 *
 * "15 500$" → 15500 USD · "1.2 млн сом" → 1 200 000 KGS · "15.5k" → 15 500 (USD by heuristic)
 * "15.5" → 15 500 USD (bare number < 1000 → thousands, flagged).
 * Returns null for zero, negative, ranges, other currencies or unparseable text.
 */
export function parsePrice(input: string, options: ParsePriceOptions = {}): ParsedPrice | null {
  // \s also covers NBSP, thin and narrow no-break spaces common in copied text.
  const text = input.toLowerCase().replaceAll(SOM_SIGN, " сом").replace(/\s+/g, " ").trim();
  const groups = PRICE_PATTERN.exec(text)?.groups;
  const num = groups?.num;
  if (groups === undefined || num === undefined) return null;

  const suffix = parseSuffix(groups.rest);
  if (suffix === null) return null;

  const prefixCurrency = groups.pre === undefined ? undefined : matchCurrency(groups.pre);
  if (prefixCurrency && suffix.currency && prefixCurrency !== suffix.currency) return null;
  const explicitCurrency = prefixCurrency ?? suffix.currency;
  const { factor } = suffix;

  const value = parseNumber(num, factor !== 1);
  if (value === null || value <= 0) return null;

  let scaleInferred = false;
  let amount = value * factor;
  if (explicitCurrency === undefined && factor === 1 && value < BARE_THOUSANDS_THRESHOLD) {
    amount = value * 1000;
    scaleInferred = true;
  }
  amount = Math.round(amount);
  if (amount <= 0 || amount > MAX_AMOUNT) return null;

  if (explicitCurrency) {
    return { amount, currency: explicitCurrency, currencyInferred: false, scaleInferred };
  }
  const currency =
    options.defaultCurrency ??
    (scaleInferred || amount < USD_KGS_HEURISTIC_THRESHOLD ? "USD" : "KGS");
  return { amount, currency, currencyInferred: true, scaleInferred };
}

interface Suffix {
  factor: number;
  currency: Currency | undefined;
}

/**
 * Parses what follows the number: optional multiplier then optional currency,
 * e.g. "млн сом", "k$", "тыс. долл", "$". Anything else (ranges, other words) → null.
 */
function parseSuffix(rest: string | undefined): Suffix | null {
  if (rest === undefined) return { factor: 1, currency: undefined };
  // Split glued tokens like "k$" by surrounding "$" with spaces.
  const tokens = rest.replace(/\$/g, " $ ").trim().split(/\s+/);

  let factor = 1;
  let i = 0;
  const first = tokens[0];
  const multiplier =
    first === undefined ? undefined : MULTIPLIERS.find((m) => m.pattern.test(first));
  if (multiplier) {
    factor = multiplier.factor;
    i = 1;
  }

  const remaining = tokens.slice(i).join(" ");
  if (remaining === "") return { factor, currency: undefined };
  const currency = matchCurrency(remaining);
  return currency === undefined ? null : { factor, currency };
}

function matchCurrency(token: string): Currency | undefined {
  return CURRENCY_MARKERS.find((c) => c.pattern.test(token))?.currency;
}

/**
 * Parses "15 500", "1.200.000", "15,500", "1,2", "15.5".
 * A single separator followed by exactly 3 digits is a thousands separator,
 * unless a multiplier follows ("1.250 млн" = 1.25 million).
 */
function parseNumber(raw: string, hasMultiplier: boolean): number | null {
  const s = raw.replace(/[\s']/g, "").replace(/[.,]$/, "");
  if (!/^\d+(?:[.,]\d+)*$/.test(s)) return null;

  const separators = s.match(/[.,]/g) ?? [];
  let normalized: string;
  if (separators.length === 0) {
    normalized = s;
  } else if (new Set(separators).size === 2) {
    // Both used: the last one is decimal, the rest are grouping.
    const lastIdx = Math.max(s.lastIndexOf("."), s.lastIndexOf(","));
    normalized = `${s.slice(0, lastIdx).replace(/[.,]/g, "")}.${s.slice(lastIdx + 1)}`;
  } else if (separators.length > 1) {
    // "1.200.000" — grouping only; every group must be 3 digits.
    const [head, ...groups] = s.split(/[.,]/);
    if (head === undefined || head.length > 3 || groups.some((g) => g.length !== 3)) return null;
    normalized = s.replace(/[.,]/g, "");
  } else {
    const [intPart = "", fracPart = ""] = s.split(/[.,]/);
    normalized =
      fracPart.length === 3 && !hasMultiplier ? intPart + fracPart : `${intPart}.${fracPart}`;
  }
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}
