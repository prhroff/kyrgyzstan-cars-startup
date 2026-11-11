import type { ListingDetail } from "@/data/types";
import type { MakeOptionData } from "@/data/search";
import { countActiveFilters, type FilterValues } from "./filters";
import { formatMileageKm, formatNumber, formatPrice, pluralRu } from "./format";
import { FUEL_LABELS, SELLER_TYPE_LABELS, TRANSMISSION_LABELS } from "./labels";

type ListingMeta = Pick<
  ListingDetail,
  | "make"
  | "model"
  | "year"
  | "priceAmount"
  | "currency"
  | "city"
  | "mileageKm"
  | "vehicle"
  | "seller"
>;

/** "Toyota Camry 2021 за 24 500 $, Бишкек" */
export function listingMetaTitle(l: ListingMeta): string {
  const city = l.city ? `, ${l.city}` : "";
  return `${l.make} ${l.model} ${l.year} за ${formatPrice(l.priceAmount, l.currency)}${city}`;
}

/** "Toyota Camry 2021, 68 000 км, автомат, бензин. Цена 24 500 $, Бишкек. Продавец — дилер. …" */
export function listingMetaDescription(l: ListingMeta): string {
  const specs = [
    formatMileageKm(l.mileageKm),
    l.vehicle.transmission && TRANSMISSION_LABELS[l.vehicle.transmission].toLowerCase(),
    l.vehicle.fuelType && FUEL_LABELS[l.vehicle.fuelType].toLowerCase(),
  ].filter(Boolean);
  const head = [`${l.make} ${l.model} ${l.year}`, ...specs].join(", ");
  const city = l.city ? `, ${l.city}` : "";
  const seller = SELLER_TYPE_LABELS[l.seller.type].toLowerCase();
  return `${head}. Цена ${formatPrice(l.priceAmount, l.currency)}${city}. Продавец — ${seller}. В объявлении: цена к рынку, история цены и данные о продавце.`;
}

export interface CatalogMeta {
  h1: string;
  title: string;
  description: string;
  /**
   * Only "all cars", a make, or make + model go to search engines; other filter combinations are
   * infinite and thin, so they are noindex (still followable).
   */
  indexable: boolean;
}

/** True for "all cars", a known make, or a known make + model — and nothing else set. */
function isMakeModelOnly(f: FilterValues, knownMake: boolean, knownModel: boolean): boolean {
  if (f.make !== null && !knownMake) return false;
  if (f.model !== null && !knownModel) return false;
  return countActiveFilters(f) === Number(f.make !== null) + Number(f.model !== null);
}

export function catalogMeta(
  filters: FilterValues,
  total: number,
  makes: readonly MakeOptionData[],
): CatalogMeta {
  const make = makes.find((m) => m.id === filters.make);
  const model = make?.models.find((m) => m.id === filters.model);
  const name = [make?.label, model?.label].filter(Boolean).join(" ") || "авто";
  const count = `${formatNumber(total)} ${pluralRu(total, ["объявление", "объявления", "объявлений"])}`;
  return {
    h1: `Продажа ${name} в Кыргызстане`,
    title: `Купить ${name} в Кыргызстане — объявления о продаже`,
    description: `${count} о продаже ${name} в Кыргызстане. В каждом объявлении — цена к рынку, история цены и данные о продавце.`,
    indexable: isMakeModelOnly(filters, make !== undefined, model !== undefined),
  };
}
