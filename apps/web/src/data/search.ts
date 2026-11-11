import type { FilterValues } from "@/lib/filters";
import type { CarCardData } from "@/lib/listing-card";
import type { SearchResult, Sort } from "./types";

/**
 * In-memory search over fixtures. The same contract will be a Prisma query later
 * (indexes in schema.prisma already match these filters and sorts).
 */

export const PAGE_SIZE = 12;

/** "Mercedes-Benz" → "mercedes-benz". Stand-in for Make.slug until the DB is wired in. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Model id used by FilterValues.model: "<make slug>:<model slug>". */
export function modelId(make: string, model: string): string {
  return `${slugify(make)}:${slugify(model)}`;
}

export function matchesFilters(l: CarCardData, f: FilterValues): boolean {
  const v = l.vehicle;
  return (
    (f.make === null || slugify(l.make) === f.make) &&
    (f.model === null || modelId(l.make, l.model) === f.model) &&
    (f.yearFrom === null || l.year >= f.yearFrom) &&
    (f.yearTo === null || l.year <= f.yearTo) &&
    (f.priceFrom === null || l.priceUsd >= f.priceFrom) &&
    (f.priceTo === null || l.priceUsd <= f.priceTo) &&
    (f.city === null || l.city === f.city) &&
    // Unknown fuel / transmission / steering never match a set filter: we don't guess.
    (f.fuel.length === 0 || (v.fuelType !== null && f.fuel.includes(v.fuelType))) &&
    (f.transmission.length === 0 ||
      (v.transmission !== null && f.transmission.includes(v.transmission))) &&
    (f.steering === null || v.steering === f.steering)
  );
}

const time = (d: Date | null) => d?.getTime() ?? 0;

/** Ties and unknown values (null mileage) go last, then newest first — stable for pagination. */
export function compareListings(sort: Sort): (a: CarCardData, b: CarCardData) => number {
  const fresh = (a: CarCardData, b: CarCardData) =>
    time(b.publishedAt) - time(a.publishedAt) || a.id.localeCompare(b.id);
  switch (sort) {
    case "fresh":
      return fresh;
    case "price_asc":
      return (a, b) => a.priceUsd - b.priceUsd || fresh(a, b);
    case "price_desc":
      return (a, b) => b.priceUsd - a.priceUsd || fresh(a, b);
    case "year_desc":
      return (a, b) => b.year - a.year || fresh(a, b);
    case "mileage_asc":
      return (a, b) => {
        if (a.mileageKm === null || b.mileageKm === null) {
          return (a.mileageKm === null ? 1 : 0) - (b.mileageKm === null ? 1 : 0) || fresh(a, b);
        }
        return a.mileageKm - b.mileageKm || fresh(a, b);
      };
  }
}

export function search(
  listings: readonly CarCardData[],
  filters: FilterValues,
  sort: Sort,
  page: number,
  pageSize = PAGE_SIZE,
): SearchResult {
  const matched = listings.filter((l) => matchesFilters(l, filters)).sort(compareListings(sort));
  const pageCount = Math.max(1, Math.ceil(matched.length / pageSize));
  const current = Math.min(Math.max(1, Math.trunc(page)), pageCount);
  return {
    items: matched.slice((current - 1) * pageSize, current * pageSize),
    total: matched.length,
    page: current,
    pageCount,
  };
}

export interface MakeOptionData {
  id: string;
  label: string;
  models: { id: string; label: string }[];
}

/** Make → models present in the listings, alphabetical. */
export function makeOptions(listings: readonly CarCardData[]): MakeOptionData[] {
  const makes = new Map<string, MakeOptionData>();
  for (const l of listings) {
    const id = slugify(l.make);
    const make = makes.get(id) ?? { id, label: l.make, models: [] };
    const mid = modelId(l.make, l.model);
    if (!make.models.some((m) => m.id === mid)) make.models.push({ id: mid, label: l.model });
    makes.set(id, make);
  }
  const byLabel = (a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label);
  return [...makes.values()].map((m) => ({ ...m, models: m.models.sort(byLabel) })).sort(byLabel);
}

/** Price window for "same segment" similar listings: ±20% of the listing's USD price. */
export const SIMILAR_PRICE_TOLERANCE = 0.2;

export interface SimilarCandidate {
  id: string;
  make: string;
  model: string;
  priceUsd: number;
  /** The segment. Null = unknown segment: such listings match only by model. */
  bodyType: string | null;
}

/**
 * Similar listings: same model first (closest price first), then the same segment (body type)
 * within ±20% of the price. Nothing else — an unrelated car is not "similar", so fewer is fine.
 */
export function rankSimilar<T extends SimilarCandidate>(
  target: SimilarCandidate,
  candidates: readonly T[],
  limit: number,
): T[] {
  const model = modelId(target.make, target.model);
  const distance = (c: T) => Math.abs(c.priceUsd - target.priceUsd);
  const others = candidates.filter((c) => c.id !== target.id);
  const sameModel = others.filter((c) => modelId(c.make, c.model) === model);
  const sameSegment = others.filter(
    (c) =>
      modelId(c.make, c.model) !== model &&
      target.bodyType !== null &&
      c.bodyType === target.bodyType &&
      distance(c) <= target.priceUsd * SIMILAR_PRICE_TOLERANCE,
  );
  const byDistance = (a: T, b: T) => distance(a) - distance(b) || a.id.localeCompare(b.id);
  return [...sameModel.sort(byDistance), ...sameSegment.sort(byDistance)].slice(0, limit);
}
