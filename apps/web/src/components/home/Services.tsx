"use client";

import { LifeBuoy, Plus, Scale, ScanLine, type LucideIcon } from "lucide-react";
import { Link } from "react-aria-components";
import { focusRing } from "@/components/ui/styles";
import { cx } from "@/lib/cx";

interface Service {
  icon: LucideIcon;
  label: string;
  /** Null = not available yet ("скоро"), rendered as text, not a link. */
  href: string | null;
}

const SERVICES: readonly Service[] = [
  { icon: Plus, label: "Подать объявление", href: "/sell" },
  { icon: Scale, label: "Как мы считаем цену к рынку", href: "/help/market-price" },
  { icon: LifeBuoy, label: "Как не попасть на мошенников", href: "/help/safety" },
  { icon: ScanLine, label: "Проверка по VIN", href: null },
];

const tile = "flex h-full flex-col gap-3 rounded-lg bg-surface-muted p-4";

export function Services({ className }: { className?: string }) {
  return (
    <section aria-labelledby="services-heading" className={cx("flex flex-col gap-5", className)}>
      <h2 id="services-heading" className="text-2xl font-semibold tracking-tight text-fg">
        Сервисы
      </h2>
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {SERVICES.map(({ icon: Icon, label, href }) => {
          const body = (
            <>
              <span className="flex size-10 items-center justify-center rounded-full bg-surface">
                <Icon aria-hidden className="size-5 text-fg" />
              </span>
              <span className="text-base font-medium text-fg">{label}</span>
            </>
          );
          return (
            <li key={label}>
              {href ? (
                <Link
                  href={href}
                  className={cx(tile, "transition-colors ui-hover:bg-surface-strong", focusRing)}
                >
                  {body}
                </Link>
              ) : (
                <div className={tile}>
                  {body}
                  <span className="self-start rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-fg-muted">
                    Скоро
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
