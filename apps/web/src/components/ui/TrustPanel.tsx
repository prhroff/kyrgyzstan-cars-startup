import { CircleAlert, CircleDashed, Info, type LucideIcon } from "lucide-react";
import { useId } from "react";
import { cx } from "@/lib/cx";
import type { TrustItem, TrustStatus } from "@/lib/trust";

export interface TrustPanelProps {
  items: readonly TrustItem[];
  /** Heading level inside the page outline. */
  headingLevel?: 2 | 3;
  className?: string;
}

/** Status is shown by the icon and the fact itself — no "подтверждено" labels (tone of voice). */
const STATUS: Record<TrustStatus, { icon: LucideIcon; className: string; srLabel: string | null }> =
  {
    // Neutral: a fact is not a verdict. The green check is reserved for real checks
    // (e.g. an inspection at a named service station) — see docs/tone-of-voice.md.
    fact: { icon: Info, className: "text-fg-muted", srLabel: null },
    warning: { icon: CircleAlert, className: "text-warning", srLabel: "Обратите внимание: " },
    unknown: { icon: CircleDashed, className: "text-fg-subtle", srLabel: null },
  };

/** "Что известно об этой машине": facts the site checked, each with a source and a date. */
export function TrustPanel({ items, headingLevel = 2, className }: TrustPanelProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={cx("flex flex-col gap-4 rounded-lg bg-surface-muted p-5 sm:p-6", className)}
    >
      <Heading id={headingId} className="text-xl font-semibold tracking-tight text-fg">
        Что известно об этой машине
      </Heading>
      <ul className="flex flex-col divide-y divide-line">
        {items.map((item) => {
          const s = STATUS[item.status];
          const Icon = s.icon;
          const meta = [item.source, item.date].filter(Boolean).join(" · ");
          return (
            <li key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              <Icon aria-hidden className={cx("mt-0.5 size-5 shrink-0", s.className)} />
              <div className="flex min-w-0 flex-col gap-0.5">
                <p
                  className={cx(
                    "text-base",
                    item.status === "unknown" ? "text-fg-muted" : "text-fg",
                  )}
                >
                  {s.srLabel && <span className="sr-only">{s.srLabel}</span>}
                  {item.title}
                </p>
                {item.detail && <p className="text-sm break-words text-fg-muted">{item.detail}</p>}
                {meta && <p className="text-xs text-fg-subtle">{meta}</p>}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="border-t border-line pt-3 text-sm text-fg-muted">
        Мы не осматриваем машины. Перед покупкой проверьте машину на СТО.
      </p>
    </section>
  );
}
