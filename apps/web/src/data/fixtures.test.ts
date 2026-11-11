import { normalizePhone, validateVin } from "@repo/core";
import { describe, expect, it } from "vitest";
import { FIXTURE_LISTINGS, VIN_CHECKSUM_MISMATCH } from "./fixtures";

describe("listing fixtures", () => {
  it("ids are unique", () => {
    const ids = FIXTURE_LISTINGS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has the showcase cases the pages and screenshots rely on", () => {
    const ids = FIXTURE_LISTINGS.map((l) => l.id);
    for (const id of [
      "demo-ok",
      "demo-warn",
      "demo-novin",
      "demo-nodata",
      "demo-sold",
      "demo-removed",
    ]) {
      expect(ids).toContain(id);
    }
    expect(FIXTURE_LISTINGS.filter((l) => l.status === "active").length).toBeGreaterThan(24);
  });

  it("every listing has what the posting form requires", () => {
    for (const l of FIXTURE_LISTINGS) {
      expect(l.mileageKm, l.id).not.toBeNull();
      expect(l.vehicle.fuelType, l.id).not.toBeNull();
      expect(l.vehicle.transmission, l.id).not.toBeNull();
      expect(l.city, l.id).not.toBeNull();
      expect(l.photos.length, l.id).toBeGreaterThan(0);
      expect(l.priceHistory.length, l.id).toBeGreaterThan(0);
    }
  });

  it("phones are E.164 KG numbers", () => {
    for (const l of FIXTURE_LISTINGS) {
      expect(normalizePhone(l.contacts.phone)?.e164).toBe(l.contacts.phone);
    }
  });

  it("VINs are valid, except the deliberate checksum mismatch", () => {
    expect(validateVin(VIN_CHECKSUM_MISMATCH)).toMatchObject({ valid: false, error: "checksum" });
    for (const l of FIXTURE_LISTINGS) {
      if (l.vehicle.vin === null || l.vehicle.vin === VIN_CHECKSUM_MISMATCH) continue;
      expect(validateVin(l.vehicle.vin).valid).toBe(true);
    }
  });

  it("price history: integer prices, oldest first, ends at the current price", () => {
    for (const l of FIXTURE_LISTINGS) {
      const h = l.priceHistory;
      for (const p of h)
        expect(Number.isInteger(p.priceAmount) && Number.isInteger(p.priceUsd)).toBe(true);
      const times = h.map((p) => p.observedAt.getTime());
      expect(times).toEqual([...times].sort((a, b) => a - b));
      const last = h.at(-1);
      if (last) expect(last.priceAmount).toBe(l.priceAmount);
    }
  });

  it("market label and estimate agree", () => {
    for (const l of FIXTURE_LISTINGS) {
      expect(l.marketEstimate?.position ?? null).toBe(l.market);
    }
  });

  it("only closed listings have closedAt", () => {
    for (const l of FIXTURE_LISTINGS) {
      expect(l.closedAt === null).toBe(l.status === "active");
    }
  });
});
