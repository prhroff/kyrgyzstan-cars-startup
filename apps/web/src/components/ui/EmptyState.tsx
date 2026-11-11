import type { LucideIcon } from "lucide-react";
import { cx } from "@/lib/cx";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Usually one or two Buttons. */
  actions?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actions,
  className,
}: EmptyStateProps) {
  return (
    <div className={cx("flex flex-col items-center gap-4 px-4 py-12 text-center", className)}>
      <span className="flex size-12 items-center justify-center rounded-lg border border-line bg-surface-subtle">
        <Icon aria-hidden className="size-6 text-fg-muted" />
      </span>
      <div className="flex max-w-sm flex-col gap-1">
        <h3 className="text-lg font-semibold text-fg">{title}</h3>
        {description && <p className="text-sm text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap justify-center gap-3">{actions}</div>}
    </div>
  );
}
