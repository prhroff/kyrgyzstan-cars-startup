import { CarCard } from "@/components/ui/CarCard";
import type { CarCardData } from "@/lib/listing-card";
import { cx } from "@/lib/cx";

export function listingHref(id: string): string {
  return `/cars/${encodeURIComponent(id)}`;
}

export interface ListingGridProps {
  listings: readonly CarCardData[];
  usdKgsRate: number;
  now: Date;
  /** How many first cards load their photo eagerly (above the fold). */
  priorityCount?: number;
  /** "wide" = 4 columns on desktop (no sidebar), "narrow" = 3 (next to filters). */
  columns?: "wide" | "narrow";
  className?: string;
}

export function ListingGrid({
  listings,
  usdKgsRate,
  now,
  priorityCount = 0,
  columns = "wide",
  className,
}: ListingGridProps) {
  return (
    <ul
      className={cx(
        "grid grid-cols-1 gap-4 sm:grid-cols-2",
        columns === "wide" ? "lg:grid-cols-3 xl:grid-cols-4" : "xl:grid-cols-3",
        className,
      )}
    >
      {listings.map((l, i) => (
        <li key={l.id} className="flex">
          <CarCard
            className="w-full"
            listing={l}
            href={listingHref(l.id)}
            usdKgsRate={usdKgsRate}
            now={now}
            priority={i < priorityCount}
          />
        </li>
      ))}
    </ul>
  );
}
