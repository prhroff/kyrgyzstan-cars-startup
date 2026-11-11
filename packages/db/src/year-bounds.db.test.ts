/**
 * Year bounds enforced by Postgres (CHECK + trigger). Runs when TEST_DATABASE_URL is set.
 */
import { randomUUID } from "node:crypto";
import { maxVehicleYear, MIN_VEHICLE_YEAR } from "@repo/core";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createPrismaClient } from "./client.js";
import type { PrismaClient } from "./generated/prisma/client.js";
import { updateVehicle } from "./listings.js";

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("vehicle year bounds (DB)", () => {
  let db: PrismaClient;
  const tag = `test-${randomUUID().slice(0, 8)}`;
  let makeId: number;
  let modelId: number;

  beforeAll(async () => {
    db = createPrismaClient(url ?? "");
    const make = await db.make.create({
      data: { slug: tag, name: tag, models: { create: [{ slug: "a", name: "A" }] } },
      include: { models: true },
    });
    makeId = make.id;
    modelId = make.models[0]?.id ?? 0;
  });

  afterAll(async () => {
    await db.vehicle.deleteMany({ where: { makeId } });
    await db.make.delete({ where: { id: makeId } });
    await db.$disconnect();
  });

  const create = (year: number) => db.vehicle.create({ data: { makeId, modelId, year } });

  it("accepts the bounds", async () => {
    await expect(create(MIN_VEHICLE_YEAR)).resolves.toMatchObject({ year: MIN_VEHICLE_YEAR });
    await expect(create(maxVehicleYear())).resolves.toMatchObject({ year: maxVehicleYear() });
  });

  it("rejects a year below the lower bound", async () => {
    await expect(create(MIN_VEHICLE_YEAR - 1)).rejects.toThrow(/Vehicle_year_min/);
  });

  it("rejects a year after next calendar year, on insert and update", async () => {
    await expect(create(maxVehicleYear() + 1)).rejects.toThrow(/after next calendar year/);
    const v = await create(2020);
    await expect(updateVehicle(db, v.id, { year: maxVehicleYear() + 1 })).rejects.toThrow(
      /after next calendar year/,
    );
  });
});
