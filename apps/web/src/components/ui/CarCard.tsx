"use client";

import type { SourceType } from "@repo/core";
import { Camera, Globe, MapPin, Send, Store, Truck, User, type LucideIcon } from "lucide-react";
import { Link } from "react-aria-components";
import { cx } from "@/lib/cx";
import { formatMileageKm } from "@/lib/format";
import { FUEL_LABELS, SOURCE_TYPE_LABELS, TRANSMISSION_LABELS } from "@/lib/labels";
import type { CarCardData } from "@/lib/listing-card";
import { Badge } from "./Badge";
import { CarPhoto } from "./CarPhoto";
import { PriceTag } from "./PriceTag";

const SOURCE_ICON: Record<SourceType, LucideIcon> = {
  telegram: Send,
  dealer_feed: Store,
  site: Globe,
  user: User,
};

export interface CarCardProps {
  listing: CarCardData;
  href: string;
  usdKgsRate: number;
  /** First cards above the fold. */
  priority?: boolean;
  className?: string;
}

function engineLabel(cc: number | null): string | null {
  return cc === null ? null : `${(cc / 1000).toFixed(1)} л`;
}

/** Facts line: "2.5 л · Гибрид · Автомат". Unknown values are skipped, never guessed. */
export function carSpecs(listing: CarCardData): string {
  const v = listing.vehicle;
  return [
    engineLabel(v.engineVolumeCc),
    v.fuelType && FUEL_LABELS[v.fuelType],
    v.transmission && TRANSMISSION_LABELS[v.transmission],
  ]
    .filter(Boolean)
    .join(" · ");
}

export function carTitle(listing: CarCardData): string {
  return `${listing.make} ${listing.model}`;
}

export function CarCard({ listing, href, usdKgsRate, priority = false, className }: CarCardProps) {
  const title = carTitle(listing);
  const specs = carSpecs(listing);
  const mileage = formatMileageKm(listing.mileageKm);
  const SourceIcon = SOURCE_ICON[listing.source.type];

  return (
    <article
      className={cx(
        "group relative flex min-w-0 flex-col overflow-hidden rounded-lg border border-line bg-surface transition-colors",
        "has-ui-hover:border-line-strong",
        "has-ui-focus:outline-2 has-ui-focus:outline-offset-2 has-ui-focus:outline-focus",
        className,
      )}
    >
      <div className="relative">
        <CarPhoto
          photo={listing.photos[0]}
          alt={`${title}, ${listing.year}`}
          sizes="(min-width: 1280px) 300px, (min-width: 640px) 50vw, 100vw"
          priority={priority}
        />
        {listing.photos.length > 1 && (
          <span className="absolute right-2 bottom-2 inline-flex h-6 items-center gap-1 rounded-md bg-overlay px-2 text-xs font-medium text-fg-on-accent">
            <Camera aria-hidden className="size-3.5" />
            {listing.photos.length}
            <span className="sr-only"> фото</span>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="text-base font-semibold text-fg">
            {/* Stretched link: the whole card is clickable, but only the title is announced. */}
            <Link
              href={href}
              className="line-clamp-2 outline-none after:absolute after:inset-0 ui-hover:text-accent"
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

        {(listing.availability === "in_transit" ||
          listing.customsCleared !== null ||
          listing.negotiable === true) && (
          <ul aria-label="Метки" className="flex flex-wrap gap-1.5">
            {listing.availability === "in_transit" && (
              <li>
                <Badge tone="accent" icon={Truck}>
                  В пути
                </Badge>
              </li>
            )}
            {listing.customsCleared === true && (
              <li>
                <Badge tone="success">Растаможен</Badge>
              </li>
            )}
            {listing.customsCleared === false && (
              <li>
                <Badge tone="warning">Не растаможен</Badge>
              </li>
            )}
            {listing.negotiable === true && (
              <li>
                <Badge>Торг</Badge>
              </li>
            )}
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

        <p className="flex min-w-0 items-center gap-1.5 border-t border-line pt-3 text-xs text-fg-subtle">
          <SourceIcon aria-hidden className="size-3.5 shrink-0" />
          <span className="sr-only">Источник: {SOURCE_TYPE_LABELS[listing.source.type]}, </span>
          <span className="truncate">{listing.source.name}</span>
        </p>
      </div>
    </article>
  );
}
