"use client";

import { Link } from "react-aria-components";
import { cx } from "@/lib/cx";
import { SITE_NAME } from "./Header";
import { focusRing } from "./styles";

const link = cx("rounded-md text-sm text-fg-muted ui-hover:text-fg", focusRing);

/** Footer: links and the plain statement of what the site does and does not do. */
export function Footer({ className }: { className?: string }) {
  return (
    <footer className={cx("border-t border-line bg-surface-subtle", className)}>
      <div className="mx-auto flex max-w-content flex-col gap-4 px-4 py-8 sm:flex-row sm:justify-between">
        <div className="flex max-w-prose flex-col gap-2">
          <p className="text-base font-semibold text-fg">{SITE_NAME}</p>
          <p className="text-sm text-fg-muted">
            Объявления о продаже авто в Кыргызстане. Мы не осматриваем машины и не участвуем в
            сделке. Перед покупкой проверьте машину на СТО и не переводите предоплату до осмотра.
          </p>
        </div>
        <nav aria-label="Ссылки в подвале">
          <ul className="flex flex-col gap-2">
            <li>
              <Link href="/cars" className={link}>
                Объявления
              </Link>
            </li>
            <li>
              <Link href="/sell" className={link}>
                Подать объявление
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
