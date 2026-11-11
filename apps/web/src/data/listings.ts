import { EMPTY_FILTERS, type FilterValues } from "@/lib/filters";
import type { CarCardData } from "@/lib/listing-card";
import { FIXTURE_LISTINGS, FIXTURE_NOW, FIXTURE_USD_KGS_RATE } from "./fixtures";
import {
  makeCounts,
  makeOptions,
  rankSimilar,
  search,
  type MakeCount,
  type MakeOptionData,
} from "./search";
import type { ListingDetail, SearchResult, Sort } from "./types";

/**
 * The only door from pages to listing data. Today — fixtures; later — Prisma queries with the same
 * signatures (async already, so pages won't change).
 */

const active = () => FIXTURE_LISTINGS.filter((l) => l.status === "active");

/** Strip detail-only fields: pages get exactly what a card renders (and no phones in lists). */
function toCard(l: ListingDetail): CarCardData {
  return {
    id: l.id,
    make: l.make,
    model: l.model,
    trim: l.trim,
    year: l.year,
    priceAmount: l.priceAmount,
    currency: l.currency,
    priceUsd: l.priceUsd,
    negotiable: l.negotiable,
    mileageKm: l.mileageKm,
    customsCleared: l.customsCleared,
    availability: l.availability,
    publishedAt: l.publishedAt,
    city: l.city,
    vehicle: {
      fuelType: l.vehicle.fuelType,
      transmission: l.vehicle.transmission,
      steering: l.vehicle.steering,
      originCountry: l.vehicle.originCountry,
      engineVolumeCc: l.vehicle.engineVolumeCc,
      bodyType: l.vehicle.bodyType,
    },
    photos: l.photos,
    seller: { type: l.seller.type, name: l.seller.name },
    market: l.market,
  };
}

/** Reference time for "на сайте N дней". Fixed in fixtures so screenshots are stable. */
export function getNow(): Promise<Date> {
  return Promise.resolve(FIXTURE_NOW);
}

/** KGS per 1 USD. Later: latest ExchangeRate via getUsdKgsRate from @repo/db. */
export function getUsdKgsRate(): Promise<number> {
  return Promise.resolve(FIXTURE_USD_KGS_RATE);
}

/** Any public status (active / sold / archived / removed); null → 404. */
export function getListing(id: string): Promise<ListingDetail | null> {
  return Promise.resolve(FIXTURE_LISTINGS.find((l) => l.id === id) ?? null);
}

export function searchListings(
  filters: FilterValues,
  sort: Sort,
  page: number,
): Promise<SearchResult> {
  return Promise.resolve(search(active().map(toCard), filters, sort, page));
}

export function getLatestListings(limit: number): Promise<CarCardData[]> {
  return Promise.resolve(search(active().map(toCard), EMPTY_FILTERS, "fresh", 1, limit).items);
}

/** Same model, then same segment within ±20% of the price (rankSimilar); never the listing itself. */
export function getSimilarListings(listing: ListingDetail, limit: number): Promise<CarCardData[]> {
  const candidate = (l: ListingDetail) => ({ ...l, bodyType: l.vehicle.bodyType });
  return Promise.resolve(
    rankSimilar(candidate(listing), active().map(candidate), limit).map(toCard),
  );
}

export interface CatalogStats {
  /** Active listings in the city (null = whole country). */
  total: number;
  makes: MakeCount[];
}

export function getCatalogStats(city: string | null): Promise<CatalogStats> {
  const cards = active()
    .filter((l) => city === null || l.city === city)
    .map(toCard);
  return Promise.resolve({ total: cards.length, makes: makeCounts(cards) });
}

/** For "Вы смотрели": active listings in the given order; unknown or closed ids are skipped. */
export function getListingsByIds(ids: readonly string[]): Promise<CarCardData[]> {
  const byId = new Map(active().map((l) => [l.id, l]));
  return Promise.resolve(
    ids.flatMap((id) => {
      const l = byId.get(id);
      return l ? [toCard(l)] : [];
    }),
  );
}

export function getMakeOptions(): Promise<MakeOptionData[]> {
  return Promise.resolve(makeOptions(active()));
}

export function getCities(): Promise<string[]> {
  const cities = new Set(active().flatMap((l) => (l.city ? [l.city] : [])));
  return Promise.resolve([...cities].sort((a, b) => a.localeCompare(b, "ru")));
}
