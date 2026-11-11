"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-aria-components";
import { cx } from "@/lib/cx";
import { pageItems } from "@/lib/search-params";
import { focusRing } from "./styles";

export interface PaginationProps {
  page: number;
  pageCount: number;
  /** Page URL without `page`, e.g. "/cars?make=kia". Links, so pages are shareable and crawlable. */
  baseHref: string;
  className?: string;
}

/** Adds `page` to a URL; page 1 has no parameter (one canonical URL per page). */
export function pageHref(baseHref: string, page: number): string {
  const [path = "", query = ""] = baseHref.split("?");
  const params = new URLSearchParams(query);
  if (page > 1) params.set("page", String(page));
  else params.delete("page");
  const s = params.toString();
  return s ? `${path}?${s}` : path;
}

const cell =
  "inline-flex h-11 min-w-11 items-center justify-center rounded-md px-3 text-base tabular-nums transition-colors";
const link = cx(cell, focusRing, "text-fg ui-hover:bg-surface-muted ui-pressed:bg-surface-strong");

export function Pagination({ page, pageCount, baseHref, className }: PaginationProps) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Страницы" className={cx("flex justify-center", className)}>
      <ul className="flex items-center justify-center gap-1">
        <li>
          {page > 1 ? (
            <Link
              href={pageHref(baseHref, page - 1)}
              className={link}
              aria-label="Предыдущая страница"
            >
              <ChevronLeft aria-hidden className="size-5" />
            </Link>
          ) : (
            <span aria-hidden className={cx(cell, "text-fg-disabled")}>
              <ChevronLeft className="size-5" />
            </span>
          )}
        </li>
        {/* 375px fits ~7 touch targets: phones get "5 из 12", numbers start at sm. */}
        <li className={cx(cell, "text-fg-muted sm:hidden")}>
          <span className="sr-only">Страница </span>
          {`${page} из ${pageCount}`}
        </li>
        {pageItems(page, pageCount).map((it, i) =>
          it === "gap" ? (
            <li key={`gap-${i}`} aria-hidden className="hidden sm:block">
              <span className={cx(cell, "text-fg-subtle")}>…</span>
            </li>
          ) : (
            <li key={it} className="hidden sm:block">
              {it === page ? (
                <span
                  aria-current="page"
                  className={cx(cell, "bg-accent font-medium text-fg-on-accent")}
                >
                  <span className="sr-only">Страница </span>
                  {it}
                </span>
              ) : (
                <Link href={pageHref(baseHref, it)} className={link}>
                  <span className="sr-only">Страница </span>
                  {it}
                </Link>
              )}
            </li>
          ),
        )}
        <li>
          {page < pageCount ? (
            <Link
              href={pageHref(baseHref, page + 1)}
              className={link}
              aria-label="Следующая страница"
            >
              <ChevronRight aria-hidden className="size-5" />
            </Link>
          ) : (
            <span aria-hidden className={cx(cell, "text-fg-disabled")}>
              <ChevronRight className="size-5" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
