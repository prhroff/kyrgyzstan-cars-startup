import type { Currency } from "@repo/core";
import type { Db } from "./client.js";

export class MissingExchangeRateError extends Error {
  constructor(at: Date) {
    super(`No USD→KGS exchange rate on or before ${at.toISOString().slice(0, 10)}`);
    this.name = "MissingExchangeRateError";
  }
}

/** Latest USD→KGS rate (KGS per 1 USD) effective on `at`. Throws if none is stored. */
export async function getUsdKgsRate(db: Db, at: Date = new Date()): Promise<number> {
  const row = await db.exchangeRate.findFirst({
    where: { base: "USD", quote: "KGS", date: { lte: at } },
    orderBy: { date: "desc" },
    select: { rate: true },
  });
  if (!row) throw new MissingExchangeRateError(at);
  return row.rate.toNumber();
}

/** Converts a whole-unit price to whole USD. Never returns 0 for a positive amount. */
export function toPriceUsd(amount: number, currency: Currency, usdKgsRate: number): number {
  if (currency === "USD") return amount;
  if (!(usdKgsRate > 0)) throw new RangeError(`Invalid USD→KGS rate: ${usdKgsRate}`);
  return Math.max(1, Math.round(amount / usdKgsRate));
}
