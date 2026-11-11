import type { LucideIcon } from "lucide-react";
import { cx } from "@/lib/cx";

export type BadgeTone =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "market-below"
  | "market-fair"
  | "market-above";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted text-fg-muted",
  accent: "bg-accent-subtle text-accent",
  success: "bg-success-subtle text-success",
  warning: "bg-warning-subtle text-warning",
  danger: "bg-danger-subtle text-danger",
  "market-below": "bg-market-below-subtle text-market-below",
  "market-fair": "bg-market-fair-subtle text-market-fair",
  "market-above": "bg-market-above-subtle text-market-above",
};

export interface BadgeProps {
  tone?: BadgeTone;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

/** Static label. Not interactive — for filters use Checkbox / Button. */
export function Badge({ tone = "neutral", icon: Icon, children, className }: BadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex h-6 max-w-full items-center gap-1 rounded-md px-2 text-xs font-medium whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {Icon && <Icon aria-hidden className="size-3.5 shrink-0" />}
      <span className="truncate">{children}</span>
    </span>
  );
}
