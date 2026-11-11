/**
 * THE ONLY place that writes Listing's denormalized columns:
 *   makeId, modelId, year  ← Vehicle
 *   mileageKm              ← mileageValue + mileageUnit
 *   priceUsd               ← priceAmount + currency + ExchangeRate
 *
 * Any code that creates a listing, changes its price/mileage, changes a vehicle's
 * make/model/year or re-links a listing to another vehicle MUST go through these
 * functions. Other Listing fields (description, status, …) may be updated directly.
 * `findListingDrift` detects violations; it is covered by tests.
 */
import { normalizeMileage } from "@repo/core";
import type { Currency, MileageUnit } from "@repo/core";
import { withTransaction } from "./client.js";
import type { Db } from "./client.js";
import { getUsdKgsRate, toPriceUsd } from "./exchange-rates.js";
import type { Listing, Prisma, Vehicle } from "./generated/prisma/client.js";

export interface ListingSearchFields {
  makeId: number;
  modelId: number;
  year: number;
  mileageKm: number | null;
  priceUsd: number;
}

export interface DeriveInput {
  vehicle: Pick<Vehicle, "makeId" | "modelId" | "year">;
  priceAmount: number;
  currency: Currency;
  mileageValue: number | null;
  mileageUnit: MileageUnit | null;
  /** KGS per 1 USD; only used when currency is KGS. */
  usdKgsRate: number;
}

/** Pure derivation of all denormalized Listing columns. */
export function deriveListingSearchFields(input: DeriveInput): ListingSearchFields {
  if (!Number.isInteger(input.priceAmount) || input.priceAmount <= 0) {
    throw new RangeError(`priceAmount must be a positive integer, got ${input.priceAmount}`);
  }
  return {
    makeId: input.vehicle.makeId,
    modelId: input.vehicle.modelId,
    year: input.vehicle.year,
    mileageKm: deriveMileageKm(input.mileageValue, input.mileageUnit),
    priceUsd: toPriceUsd(input.priceAmount, input.currency, input.usdKgsRate),
  };
}

function deriveMileageKm(value: number | null, unit: MileageUnit | null): number | null {
  if (value === null && unit === null) return null;
  if (value === null || unit === null) {
    throw new RangeError("mileageValue and mileageUnit must be set together");
  }
  const km = normalizeMileage(value, unit);
  if (km === null) throw new RangeError(`Invalid mileage: ${value} ${unit}`);
  return km;
}

async function rateFor(db: Db, currency: Currency): Promise<number> {
  // USD listings don't need a rate; avoid failing when none is loaded yet.
  return currency === "USD" ? 1 : getUsdKgsRate(db);
}

// ─────────────────────────── Create ───────────────────────────

export interface CreateListingInput {
  vehicleId: string;
  priceAmount: number;
  currency: Currency;
  mileageValue?: number | null;
  mileageUnit?: MileageUnit | null;
  /** Non-derived Listing fields. */
  data?: Omit<
    Prisma.ListingUncheckedCreateInput,
    | "vehicleId"
    | "priceAmount"
    | "currency"
    | "priceUsd"
    | "mileageValue"
    | "mileageUnit"
    | "mileageKm"
    | "makeId"
    | "modelId"
    | "year"
  >;
  source: {
    sourceId: string;
    /** Defaults to the new listing's id (for user-created listings). */
    externalId?: string;
    externalUrl?: string | null;
    rawPayload?: Prisma.InputJsonValue;
  };
}

/** Creates a listing with derived fields, its ListingSource and the first PriceHistory entry. */
export async function createListing(db: Db, input: CreateListingInput): Promise<Listing> {
  return withTransaction(db, async (tx) => {
    const vehicle = await tx.vehicle.findUniqueOrThrow({
      where: { id: input.vehicleId },
      select: { makeId: true, modelId: true, year: true },
    });
    const mileageValue = input.mileageValue ?? null;
    const mileageUnit = input.mileageUnit ?? null;
    const derived = deriveListingSearchFields({
      vehicle,
      priceAmount: input.priceAmount,
      currency: input.currency,
      mileageValue,
      mileageUnit,
      usdKgsRate: await rateFor(tx, input.currency),
    });

    const listing = await tx.listing.create({
      data: {
        ...input.data,
        vehicleId: input.vehicleId,
        priceAmount: input.priceAmount,
        currency: input.currency,
        mileageValue,
        mileageUnit,
        ...derived,
      },
    });

    await tx.listingSource.create({
      data: {
        listingId: listing.id,
        sourceId: input.source.sourceId,
        externalId: input.source.externalId ?? listing.id,
        externalUrl: input.source.externalUrl ?? null,
        ...(input.source.rawPayload === undefined ? {} : { rawPayload: input.source.rawPayload }),
      },
    });

    await tx.priceHistory.create({
      data: {
        listingId: listing.id,
        priceAmount: listing.priceAmount,
        currency: listing.currency,
        priceUsd: listing.priceUsd,
      },
    });

    return listing;
  });
}

// ─────────────────────────── Update ───────────────────────────

/** Changes the price; appends PriceHistory only when amount or currency actually changed. */
export async function updateListingPrice(
  db: Db,
  listingId: string,
  price: { priceAmount: number; currency: Currency; observedAt?: Date },
): Promise<Listing> {
  return withTransaction(db, async (tx) => {
    const current = await tx.listing.findUniqueOrThrow({ where: { id: listingId } });
    const priceUsd = deriveListingSearchFields({
      vehicle: current,
      priceAmount: price.priceAmount,
      currency: price.currency,
      mileageValue: current.mileageValue,
      mileageUnit: current.mileageUnit,
      usdKgsRate: await rateFor(tx, price.currency),
    }).priceUsd;

    const changed =
      current.priceAmount !== price.priceAmount || current.currency !== price.currency;
    if (!changed && current.priceUsd === priceUsd) return current;

    const updated = await tx.listing.update({
      where: { id: listingId },
      data: { priceAmount: price.priceAmount, currency: price.currency, priceUsd },
    });
    if (changed) {
      await tx.priceHistory.create({
        data: {
          listingId,
          priceAmount: price.priceAmount,
          currency: price.currency,
          priceUsd,
          ...(price.observedAt ? { observedAt: price.observedAt } : {}),
        },
      });
    }
    return updated;
  });
}

export async function updateListingMileage(
  db: Db,
  listingId: string,
  mileage: { value: number; unit: MileageUnit } | null,
): Promise<Listing> {
  const mileageValue = mileage?.value ?? null;
  const mileageUnit = mileage?.unit ?? null;
  const mileageKm = deriveMileageKm(mileageValue, mileageUnit);
  return db.listing.update({
    where: { id: listingId },
    data: { mileageValue, mileageUnit, mileageKm },
  });
}

/** Updates a vehicle and propagates make/model/year to all of its listings. */
export async function updateVehicle(
  db: Db,
  vehicleId: string,
  data: Prisma.VehicleUncheckedUpdateInput,
): Promise<Vehicle> {
  return withTransaction(db, async (tx) => {
    const vehicle = await tx.vehicle.update({ where: { id: vehicleId }, data });
    await tx.listing.updateMany({
      where: { vehicleId },
      data: { makeId: vehicle.makeId, modelId: vehicle.modelId, year: vehicle.year },
    });
    return vehicle;
  });
}

/** Re-links a listing to another vehicle (e.g. after a VIN match) and syncs denormalized fields. */
export async function moveListingToVehicle(
  db: Db,
  listingId: string,
  vehicleId: string,
): Promise<Listing> {
  return withTransaction(db, async (tx) => {
    const vehicle = await tx.vehicle.findUniqueOrThrow({
      where: { id: vehicleId },
      select: { makeId: true, modelId: true, year: true },
    });
    return tx.listing.update({ where: { id: listingId }, data: { vehicleId, ...vehicle } });
  });
}

/** Recomputes priceUsd of all KGS listings with the current rate (run after loading a new rate). */
export async function refreshKgsPriceUsd(db: Db): Promise<number> {
  const rate = await getUsdKgsRate(db);
  return db.$executeRaw`
    UPDATE "Listing"
    SET "priceUsd" = GREATEST(1, ROUND("priceAmount" / ${rate}::numeric)::int), "updatedAt" = now()
    WHERE "currency" = 'KGS'
      AND "priceUsd" <> GREATEST(1, ROUND("priceAmount" / ${rate}::numeric)::int)`;
}

// ─────────────────────────── Invariant ───────────────────────────

export interface ListingDrift {
  id: string;
  problem: "vehicle_fields" | "mileage_km" | "usd_price";
}

/**
 * Finds listings whose denormalized columns disagree with their sources of truth.
 * Must always return []. KGS→USD conversion is not checked (it depends on the rate at write time).
 */
export async function findListingDrift(db: Db): Promise<ListingDrift[]> {
  return db.$queryRaw<ListingDrift[]>`
    SELECT l."id", 'vehicle_fields' AS problem
    FROM "Listing" l JOIN "Vehicle" v ON v."id" = l."vehicleId"
    WHERE l."makeId" <> v."makeId" OR l."modelId" <> v."modelId" OR l."year" <> v."year"
    UNION ALL
    SELECT l."id", 'mileage_km'
    FROM "Listing" l
    WHERE l."mileageKm" IS DISTINCT FROM (
      CASE WHEN l."mileageUnit" = 'mi' THEN ROUND(l."mileageValue" * 1.609344)::int
           ELSE l."mileageValue" END)
    UNION ALL
    SELECT l."id", 'usd_price'
    FROM "Listing" l
    WHERE l."currency" = 'USD' AND l."priceUsd" <> l."priceAmount"`;
}
