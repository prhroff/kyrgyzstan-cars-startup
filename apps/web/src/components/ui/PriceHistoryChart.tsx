import type { PricePoint } from "@/data/types";
import { buildStepChart } from "@/lib/price-history";

const BOX = { width: 320, height: 96, pad: 8 };

/**
 * The only inline SVG in the app (allowlisted in ui-rules.test.ts, see docs/decisions.md):
 * a 2–10 point step chart is ~40 lines here vs. ~100 KB for a chart library.
 * Colors come from tokens via `stroke-*` / `fill-*` classes. Decorative: the list next to it
 * carries the same data for screen readers.
 */
export function PriceHistoryChart({ points, now }: { points: readonly PricePoint[]; now: Date }) {
  const chart = buildStepChart(points, now, BOX);
  if (!chart) return null;
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${BOX.width} ${BOX.height}`}
      className="h-auto w-full max-w-md overflow-visible"
    >
      <line
        x1={BOX.pad}
        x2={BOX.width - BOX.pad}
        y1={BOX.height - 1}
        y2={BOX.height - 1}
        className="stroke-line"
        strokeWidth={1}
      />
      <path
        d={chart.path}
        className="fill-none stroke-accent"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {chart.dots.map((d, i) => (
        <circle
          key={i}
          cx={d.x}
          cy={d.y}
          r={3.5}
          className="fill-surface stroke-accent"
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}
