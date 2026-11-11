import { useId } from "react";
import type { PricePoint } from "@/data/types";
import { cx } from "@/lib/cx";
import { formatDate, formatPrice, percentChange } from "@/lib/format";
import { priceChanges } from "@/lib/trust";
import { PriceHistoryChart } from "./PriceHistoryChart";

export interface PriceHistoryProps {
  /** Oldest first; the first point is the price at publication. */
  points: readonly PricePoint[];
  now: Date;
  className?: string;
}

function changeText(cur: PricePoint, prev: PricePoint): string {
  const pct = percentChange(cur.priceUsd, prev.priceUsd);
  if (pct === 0) return "";
  return pct < 0 ? `−${Math.abs(pct)}%` : `+${pct}%`;
}

/** Step chart + the same changes as a list (newest first). Empty: "Цена не менялась". */
export function PriceHistory({ points, now, className }: PriceHistoryProps) {
  const headingId = useId();
  const changed = priceChanges(points) > 0;
  return (
    <section aria-labelledby={headingId} className={cx("flex flex-col gap-3", className)}>
      <h2 id={headingId} className="text-lg font-semibold text-fg">
        История цены
      </h2>
      {!changed ? (
        <p className="text-sm text-fg-muted">
          {points[0]
            ? `Цена не менялась с публикации ${formatDate(points[0].observedAt, now)}`
            : "История цены: нет данных"}
        </p>
      ) : (
        <>
          <PriceHistoryChart points={points} now={now} />
          <ol className="flex flex-col divide-y divide-line text-sm">
            {[...points].reverse().map((p, i, list) => {
              const prev = list[i + 1];
              const change = prev ? changeText(p, prev) : "";
              return (
                <li
                  key={p.observedAt.toISOString()}
                  className="flex items-baseline justify-between gap-3 py-2"
                >
                  <span className="text-fg-muted">
                    {formatDate(p.observedAt, now)}
                    {!prev && <span> · публикация</span>}
                  </span>
                  <span className="flex items-baseline gap-2 whitespace-nowrap tabular-nums">
                    {change && <span className="text-fg-muted">{change}</span>}
                    <span className="font-medium text-fg">
                      {formatPrice(p.priceAmount, p.currency)}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </section>
  );
}
