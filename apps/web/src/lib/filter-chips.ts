import type { FuelType, OriginCountry } from "@repo/core";
import type { MakeOptionData } from "@/data/search";
import { FUEL_GROUPS, fuelGroupState, HYBRID_SUBTYPE_LABELS, type FilterValues } from "./filters";
import { formatPrice } from "./format";
import { BODY_LABELS, STEERING_LABELS, TRANSMISSION_LABELS } from "./labels";

/** Origin as a filter ("Из Кореи"), shorter than the spec phrase ("Пригнана из Кореи"). */
export const ORIGIN_FILTER_LABELS: Record<OriginCountry, string> = {
  korea: "Из Кореи",
  china: "Из Китая",
  usa: "Из США",
  japan: "Из Японии",
  uae: "Из ОАЭ",
  europe: "Из Европы",
  local: "Местные",
  other: "Из других стран",
};

export interface FilterChip {
  key: string;
  label: string;
  /** Filters with just this chip removed. */
  remove: (f: FilterValues) => FilterValues;
}

function range(from: number | null, to: number | null, fmt: (n: number) => string): string {
  if (from !== null && to !== null) return `${fmt(from)} – ${fmt(to)}`;
  if (from !== null) return `от ${fmt(from)}`;
  return `до ${fmt(to ?? 0)}`;
}

/** Active filters as removable pills, in the panel's order. */
export function filterChips(f: FilterValues, makes: readonly MakeOptionData[]): FilterChip[] {
  const chips: FilterChip[] = [];
  const make = makes.find((m) => m.id === f.make);
  if (f.q !== null) chips.push({ key: "q", label: `«${f.q}»`, remove: (x) => ({ ...x, q: null }) });
  if (f.make !== null) {
    chips.push({
      key: "make",
      label: make?.label ?? f.make,
      remove: (x) => ({ ...x, make: null, model: null }),
    });
  }
  if (f.model !== null) {
    chips.push({
      key: "model",
      label: make?.models.find((m) => m.id === f.model)?.label ?? f.model,
      remove: (x) => ({ ...x, model: null }),
    });
  }
  if (f.yearFrom !== null || f.yearTo !== null) {
    chips.push({
      key: "year",
      label: `Год ${range(f.yearFrom, f.yearTo, String)}`,
      remove: (x) => ({ ...x, yearFrom: null, yearTo: null }),
    });
  }
  if (f.priceFrom !== null || f.priceTo !== null) {
    chips.push({
      key: "price",
      label: `Цена ${range(f.priceFrom, f.priceTo, (n) => formatPrice(n, "USD"))}`,
      remove: (x) => ({ ...x, priceFrom: null, priceTo: null }),
    });
  }
  if (f.city !== null)
    chips.push({ key: "city", label: f.city, remove: (x) => ({ ...x, city: null }) });
  for (const b of f.body) {
    chips.push({
      key: `body:${b}`,
      label: BODY_LABELS[b],
      remove: (x) => ({ ...x, body: x.body.filter((v) => v !== b) }),
    });
  }
  for (const g of FUEL_GROUPS) {
    const state = fuelGroupState(f.fuel, g);
    if (state === "all") {
      const types: readonly string[] = g.types;
      chips.push({
        key: `fuel:${g.id}`,
        label: g.label,
        remove: (x) => ({ ...x, fuel: x.fuel.filter((t) => !types.includes(t)) }),
      });
    } else if (state === "some") {
      for (const t of g.types.filter((t) => f.fuel.includes(t))) {
        chips.push({
          key: `fuel:${t}`,
          label: isHybridSubtype(t) ? `Гибрид: ${shortHybrid(t)}` : g.label,
          remove: (x) => ({ ...x, fuel: x.fuel.filter((v) => v !== t) }),
        });
      }
    }
  }
  for (const t of f.transmission) {
    chips.push({
      key: `transmission:${t}`,
      label: TRANSMISSION_LABELS[t],
      remove: (x) => ({ ...x, transmission: x.transmission.filter((v) => v !== t) }),
    });
  }
  if (f.steering !== null) {
    chips.push({
      key: "steering",
      label: `Руль: ${STEERING_LABELS[f.steering].toLowerCase()}`,
      remove: (x) => ({ ...x, steering: null }),
    });
  }
  for (const o of f.origin) {
    chips.push({
      key: `origin:${o}`,
      label: ORIGIN_FILTER_LABELS[o],
      remove: (x) => ({ ...x, origin: x.origin.filter((v) => v !== o) }),
    });
  }
  if (f.inTransit)
    chips.push({ key: "inTransit", label: "В пути", remove: (x) => ({ ...x, inTransit: false }) });
  if (f.belowMarket) {
    chips.push({
      key: "belowMarket",
      label: "Ниже рынка",
      remove: (x) => ({ ...x, belowMarket: false }),
    });
  }
  return chips;
}

function isHybridSubtype(t: FuelType): t is keyof typeof HYBRID_SUBTYPE_LABELS {
  return t in HYBRID_SUBTYPE_LABELS;
}

function shortHybrid(t: keyof typeof HYBRID_SUBTYPE_LABELS): string {
  // First words before the dash: "Обычный", "Подключаемый", "С увеличенным запасом хода (EREV)".
  const head = HYBRID_SUBTYPE_LABELS[t].split(" — ")[0] ?? t;
  return head.charAt(0).toLowerCase() + head.slice(1);
}
