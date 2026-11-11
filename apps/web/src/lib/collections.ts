import { EMPTY_FILTERS, type FilterValues } from "./filters";
import { catalogQueryString } from "./search-params";

/** Home tiles: each one is a catalog search with filters in the URL. */
export interface Collection {
  id: string;
  label: string;
  filters: Partial<FilterValues>;
}

export const COLLECTIONS: readonly Collection[] = [
  { id: "sedan", label: "Седаны", filters: { body: ["sedan"] } },
  { id: "crossover", label: "Кроссоверы", filters: { body: ["suv", "crossover"] } },
  { id: "minivan", label: "Минивэны", filters: { body: ["minivan"] } },
  {
    id: "electric",
    label: "Электро и гибриды",
    filters: { fuel: ["hybrid", "plug_in_hybrid", "erev", "electric"] },
  },
  { id: "korea", label: "Из Кореи", filters: { origin: ["korea"] } },
  { id: "china", label: "Из Китая", filters: { origin: ["china"] } },
  { id: "in-transit", label: "В пути", filters: { inTransit: true } },
  { id: "below-market", label: "Ниже рынка", filters: { belowMarket: true } },
];

/** Catalog URL for a collection in a city (null = whole country). */
export function collectionHref(c: Collection, city: string | null): string {
  return `/cars${catalogQueryString({ filters: { ...EMPTY_FILTERS, ...c.filters, city } })}`;
}

/** Catalog URL for one make in a city. */
export function makeHref(makeId: string, city: string | null): string {
  return `/cars${catalogQueryString({ filters: { ...EMPTY_FILTERS, make: makeId, city } })}`;
}

/** "Все марки": the catalog in the city with the make picker open (`pick` is not a filter). */
export function allMakesHref(city: string | null): string {
  const qs = catalogQueryString({ filters: { ...EMPTY_FILTERS, city } });
  return `/cars${qs}${qs ? "&" : "?"}pick=make`;
}
