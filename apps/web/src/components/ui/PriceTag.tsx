import type { Currency } from "@repo/core";
import { TrendingDown, TrendingUp, Equal } from "lucide-react";
import { cx } from "@/lib/cx";
import { convertPrice, formatPrice, roundApprox } from "@/lib/format";
import { MARKET_LABELS } from "@/lib/labels";
import type { MarketPosition } from "@/lib/market";
import { Badge, type BadgeTone } from "./Badge";

export interface PriceTagProps {
  /** Price as listed, whole units of `currency`. */
  amount: number;
  currency: Currency;
  /** Stored USD equivalent (Listing.priceUsd), shown "≈" for KGS listings. */
  priceUsd: number;
  /** KGS per 1 USD. */
  usdKgsRate: number;
  market?: MarketPosition | null;
  size?: "md" | "lg";
  className?: string;
}

const MARKET_TONE: Record<MarketPosition, BadgeTone> = {
  below: "market-below",
  fair: "market-fair",
  above: "market-above",
};

const MARKET_ICON = { below: TrendingDown, fair: Equal, above: TrendingUp } as const;

function Approx() {
  return (
    <>
      <span aria-hidden>≈{String.fromCodePoint(0xa0)}</span>
      <span className="sr-only">примерно </span>
    </>
  );
}

/**
 * Big and exact: the price in the seller's currency. Small with "≈": the conversion.
 * The listed price is never marked "≈", so what the seller wrote stays traceable.
 */
export function PriceTag({
  amount,
  currency,
  priceUsd,
  usdKgsRate,
  market = null,
  size = "md",
  className,
}: PriceTagProps) {
  const other: Currency = currency === "USD" ? "KGS" : "USD";
  // KGS listings carry a stored USD equivalent (Listing.priceUsd); USD → KGS is converted here.
  const converted = roundApprox(
    currency === "USD" ? convertPrice(amount, "USD", "KGS", usdKgsRate) : priceUsd,
    other,
  );

  return (
    <div className={cx("flex flex-col gap-1", className)}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className={cx(
            "font-semibold whitespace-nowrap text-fg tabular-nums",
            size === "lg" ? "text-3xl tracking-tight" : "text-xl",
          )}
        >
          {formatPrice(amount, currency)}
        </span>
        {market && (
          <Badge tone={MARKET_TONE[market]} icon={MARKET_ICON[market]}>
            {MARKET_LABELS[market]}
          </Badge>
        )}
      </div>
      <span className="text-sm whitespace-nowrap text-fg-muted tabular-nums">
        <Approx />
        {formatPrice(converted, other)}
      </span>
    </div>
  );
}
