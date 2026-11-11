"use client";

import type { SellerType } from "@repo/core";
import { Camera, MapPin, Ship, Store, Truck, User, type LucideIcon } from "lucide-react";
import { Link } from "react-aria-components";
import { cx } from "@/lib/cx";
import { formatDaysOnSite, formatEngineVolume, formatMileageKm } from "@/lib/format";
import { FUEL_LABELS, TRANSMISSION_LABELS } from "@/lib/labels";
import { cardBadges, sellerLabel, type CarCardData, type CardBadge } from "@/lib/listing-card";
import { Badge, type BadgeTone } from "./Badge";
import { CarPhoto } from "./CarPhoto";
import { PriceTag } from "./PriceTag";

const BADGE: Record<CardBadge, { label: string; tone: BadgeTone; icon?: LucideIcon }> = {
  in_transit: { label: "В пути", tone: "neutral", icon: Truck },
  not_cleared: { label: "Не растаможен", tone: "warning" },
  // Seller's statement, not a check: neutral (success is reserved for real checks).
  cleared: { label: "Растаможен", tone: "neutral" },
};

const SELLER_ICON: Record<SellerType, LucideIcon> = {
  private: User,
  dealer: Store,
  importer: Ship,
};

export interface CarCardProps {
  listing: CarCardData;
  href: string;
  usdKgsRate: number;
  /** Reference time for "на сайте N дней" — passed in so server and client render the same. */
  now: Date;
  /** First cards above the fold. */
  priority?: boolean;
  /**
   * Top-right corner of the photo, reserved for the favorite toggle (MVP, not built yet).
   * Kept free of other overlays so adding it later does not reshape the card.
   */
  favoriteSlot?: React.ReactNode;
  className?: string;
}

/** Facts line: "2.5 л · Гибрид · Автомат". Unknown values are skipped, never guessed. */
export function carSpecs(listing: CarCardData): string {
  const v = listing.vehicle;
  return [
    formatEngineVolume(v.engineVolumeCc),
    v.fuelType && FUEL_LABELS[v.fuelType],
    v.transmission && TRANSMISSION_LABELS[v.transmission],
  ]
    .filter(Boolean)
    .join(" · ");
}

export function carTitle(listing: CarCardData): string {
  return `${listing.make} ${listing.model}`;
}

export function CarCard({
  listing,
  href,
  usdKgsRate,
  now,
  priority = false,
  favoriteSlot,
  className,
}: CarCardProps) {
  const title = carTitle(listing);
  const specs = carSpecs(listing);
  const mileage = formatMileageKm(listing.mileageKm);
  const SellerIcon = SELLER_ICON[listing.seller.type];
  const daysOnSite = formatDaysOnSite(listing.publishedAt, now);
  const badges = cardBadges(listing);

  return (
    <article
      className={cx(
        // No border, no shadow: the photo carries the card (docs/design/direction.md).
        "group relative flex min-w-0 flex-col gap-3 rounded-lg",
        "has-ui-focus:outline-2 has-ui-focus:outline-offset-4 has-ui-focus:outline-focus",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-lg">
        <CarPhoto
          photo={listing.photos[0]}
          alt={`${title}, ${listing.year}`}
          sizes="(min-width: 1280px) 300px, (min-width: 640px) 50vw, 100vw"
          priority={priority}
        />
        {favoriteSlot && <div className="absolute top-2 right-2 z-10">{favoriteSlot}</div>}
        {listing.photos.length > 1 && (
          <span className="absolute right-2 bottom-2 inline-flex h-6 items-center gap-1 rounded-full bg-overlay px-2 text-xs font-medium text-fg-on-accent">
            <Camera aria-hidden className="size-3.5" />
            {listing.photos.length}
            <span className="sr-only"> фото</span>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="text-base font-semibold text-fg">
            {/* Stretched link: the whole card is clickable, but only the title is announced. */}
            <Link
              href={href}
              className="line-clamp-2 outline-none after:absolute after:inset-0 ui-hover:underline"
            >
              {title}, {listing.year}
            </Link>
          </h3>
          {listing.trim && <p className="truncate text-sm text-fg-muted">{listing.trim}</p>}
        </div>

        <dl className="flex flex-col gap-1 text-sm text-fg-muted">
          {(mileage ?? specs) && (
            <div className="flex min-w-0 flex-wrap gap-x-2">
              <dt className="sr-only">Пробег и характеристики</dt>
              <dd className="min-w-0 truncate">{[mileage, specs].filter(Boolean).join(" · ")}</dd>
            </div>
          )}
          {listing.city && (
            <div className="flex items-center gap-1">
              <dt>
                <MapPin aria-hidden className="size-4 shrink-0" />
                <span className="sr-only">Город</span>
              </dt>
              <dd className="truncate">{listing.city}</dd>
            </div>
          )}
        </dl>

        {badges.length > 0 && (
          <ul aria-label="Метки" className="flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <li key={b}>
                <Badge tone={BADGE[b].tone} {...(BADGE[b].icon ? { icon: BADGE[b].icon } : {})}>
                  {BADGE[b].label}
                </Badge>
              </li>
            ))}
          </ul>
        )}

        <PriceTag
          className="mt-auto"
          amount={listing.priceAmount}
          currency={listing.currency}
          priceUsd={listing.priceUsd}
          usdKgsRate={usdKgsRate}
          market={listing.market}
        />

        {/* Wraps instead of truncating: the seller name matters more than the line staying single. */}
        <p className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-subtle">
          <span className="flex max-w-full min-w-0 items-center gap-1.5">
            <SellerIcon aria-hidden className="size-3.5 shrink-0" />
            <span className="truncate">
              <span className="sr-only">Продавец: </span>
              {sellerLabel(listing.seller)}
            </span>
          </span>
          {daysOnSite && <span className="ml-auto shrink-0">{daysOnSite}</span>}
        </p>
      </div>
    </article>
  );
}
