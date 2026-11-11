"use client";

import { Link } from "react-aria-components";
import { cx } from "@/lib/cx";
import { SITE_NAME } from "./Header";
import { focusRing } from "./styles";

const COLUMNS = [
  {
    title: "Покупателям",
    links: [
      { href: "/cars", label: "Все объявления" },
      { href: "/help/market-price", label: "Как мы считаем цену к рынку" },
      { href: "/help/safety", label: "Как не попасть на мошенников" },
    ],
  },
  {
    title: "Продавцам",
    links: [
      { href: "/sell", label: "Подать объявление" },
      { href: "/business", label: "Для бизнеса" },
    ],
  },
  {
    title: "Сайт",
    links: [
      { href: "/help", label: "Помощь" },
      { href: "/login", label: "Вход" },
    ],
  },
] as const;

const link = cx("rounded-sm text-sm text-fg-muted ui-hover:text-fg", focusRing);

/** Shared footer: link columns and a plain statement of what the site does and does not do. */
export function Footer({ className }: { className?: string }) {
  return (
    <footer className={cx("mt-16 bg-surface-muted", className)}>
      <div className="mx-auto flex max-w-content flex-col gap-10 px-4 py-12 lg:flex-row lg:justify-between">
        <div className="flex max-w-sm flex-col gap-3">
          <p className="text-xl font-bold tracking-tight text-fg">{SITE_NAME}</p>
          <p className="text-sm text-fg-muted">
            Объявления о продаже авто в Кыргызстане. Мы не осматриваем машины и не участвуем в
            сделке. Перед покупкой проверьте машину на СТО и не переводите предоплату до осмотра.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title} className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-fg">{col.title}</p>
              <ul className="flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={link}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
    </footer>
  );
}
