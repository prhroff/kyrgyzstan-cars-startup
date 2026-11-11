"use client";

import { Plus } from "lucide-react";
import { Link } from "react-aria-components";
import { cx } from "@/lib/cx";
import { LinkButton } from "./LinkButton";
import { focusRing } from "./styles";

export const SITE_NAME = "Авто КР";

/** Top bar: logo, catalog link, the main action "Подать объявление" (always visible, also on 375px). */
export function Header({ className }: { className?: string }) {
  return (
    <header className={cx("border-b border-line bg-surface", className)}>
      <div className="mx-auto flex h-14 max-w-content items-center gap-4 px-4 sm:h-16">
        <Link
          href="/"
          className={cx("rounded-md text-lg font-semibold text-fg sm:text-xl", focusRing)}
        >
          {SITE_NAME}
        </Link>
        <nav aria-label="Основная навигация" className="hidden sm:block">
          <Link
            href="/cars"
            className={cx(
              "inline-flex h-11 items-center rounded-md px-3 text-base text-fg-muted ui-hover:text-fg",
              focusRing,
            )}
          >
            Объявления
          </Link>
        </nav>
        <LinkButton href="/sell" iconLeading={Plus} className="ml-auto">
          Подать объявление
        </LinkButton>
      </div>
    </header>
  );
}
