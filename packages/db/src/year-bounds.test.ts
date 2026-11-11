import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { maxVehicleYear, MIN_VEHICLE_YEAR } from "@repo/core";
import { describe, expect, it } from "vitest";

/** The DB year bounds (CHECK + trigger) must match @repo/core. Checks the latest migration that sets them. */
const migrationsDir = join(import.meta.dirname, "../prisma/migrations");
const latest = readdirSync(migrationsDir)
  .filter((d) => /^\d{14}_/.test(d))
  .sort()
  .map((d) => readFileSync(join(migrationsDir, d, "migration.sql"), "utf8"))
  .filter((sql) => sql.includes("check_year_not_after_next"))
  .at(-1);

describe("DB year bounds ↔ @repo/core", () => {
  it("a migration defines the bounds", () => {
    expect(latest).toBeDefined();
  });

  it("lower bound matches MIN_VEHICLE_YEAR on Vehicle and Listing", () => {
    for (const table of ["Vehicle", "Listing"]) {
      expect(latest).toContain(`"${table}_year_min" CHECK ("year" >= ${MIN_VEHICLE_YEAR})`);
    }
  });

  it("upper bound offset matches maxVehicleYear (UTC year + 1)", () => {
    const now = new Date("2026-06-01T00:00:00Z");
    const offset = maxVehicleYear(now) - now.getUTCFullYear();
    expect(latest).toContain(`EXTRACT(YEAR FROM now() AT TIME ZONE 'UTC')::int + ${offset}`);
  });
});
