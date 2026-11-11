import type { Currency } from "@repo/core";
import { TrendingDown, TrendingUp, Equal } from "lucide-react";
import { cx } from "@/lib/cx";
import { convertPrice, formatPrice } from "@/lib/format";
import { MARKET_LABELS } from "@/lib/labels";
import type { MarketPosition } from "@/lib/market";
import { Badge, type BadgeTone } from "./Badge";

export interface PriceTagProps {
  /** Price as listed, whole units of `currency`. */
  amount: number;
  currency: Currency;
  /** Stored USD equivalent (Listing.priceUsd). Used instead of re-converting when the listing is in KGS. */
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
 * USD first (main reference on the KG market), KGS below.
 * Whatever was converted is marked "≈", so the originally listed price stays traceable.
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
  const isUsd = currency === "USD";
  const usd = isUsd ? amount : priceUsd;
  const kgs = isUsd ? convertPrice(amount, "USD", "KGS", usdKgsRate) : amount;

  return (
    <div className={cx("flex flex-col gap-1", className)}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className={cx(
            "font-semibold whitespace-nowrap text-fg tabular-nums",
            size === "lg" ? "text-2xl" : "text-xl",
          )}
        >
          {!isUsd && <Approx />}
          {formatPrice(usd, "USD")}
        </span>
        {market && (
          <Badge tone={MARKET_TONE[market]} icon={MARKET_ICON[market]}>
            {MARKET_LABELS[market]}
          </Badge>
        )}
      </div>
      <span className="text-sm whitespace-nowrap text-fg-muted tabular-nums">
        {isUsd && <Approx />}
        {formatPrice(kgs, "KGS")}
      </span>
    </div>
  );
}
