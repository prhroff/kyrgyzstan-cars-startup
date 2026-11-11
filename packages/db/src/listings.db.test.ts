/**
 * Invariant tests against a real Postgres. Run when TEST_DATABASE_URL points to a
 * migrated database (it may be the dev DB: the test only touches rows it creates).
 */
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createPrismaClient } from "./client.js";
import { getUsdKgsRate, toPriceUsd } from "./exchange-rates.js";
import type { PrismaClient } from "./generated/prisma/client.js";
import {
  createListing,
  findListingDrift,
  moveListingToVehicle,
  updateListingMileage,
  updateListingPrice,
  updateVehicle,
} from "./listings.js";

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("listing denormalization invariant (DB)", () => {
  let db: PrismaClient;
  const tag = `test-${randomUUID().slice(0, 8)}`;
  let makeId: number;
  let modelA: number;
  let modelB: number;
  let sourceId: string;
  let createdRate = false;
  const rateDate = new Date("2000-01-01T00:00:00Z");

  beforeAll(async () => {
    db = createPrismaClient(url ?? "");
    const make = await db.make.create({
      data: {
        slug: tag,
        name: tag,
        models: {
          create: [
            { slug: "a", name: "A" },
            { slug: "b", name: "B" },
          ],
        },
      },
      include: { models: { orderBy: { slug: "asc" } } },
    });
    makeId = make.id;
    [modelA, modelB] = make.models.map((m) => m.id) as [number, number];
    sourceId = (await db.source.create({ data: { type: "telegram", slug: tag, name: tag } })).id;
    const existing = await db.exchangeRate.findFirst({ where: { base: "USD", quote: "KGS" } });
    if (!existing) {
      await db.exchangeRate.create({
        data: { base: "USD", quote: "KGS", rate: 87.5, date: rateDate, source: tag },
      });
      createdRate = true;
    }
  });

  afterAll(async () => {
    await db.listing.deleteMany({ where: { makeId } });
    await db.vehicle.deleteMany({ where: { makeId } });
    await db.model.deleteMany({ where: { makeId } });
    await db.make.delete({ where: { id: makeId } });
    await db.source.delete({ where: { id: sourceId } });
    if (createdRate) await db.exchangeRate.deleteMany({ where: { source: tag } });
    await db.$disconnect();
  });

  const ourDrift = async () => {
    const ids = new Set(
      (await db.listing.findMany({ where: { makeId }, select: { id: true } })).map((l) => l.id),
    );
    return (await findListingDrift(db)).filter((d) => ids.has(d.id));
  };

  it("keeps Listing in sync with Vehicle through every write path", async () => {
    const vehicle = await db.vehicle.create({ data: { makeId, modelId: modelA, year: 2015 } });
    const other = await db.vehicle.create({ data: { makeId, modelId: modelB, year: 2020 } });

    const listing = await createListing(db, {
      vehicleId: vehicle.id,
      priceAmount: 1_000_000,
      currency: "KGS",
      mileageValue: 50_000,
      mileageUnit: "mi",
      data: { status: "active" },
      source: { sourceId, externalId: "post-1", rawPayload: { text: "..." } },
    });
    const rate = await getUsdKgsRate(db);
    expect(listing).toMatchObject({
      makeId,
      modelId: modelA,
      year: 2015,
      mileageKm: 80_467,
      priceUsd: toPriceUsd(1_000_000, "KGS", rate),
    });
    expect(await ourDrift()).toEqual([]);

    await updateVehicle(db, vehicle.id, { year: 2016, modelId: modelB });
    expect(await db.listing.findUniqueOrThrow({ where: { id: listing.id } })).toMatchObject({
      year: 2016,
      modelId: modelB,
    });
    expect(await ourDrift()).toEqual([]);

    await moveListingToVehicle(db, listing.id, other.id);
    await updateListingMileage(db, listing.id, { value: 120_000, unit: "km" });
    await updateListingPrice(db, listing.id, { priceAmount: 14_000, currency: "USD" });
    expect(await db.listing.findUniqueOrThrow({ where: { id: listing.id } })).toMatchObject({
      vehicleId: other.id,
      year: 2020,
      mileageKm: 120_000,
      priceUsd: 14_000,
    });
    expect(await ourDrift()).toEqual([]);
  });

  it("records price history only on real changes and links the source", async () => {
    const vehicle = await db.vehicle.create({ data: { makeId, modelId: modelA, year: 2019 } });
    const listing = await createListing(db, {
      vehicleId: vehicle.id,
      priceAmount: 20_000,
      currency: "USD",
      source: { sourceId },
    });
    await updateListingPrice(db, listing.id, { priceAmount: 20_000, currency: "USD" });
    await updateListingPrice(db, listing.id, { priceAmount: 19_000, currency: "USD" });

    const history = await db.priceHistory.findMany({
      where: { listingId: listing.id },
      orderBy: { observedAt: "asc" },
    });
    expect(history.map((h) => h.priceAmount)).toEqual([20_000, 19_000]);

    const src = await db.listingSource.findUniqueOrThrow({ where: { listingId: listing.id } });
    expect(src.externalId).toBe(listing.id);
  });

  it("detects drift introduced by a direct write", async () => {
    const vehicle = await db.vehicle.create({ data: { makeId, modelId: modelA, year: 2017 } });
    const listing = await createListing(db, {
      vehicleId: vehicle.id,
      priceAmount: 9_000,
      currency: "USD",
      source: { sourceId },
    });
    // Bypassing listings.ts — exactly what the rule forbids.
    await db.vehicle.update({ where: { id: vehicle.id }, data: { year: 2018 } });
    expect(await ourDrift()).toEqual([{ id: listing.id, problem: "vehicle_fields" }]);
    await updateVehicle(db, vehicle.id, { year: 2018 });
    expect(await ourDrift()).toEqual([]);
  });
});
