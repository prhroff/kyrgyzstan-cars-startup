"use client";

import {
  BatteryCharging,
  Bus,
  Car,
  CarFront,
  Globe,
  Ship,
  TrendingDown,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-aria-components";
import { focusRing } from "@/components/ui/styles";
import { COLLECTIONS, collectionHref } from "@/lib/collections";
import { cx } from "@/lib/cx";

/**
 * Placeholder pictures: one neutral icon style on a light-gray tile. Real images come later
 * (commercially licensed only — never taken from other sites).
 */
const ICON: Record<string, LucideIcon> = {
  sedan: Car,
  crossover: CarFront,
  minivan: Bus,
  electric: BatteryCharging,
  korea: Globe,
  china: Ship,
  "in-transit": Truck,
  "below-market": TrendingDown,
};

/** Grid on desktop, horizontal scroll on mobile. Each tile is a catalog search in the URL. */
export function CollectionTiles({ city, className }: { city: string | null; className?: string }) {
  return (
    <nav aria-label="Подборки" className={className}>
      <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
        {COLLECTIONS.map((c) => {
          const Icon = ICON[c.id] ?? Car;
          return (
            <li key={c.id} className="w-36 shrink-0 snap-start lg:w-auto">
              <Link
                href={collectionHref(c, city)}
                className={cx(
                  "group relative flex h-28 flex-col justify-between overflow-hidden rounded-lg bg-surface-muted p-4 transition-colors ui-hover:bg-surface-strong lg:h-32",
                  focusRing,
                )}
              >
                <span className="text-base font-medium text-fg">{c.label}</span>
                <Icon
                  aria-hidden
                  strokeWidth={1.25}
                  className="size-12 self-end text-fg-subtle transition-transform group-data-hovered:scale-105 lg:size-14"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
