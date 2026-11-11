import { MapPin } from "lucide-react";
import { cx } from "@/lib/cx";
import { MARKET_LABELS } from "@/lib/labels";
import { MARKET_POSITIONS, type MarketPosition } from "@/lib/market";

export interface MarketRangeProps {
  /** Null = no estimate yet. */
  position: MarketPosition | null;
  /** Signed whole percent vs. similar listings; shown under the scale when known. */
  diffPercent?: number | null;
  className?: string;
}

const ACTIVE: Record<MarketPosition, { bar: string; text: string }> = {
  below: { bar: "bg-market-below", text: "text-market-below" },
  fair: { bar: "bg-market-fair", text: "text-market-fair" },
  above: { bar: "bg-market-above", text: "text-market-above" },
};

function diffText(diff: number): string {
  if (diff === 0) return "Цена совпадает с похожими объявлениями";
  return `На ${Math.abs(diff)}% ${diff < 0 ? "ниже" : "выше"} похожих объявлений`;
}

/**
 * Three-zone scale with the listing's zone marked. Deliberately no exact point on the scale:
 * until the market formula exists, a precise-looking marker would claim more than we know.
 */
export function MarketRange({ position, diffPercent = null, className }: MarketRangeProps) {
  // No estimate: no scale at all — an empty scale would still look like a measurement.
  if (position === null) {
    return <p className={cx("text-sm text-fg-muted", className)}>Цена к рынку: нет данных</p>;
  }
  return (
    <div className={cx("flex flex-col gap-2", className)}>
      <p className="sr-only">{`Цена к рынку: ${MARKET_LABELS[position].toLowerCase()}`}</p>
      <div aria-hidden className="grid grid-cols-3 gap-1">
        {MARKET_POSITIONS.map((p) => {
          const active = p === position;
          return (
            <div key={p} className="flex flex-col items-center gap-1">
              <MapPin className={cx("size-4", active ? ACTIVE[p].text : "invisible")} />
              <div
                className={cx(
                  "h-2 w-full rounded-full",
                  active ? ACTIVE[p].bar : "bg-surface-strong",
                )}
              />
              <span
                className={cx(
                  "text-xs",
                  active ? cx("font-semibold", ACTIVE[p].text) : "text-fg-subtle",
                )}
              >
                {MARKET_LABELS[p]}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-fg-muted">
        {diffPercent === null ? MARKET_LABELS[position] : diffText(diffPercent)}
      </p>
    </div>
  );
}
