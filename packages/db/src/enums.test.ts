import * as core from "@repo/core";
import { describe, expect, it } from "vitest";
import * as prisma from "./generated/prisma/enums.js";

/** Prisma enums must mirror packages/core enums exactly. */
const pairs: [string, Record<string, string>, readonly string[]][] = [
  ["Currency", prisma.Currency, core.CURRENCIES],
  ["MileageUnit", prisma.MileageUnit, core.MILEAGE_UNITS],
  ["FuelType", prisma.FuelType, core.FUEL_TYPES],
  ["Transmission", prisma.Transmission, core.TRANSMISSIONS],
  ["Drivetrain", prisma.Drivetrain, core.DRIVETRAINS],
  ["SteeringSide", prisma.SteeringSide, core.STEERING_SIDES],
  ["BodyType", prisma.BodyType, core.BODY_TYPES],
  ["OriginCountry", prisma.OriginCountry, core.ORIGIN_COUNTRIES],
  ["ListingStatus", prisma.ListingStatus, core.LISTING_STATUSES],
  ["ListingCondition", prisma.ListingCondition, core.LISTING_CONDITIONS],
  ["Availability", prisma.Availability, core.AVAILABILITIES],
  ["SourceType", prisma.SourceType, core.SOURCE_TYPES],
  ["SellerType", prisma.SellerType, core.SELLER_TYPES],
  ["SellerOrigin", prisma.SellerOrigin, core.SELLER_ORIGINS],
  ["DuplicateReason", prisma.DuplicateReason, core.DUPLICATE_REASONS],
  ["RegionType", prisma.RegionType, core.REGION_TYPES],
];

describe("Prisma enums ↔ @repo/core enums", () => {
  it.each(pairs)("%s matches", (_name, prismaEnum, coreValues) => {
    expect(Object.values(prismaEnum).sort()).toEqual([...coreValues].sort());
  });

  it("covers every Prisma enum", () => {
    const prismaEnumNames = Object.keys(prisma).sort();
    expect(pairs.map(([name]) => name).sort()).toEqual(prismaEnumNames);
  });
});
