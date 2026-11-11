import type { ListingDetail } from "@/data/types";
import { cx } from "@/lib/cx";
import { formatEngineVolume, formatMileageKm } from "@/lib/format";
import {
  AVAILABILITY_LABELS,
  BODY_LABELS,
  DRIVETRAIN_LABELS,
  FUEL_LABELS,
  ORIGIN_LABELS,
  STEERING_LABELS,
  TRANSMISSION_LABELS,
} from "@/lib/labels";

/**
 * Specs as the seller stated them (customs and availability included — they are statements,
 * not facts we checked, so they live here and not in TrustPanel). Unknown values are left out:
 * "нет данных" is shown only for trust facts. null never turns into "нет".
 */
export function specRows(l: ListingDetail): { label: string; value: string }[] {
  const v = l.vehicle;
  const rows: { label: string; value: string | null }[] = [
    { label: "Год выпуска", value: String(l.year) },
    { label: "Пробег", value: formatMileageKm(l.mileageKm) },
    { label: "Двигатель", value: formatEngineVolume(v.engineVolumeCc) },
    { label: "Топливо", value: v.fuelType && FUEL_LABELS[v.fuelType] },
    { label: "Коробка передач", value: v.transmission && TRANSMISSION_LABELS[v.transmission] },
    { label: "Привод", value: v.drivetrain && DRIVETRAIN_LABELS[v.drivetrain] },
    { label: "Руль", value: v.steering && STEERING_LABELS[v.steering] },
    { label: "Кузов", value: v.bodyType && BODY_LABELS[v.bodyType] },
    { label: "Цвет", value: v.color },
    {
      label: "Растаможка",
      value: l.customsCleared === null ? null : l.customsCleared ? "Растаможен" : "Не растаможен",
    },
    { label: "Наличие", value: AVAILABILITY_LABELS[l.availability] },
    { label: "Откуда машина", value: v.originCountry && ORIGIN_LABELS[v.originCountry] },
    { label: "Город", value: l.city },
    {
      label: "Торг",
      // Only what the seller said; unknown is left out.
      value: l.negotiable === null ? null : l.negotiable ? "Возможен" : "Без торга",
    },
  ];
  return rows.flatMap((r) => (r.value === null ? [] : [{ label: r.label, value: r.value }]));
}

export function ListingSpecs({
  listing,
  className,
}: {
  listing: ListingDetail;
  className?: string;
}) {
  return (
    <section aria-labelledby="specs-heading" className={cx("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 id="specs-heading" className="text-lg font-semibold text-fg">
          Характеристики
        </h2>
        <p className="text-sm text-fg-subtle">Со слов продавца</p>
      </div>
      <dl className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
        {specRows(listing).map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-4 border-b border-line py-2"
          >
            <dt className="text-sm text-fg-muted">{row.label}</dt>
            <dd className="text-right text-sm font-medium text-fg">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
