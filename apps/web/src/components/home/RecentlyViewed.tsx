"use client";

import { useEffect, useState } from "react";
import { Link } from "react-aria-components";
import { fetchViewedListings } from "@/app/actions";
import { listingHref } from "@/components/listing/ListingGrid";
import { CarPhoto } from "@/components/ui/CarPhoto";
import { focusRing } from "@/components/ui/styles";
import { cx } from "@/lib/cx";
import { formatPrice } from "@/lib/format";
import type { CarCardData } from "@/lib/listing-card";
import { readViewed } from "@/lib/recently-viewed";

/**
 * "Вы смотрели": right column on wide screens, horizontal strip below that.
 * Reads ids from localStorage after mount; nothing stored (or storage blocked) → renders nothing.
 */
export function RecentlyViewed({
  variant,
  className,
}: {
  /** aside = right column from 1280px (wrapper rendered only with data); strip = below 1280px. */
  variant: "aside" | "strip";
  className?: string;
}) {
  const [items, setItems] = useState<CarCardData[]>([]);

  useEffect(() => {
    const ids = readViewed();
    if (ids.length === 0) return;
    let alive = true;
    fetchViewedListings(ids)
      .then((list) => {
        if (alive) setItems(list);
      })
      .catch(() => {
        // Network hiccup: the block is optional, stay hidden.
      });
    return () => {
      alive = false;
    };
  }, []);

  if (items.length === 0) return null;
  const headingId = `viewed-heading-${variant}`;
  const section = (
    <section
      aria-labelledby={headingId}
      className={cx(
        "flex flex-col gap-4",
        variant === "aside" ? "sticky top-6" : "xl:hidden",
        className,
      )}
    >
      <h2 id={headingId} className="text-xl font-semibold tracking-tight text-fg">
        Вы смотрели
      </h2>
      <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 xl:mx-0 xl:flex-col xl:overflow-visible xl:px-0">
        {items.map((l) => (
          <li key={l.id} className="w-56 shrink-0 xl:w-auto">
            <Link href={listingHref(l.id)} className={cx("group flex gap-3 rounded-md", focusRing)}>
              <span className="w-24 shrink-0">
                <CarPhoto photo={l.photos[0]} alt="" sizes="96px" className="rounded-sm" />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="line-clamp-2 text-sm font-medium text-fg group-data-hovered:underline">
                  {l.make} {l.model}, {l.year}
                </span>
                <span className="text-sm font-semibold whitespace-nowrap text-fg tabular-nums">
                  {formatPrice(l.priceAmount, l.currency)}
                </span>
                {l.city && <span className="truncate text-xs text-fg-subtle">{l.city}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
  return variant === "aside" ? (
    <aside className="hidden w-72 shrink-0 xl:block">{section}</aside>
  ) : (
    section
  );
}
