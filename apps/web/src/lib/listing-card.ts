import type { Listing, Photo, Seller, Vehicle } from "@repo/db";
import { SELLER_TYPE_LABELS } from "./labels";
import type { MarketPosition } from "./market";

/**
 * What a listing card / gallery needs. Field types come from the Prisma models,
 * names are flattened from relations (make.name, city.name, …) by the future query layer.
 */
export interface CarCardData extends Pick<
  Listing,
  | "id"
  | "year"
  | "priceAmount"
  | "currency"
  | "priceUsd"
  | "negotiable"
  | "mileageKm"
  | "customsCleared"
  | "availability"
  | "publishedAt"
> {
  make: string;
  model: string;
  /** Trim / generation line, e.g. "2.5 Prestige". */
  trim: string | null;
  city: string | null;
  vehicle: Pick<
    Vehicle,
    "fuelType" | "transmission" | "steering" | "originCountry" | "engineVolumeCc"
  >;
  photos: CarPhoto[];
  /** Only listings posted with us reach the site, so a seller is always known. */
  seller: Pick<Seller, "type" | "name">;
  /** Null = no market estimate yet. */
  market: MarketPosition | null;
}

export type CarPhoto = Pick<Photo, "id" | "url" | "width" | "height">;

/**
 * Seller line on the card: "Частное лицо" or "Дилер «Демо Моторс»".
 * Private sellers are never named on the card (privacy). A name that already has quotes is not re-quoted.
 */
export function sellerLabel(seller: CarCardData["seller"]): string {
  const label = SELLER_TYPE_LABELS[seller.type];
  const name = seller.name?.trim();
  if (seller.type === "private" || !name) return label;
  return /[«»"]/.test(name) ? `${label} ${name}` : `${label} «${name}»`;
}

export type CardBadge = "in_transit" | "not_cleared" | "cleared";

export const MAX_CARD_BADGES = 2;

/**
 * Status badges on a card, most important first, at most two (the market label is separate).
 * "Торг" is not a badge — it lives in the specs. Unknown customs (null) gives no badge.
 */
export function cardBadges(l: Pick<CarCardData, "availability" | "customsCleared">): CardBadge[] {
  const all: (CardBadge | false)[] = [
    l.availability === "in_transit" && "in_transit",
    l.customsCleared === false && "not_cleared",
    l.customsCleared === true && "cleared",
  ];
  return all.filter((b): b is CardBadge => b !== false).slice(0, MAX_CARD_BADGES);
}
