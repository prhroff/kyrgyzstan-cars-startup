import type { SourceType } from "@repo/core";
import type { Listing, Photo, Vehicle } from "@repo/db";
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
  source: { type: SourceType; name: string };
  /** Null = no market estimate yet. */
  market: MarketPosition | null;
}

export type CarPhoto = Pick<Photo, "id" | "url" | "width" | "height">;
