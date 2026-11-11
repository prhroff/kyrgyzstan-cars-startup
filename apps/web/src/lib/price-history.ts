import type { PricePoint } from "@/data/types";

export interface StepChart {
  /** SVG path "M x y H x V y …": each price holds until the next change, the last one until `now`. */
  path: string;
  /** One dot per observed price (where the step starts). */
  dots: { x: number; y: number }[];
}

export interface ChartBox {
  width: number;
  height: number;
  /** Inner padding so the stroke and dots are not clipped. */
  pad: number;
}

const round = (n: number) => Math.round(n * 10) / 10;

/**
 * Step-chart geometry in USD (listings in KGS have priceUsd too, so mixed currencies compare).
 * Time on X from the first observation to `now`; price on Y, higher price = higher on the chart.
 * A flat history is drawn in the middle. Fewer than 2 points → null (nothing to chart).
 */
export function buildStepChart(
  points: readonly PricePoint[],
  now: Date,
  box: ChartBox,
): StepChart | null {
  if (points.length < 2) return null;
  const first = points[0];
  if (!first) return null;
  const t0 = first.observedAt.getTime();
  const t1 = Math.max(now.getTime(), points.at(-1)?.observedAt.getTime() ?? t0);
  const prices = points.map((p) => p.priceUsd);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const innerW = box.width - 2 * box.pad;
  const innerH = box.height - 2 * box.pad;

  const x = (t: number) => round(box.pad + (t1 === t0 ? 0 : ((t - t0) / (t1 - t0)) * innerW));
  const y = (usd: number) =>
    round(max === min ? box.height / 2 : box.pad + ((max - usd) / (max - min)) * innerH);

  const dots = points.map((p) => ({ x: x(p.observedAt.getTime()), y: y(p.priceUsd) }));
  const [start, ...rest] = dots;
  if (!start) return null;
  let path = `M${start.x} ${start.y}`;
  for (const d of rest) path += ` H${d.x} V${d.y}`;
  path += ` H${x(t1)}`;
  return { path, dots };
}
