import type { ListingStatus } from "@repo/core";
import type { Listing, PriceHistory, Seller, Vehicle } from "@repo/db";
import type { CarCardData } from "@/lib/listing-card";
import type { MarketPosition } from "@/lib/market";

/**
 * Shapes the pages read. Today they come from fixtures (`./fixtures.ts`), later from Prisma —
 * only `./listings.ts` changes, pages and components stay as they are.
 */

/** Market estimate for one listing. Computed by the future market-price job, not stored yet. */
export interface MarketEstimate {
  position: MarketPosition;
  /** Listing price vs. the median of similar listings, signed whole percent (-8 = 8% below). */
  diffPercent: number;
  /** How many similar listings the median is based on. */
  comparedCount: number;
  /** Window of similar listings, days. */
  periodDays: number;
  computedAt: Date;
}

/** One observed price, oldest first. The first entry is the price at publication. */
export type PricePoint = Pick<PriceHistory, "priceAmount" | "currency" | "priceUsd" | "observedAt">;

export interface SellerProfile extends Pick<Seller, "type" | "name"> {
  /** Seller.createdAt — "на сайте с …". */
  memberSince: Date;
  /** Active listings of this seller on the site, including this one. */
  activeListings: number;
}

export interface ContactInfo {
  /** E.164 (normalizePhone). */
  phone: string;
  telegramUsername: Seller["telegramUsername"];
  /** Seller said the phone has WhatsApp. */
  whatsapp: boolean;
}

/** Statuses a visitor can open. Drafts are 404; archived (auto-expired) shows like removed. */
export type PublicListingStatus = Exclude<ListingStatus, "draft">;

export interface ListingDetail extends Omit<CarCardData, "seller" | "vehicle" | "publishedAt"> {
  status: PublicListingStatus;
  /** Every listing a visitor can open was published, so the date is always known. */
  publishedAt: Date;
  closedAt: Listing["closedAt"];
  description: Listing["description"];
  vehicle: CarCardData["vehicle"] & Pick<Vehicle, "vin" | "bodyType" | "drivetrain" | "color">;
  seller: SellerProfile;
  contacts: ContactInfo;
  marketEstimate: MarketEstimate | null;
  priceHistory: PricePoint[];
}

export const SORTS = ["fresh", "price_asc", "price_desc", "year_desc", "mileage_asc"] as const;
export type Sort = (typeof SORTS)[number];

export interface SearchResult {
  items: CarCardData[];
  total: number;
  /** 1-based, clamped to [1, pageCount]. */
  page: number;
  pageCount: number;
}
