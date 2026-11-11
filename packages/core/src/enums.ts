import { z } from "zod";

/**
 * Domain enums — single source of truth for allowed values.
 * Prisma enums in packages/db mirror these exactly (checked by a test in packages/db).
 */

export const CURRENCIES = ["USD", "KGS"] as const;
export const currencySchema = z.enum(CURRENCIES);
export type Currency = z.infer<typeof currencySchema>;

export const MILEAGE_UNITS = ["km", "mi"] as const;
export const mileageUnitSchema = z.enum(MILEAGE_UNITS);
export type MileageUnit = z.infer<typeof mileageUnitSchema>;

export const FUEL_TYPES = [
  "petrol",
  "diesel",
  "lpg",
  "petrol_lpg",
  "hybrid",
  "plug_in_hybrid",
  "erev",
  "electric",
] as const;
export const fuelTypeSchema = z.enum(FUEL_TYPES);
export type FuelType = z.infer<typeof fuelTypeSchema>;

export const TRANSMISSIONS = ["manual", "automatic", "robot", "cvt"] as const;
export const transmissionSchema = z.enum(TRANSMISSIONS);
export type Transmission = z.infer<typeof transmissionSchema>;

export const DRIVETRAINS = ["fwd", "rwd", "awd"] as const;
export const drivetrainSchema = z.enum(DRIVETRAINS);
export type Drivetrain = z.infer<typeof drivetrainSchema>;

export const STEERING_SIDES = ["left", "right"] as const;
export const steeringSideSchema = z.enum(STEERING_SIDES);
export type SteeringSide = z.infer<typeof steeringSideSchema>;

export const BODY_TYPES = [
  "sedan",
  "hatchback",
  "liftback",
  "wagon",
  "suv",
  "crossover",
  "coupe",
  "convertible",
  "minivan",
  "pickup",
  "van",
] as const;
export const bodyTypeSchema = z.enum(BODY_TYPES);
export type BodyType = z.infer<typeof bodyTypeSchema>;

/** Country the car was imported from (not the brand's country). */
export const ORIGIN_COUNTRIES = [
  "korea",
  "china",
  "usa",
  "japan",
  "uae",
  "europe",
  "local",
  "other",
] as const;
export const originCountrySchema = z.enum(ORIGIN_COUNTRIES);
export type OriginCountry = z.infer<typeof originCountrySchema>;

export const LISTING_STATUSES = ["draft", "active", "sold", "archived", "removed"] as const;
export const listingStatusSchema = z.enum(LISTING_STATUSES);
export type ListingStatus = z.infer<typeof listingStatusSchema>;

export const LISTING_CONDITIONS = ["new", "used", "damaged", "for_parts"] as const;
export const listingConditionSchema = z.enum(LISTING_CONDITIONS);
export type ListingCondition = z.infer<typeof listingConditionSchema>;

export const AVAILABILITIES = ["in_stock", "in_transit", "on_order"] as const;
export const availabilitySchema = z.enum(AVAILABILITIES);
export type Availability = z.infer<typeof availabilitySchema>;

export const SOURCE_TYPES = ["user", "telegram", "dealer_feed", "site"] as const;
export const sourceTypeSchema = z.enum(SOURCE_TYPES);
export type SourceType = z.infer<typeof sourceTypeSchema>;

export const SELLER_TYPES = ["private", "dealer", "importer"] as const;
export const sellerTypeSchema = z.enum(SELLER_TYPES);
export type SellerType = z.infer<typeof sellerTypeSchema>;

export const SELLER_ORIGINS = ["registered", "parsed"] as const;
export const sellerOriginSchema = z.enum(SELLER_ORIGINS);
export type SellerOrigin = z.infer<typeof sellerOriginSchema>;

export const DUPLICATE_REASONS = ["vin", "phone_params", "photo_hash"] as const;
export const duplicateReasonSchema = z.enum(DUPLICATE_REASONS);
export type DuplicateReason = z.infer<typeof duplicateReasonSchema>;

export const REGION_TYPES = ["oblast", "city"] as const;
export const regionTypeSchema = z.enum(REGION_TYPES);
export type RegionType = z.infer<typeof regionTypeSchema>;
