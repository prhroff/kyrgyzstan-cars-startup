"use client";

import { Link } from "react-aria-components";
import { focusRing } from "@/components/ui/styles";
import type { MakeCount } from "@/data/search";
import { allMakesHref, makeHref } from "@/lib/collections";
import { cx } from "@/lib/cx";
import { formatNumber } from "@/lib/format";

const MAX_MAKES = 16;

/** Text list, no brand logos: name + listing count in gray. 4 columns on desktop, 2 on mobile. */
export function PopularMakes({
  makes,
  city,
  className,
}: {
  makes: readonly MakeCount[];
  city: string | null;
  className?: string;
}) {
  if (makes.length === 0) return null;
  return (
    <section aria-labelledby="makes-heading" className={cx("flex flex-col gap-5", className)}>
      <div className="flex items-baseline gap-4">
        <h2 id="makes-heading" className="text-2xl font-semibold tracking-tight text-fg">
          Популярные марки
        </h2>
        <Link
          href={allMakesHref(city)}
          className={cx(
            "rounded-sm text-base font-medium text-accent ui-hover:underline",
            focusRing,
          )}
        >
          Все марки
        </Link>
      </div>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-2 lg:grid-cols-4">
        {makes.slice(0, MAX_MAKES).map((m) => (
          <li key={m.id}>
            <Link
              href={makeHref(m.id, city)}
              className={cx(
                "inline-flex min-h-11 items-center gap-2 rounded-sm text-base text-fg ui-hover:text-accent lg:min-h-9",
                focusRing,
              )}
            >
              {m.label}
              <span className="text-fg-subtle tabular-nums">{formatNumber(m.count)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
