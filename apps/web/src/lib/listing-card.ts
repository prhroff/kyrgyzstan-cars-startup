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
