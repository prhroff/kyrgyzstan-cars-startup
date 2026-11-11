"use client";

import { ChevronRight } from "lucide-react";
import { Link } from "react-aria-components";
import { cx } from "@/lib/cx";
import type { Crumb } from "@/lib/breadcrumbs";
import { focusRing } from "./styles";

export interface BreadcrumbsProps {
  items: readonly Crumb[];
  className?: string;
}

/**
 * Quiet path above the H1: small, muted, wraps on phones instead of scrolling.
 * The current page (href null) is plain text with aria-current.
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Навигация по разделам" className={className}>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-sm text-fg-muted">
        {items.map((c, i) => (
          <li key={`${c.label}-${String(i)}`} className="flex min-w-0 items-center gap-1">
            {i > 0 && <ChevronRight aria-hidden className="size-3.5 shrink-0 text-fg-subtle" />}
            {c.href === null ? (
              <span aria-current="page" className="truncate text-fg-subtle">
                {c.label}
              </span>
            ) : (
              <Link
                href={c.href}
                className={cx(
                  "truncate rounded-sm transition-colors ui-hover:text-fg ui-hover:underline",
                  focusRing,
                )}
              >
                {c.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
