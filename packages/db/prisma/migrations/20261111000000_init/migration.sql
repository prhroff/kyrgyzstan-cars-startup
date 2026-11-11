-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'KGS');

-- CreateEnum
CREATE TYPE "MileageUnit" AS ENUM ('km', 'mi');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('petrol', 'diesel', 'lpg', 'petrol_lpg', 'hybrid', 'plug_in_hybrid', 'erev', 'electric');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('manual', 'automatic', 'robot', 'cvt');

-- CreateEnum
CREATE TYPE "Drivetrain" AS ENUM ('fwd', 'rwd', 'awd');

-- CreateEnum
CREATE TYPE "SteeringSide" AS ENUM ('left', 'right');

-- CreateEnum
CREATE TYPE "BodyType" AS ENUM ('sedan', 'hatchback', 'liftback', 'wagon', 'suv', 'crossover', 'coupe', 'convertible', 'minivan', 'pickup', 'van');

-- CreateEnum
CREATE TYPE "OriginCountry" AS ENUM ('korea', 'china', 'usa', 'japan', 'uae', 'europe', 'local', 'other');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('draft', 'active', 'sold', 'archived', 'removed');

-- CreateEnum
CREATE TYPE "ListingCondition" AS ENUM ('new', 'used', 'damaged', 'for_parts');

-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('in_stock', 'in_transit', 'on_order');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('user', 'telegram', 'dealer_feed', 'site');

-- CreateEnum
CREATE TYPE "SellerType" AS ENUM ('private', 'dealer', 'importer');

-- CreateEnum
CREATE TYPE "SellerOrigin" AS ENUM ('registered', 'parsed');

-- CreateEnum
CREATE TYPE "DuplicateReason" AS ENUM ('vin', 'phone_params', 'photo_hash');

-- CreateEnum
CREATE TYPE "RegionType" AS ENUM ('oblast', 'city');

-- CreateTable
CREATE TABLE "Region" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "nameKy" TEXT,
    "type" "RegionType" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "regionId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "nameKy" TEXT,
    "isRegionalCenter" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Make" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Make_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Model" (
    "id" SERIAL NOT NULL,
    "makeId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Generation" (
    "id" SERIAL NOT NULL,
    "modelId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "yearFrom" INTEGER NOT NULL,
    "yearTo" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Generation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" UUID NOT NULL,
    "vin" TEXT,
    "makeId" INTEGER NOT NULL,
    "modelId" INTEGER NOT NULL,
    "generationId" INTEGER,
    "year" INTEGER NOT NULL,
    "bodyType" "BodyType",
    "fuelType" "FuelType",
    "transmission" "Transmission",
    "drivetrain" "Drivetrain",
    "steering" "SteeringSide",
    "engineVolumeCc" INTEGER,
    "powerHp" INTEGER,
    "batteryCapacityKwh" DECIMAL(5,1),
    "color" TEXT,
    "originCountry" "OriginCountry",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seller" (
    "id" UUID NOT NULL,
    "type" "SellerType" NOT NULL,
    "origin" "SellerOrigin" NOT NULL,
    "name" TEXT,
    "telegramId" TEXT,
    "telegramUsername" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerPhone" (
    "id" UUID NOT NULL,
    "sellerId" UUID NOT NULL,
    "phoneE164" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerPhone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" UUID NOT NULL,
    "type" "SourceType" NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "defaultCurrency" "Currency",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingSource" (
    "id" UUID NOT NULL,
    "listingId" UUID NOT NULL,
    "sourceId" UUID NOT NULL,
    "externalId" TEXT NOT NULL,
    "externalUrl" TEXT,
    "rawPayload" JSONB,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" UUID NOT NULL,
    "vehicleId" UUID NOT NULL,
    "sellerId" UUID,
    "cityId" INTEGER,
    "status" "ListingStatus" NOT NULL DEFAULT 'draft',
    "priceAmount" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL,
    "priceUsd" INTEGER NOT NULL,
    "negotiable" BOOLEAN,
    "exchangePossible" BOOLEAN,
    "mileageValue" INTEGER,
    "mileageUnit" "MileageUnit",
    "mileageKm" INTEGER,
    "customsCleared" BOOLEAN,
    "registeredInKg" BOOLEAN,
    "condition" "ListingCondition",
    "availability" "Availability" NOT NULL DEFAULT 'in_stock',
    "description" TEXT,
    "makeId" INTEGER NOT NULL,
    "modelId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" UUID NOT NULL,
    "listingId" UUID NOT NULL,
    "priceAmount" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL,
    "priceUsd" INTEGER NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" UUID NOT NULL,
    "listingId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "sha256" CHAR(64),
    "phash" CHAR(16),
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DuplicateCluster" (
    "id" UUID NOT NULL,
    "canonicalListingId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DuplicateCluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DuplicateClusterMember" (
    "id" UUID NOT NULL,
    "clusterId" UUID NOT NULL,
    "listingId" UUID NOT NULL,
    "reason" "DuplicateReason" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "matchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DuplicateClusterMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" UUID NOT NULL,
    "base" "Currency" NOT NULL,
    "quote" "Currency" NOT NULL,
    "rate" DECIMAL(14,6) NOT NULL,
    "date" DATE NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Region_slug_key" ON "Region"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");

-- CreateIndex
CREATE INDEX "City_regionId_idx" ON "City"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "Make_slug_key" ON "Make"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Model_makeId_slug_key" ON "Model"("makeId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Generation_modelId_code_key" ON "Generation"("modelId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");

-- CreateIndex
CREATE INDEX "Vehicle_makeId_modelId_year_idx" ON "Vehicle"("makeId", "modelId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_telegramId_key" ON "Seller"("telegramId");

-- CreateIndex
CREATE INDEX "SellerPhone_phoneE164_idx" ON "SellerPhone"("phoneE164");

-- CreateIndex
CREATE UNIQUE INDEX "SellerPhone_sellerId_phoneE164_key" ON "SellerPhone"("sellerId", "phoneE164");

-- CreateIndex
CREATE UNIQUE INDEX "Source_slug_key" ON "Source"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ListingSource_listingId_key" ON "ListingSource"("listingId");

-- CreateIndex
CREATE INDEX "ListingSource_sourceId_lastSyncedAt_idx" ON "ListingSource"("sourceId", "lastSyncedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ListingSource_sourceId_externalId_key" ON "ListingSource"("sourceId", "externalId");

-- CreateIndex
CREATE INDEX "Listing_status_makeId_modelId_year_priceUsd_idx" ON "Listing"("status", "makeId", "modelId", "year", "priceUsd");

-- CreateIndex
CREATE INDEX "Listing_status_priceUsd_idx" ON "Listing"("status", "priceUsd");

-- CreateIndex
CREATE INDEX "Listing_status_publishedAt_idx" ON "Listing"("status", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "Listing_cityId_status_idx" ON "Listing"("cityId", "status");

-- CreateIndex
CREATE INDEX "Listing_vehicleId_idx" ON "Listing"("vehicleId");

-- CreateIndex
CREATE INDEX "Listing_sellerId_idx" ON "Listing"("sellerId");

-- CreateIndex
CREATE INDEX "PriceHistory_listingId_observedAt_idx" ON "PriceHistory"("listingId", "observedAt");

-- CreateIndex
CREATE INDEX "Photo_listingId_position_idx" ON "Photo"("listingId", "position");

-- CreateIndex
CREATE INDEX "Photo_phash_idx" ON "Photo"("phash");

-- CreateIndex
CREATE INDEX "Photo_sha256_idx" ON "Photo"("sha256");

-- CreateIndex
CREATE UNIQUE INDEX "DuplicateCluster_canonicalListingId_key" ON "DuplicateCluster"("canonicalListingId");

-- CreateIndex
CREATE UNIQUE INDEX "DuplicateClusterMember_listingId_key" ON "DuplicateClusterMember"("listingId");

-- CreateIndex
CREATE INDEX "DuplicateClusterMember_clusterId_idx" ON "DuplicateClusterMember"("clusterId");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate_base_quote_date_key" ON "ExchangeRate"("base", "quote", "date");

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "Make"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Generation" ADD CONSTRAINT "Generation_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "Make"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "Generation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerPhone" ADD CONSTRAINT "SellerPhone_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingSource" ADD CONSTRAINT "ListingSource_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingSource" ADD CONSTRAINT "ListingSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "Make"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuplicateCluster" ADD CONSTRAINT "DuplicateCluster_canonicalListingId_fkey" FOREIGN KEY ("canonicalListingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuplicateClusterMember" ADD CONSTRAINT "DuplicateClusterMember_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "DuplicateCluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DuplicateClusterMember" ADD CONSTRAINT "DuplicateClusterMember_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ─── Hand-written CHECK constraints (Prisma schema can't express them) ───
-- Prisma ignores CHECK constraints when diffing, so they don't cause drift.

ALTER TABLE "Listing"
  ADD CONSTRAINT "Listing_priceAmount_positive" CHECK ("priceAmount" > 0),
  ADD CONSTRAINT "Listing_priceUsd_positive" CHECK ("priceUsd" > 0),
  ADD CONSTRAINT "Listing_year_range" CHECK ("year" BETWEEN 1900 AND 2100),
  ADD CONSTRAINT "Listing_mileage_non_negative" CHECK ("mileageValue" IS NULL OR "mileageValue" >= 0),
  ADD CONSTRAINT "Listing_mileageKm_non_negative" CHECK ("mileageKm" IS NULL OR "mileageKm" >= 0),
  ADD CONSTRAINT "Listing_mileage_unit_pair" CHECK (("mileageValue" IS NULL) = ("mileageUnit" IS NULL));

ALTER TABLE "PriceHistory"
  ADD CONSTRAINT "PriceHistory_priceAmount_positive" CHECK ("priceAmount" > 0),
  ADD CONSTRAINT "PriceHistory_priceUsd_positive" CHECK ("priceUsd" > 0);

ALTER TABLE "Vehicle"
  ADD CONSTRAINT "Vehicle_vin_format" CHECK ("vin" IS NULL OR "vin" ~ '^[A-HJ-NPR-Z0-9]{17}$'),
  ADD CONSTRAINT "Vehicle_year_range" CHECK ("year" BETWEEN 1900 AND 2100),
  ADD CONSTRAINT "Vehicle_engineVolumeCc_positive" CHECK ("engineVolumeCc" IS NULL OR "engineVolumeCc" > 0),
  ADD CONSTRAINT "Vehicle_batteryCapacityKwh_positive" CHECK ("batteryCapacityKwh" IS NULL OR "batteryCapacityKwh" > 0);

ALTER TABLE "SellerPhone"
  ADD CONSTRAINT "SellerPhone_e164" CHECK ("phoneE164" ~ '^\+[1-9][0-9]{6,14}$');

ALTER TABLE "Photo"
  ADD CONSTRAINT "Photo_phash_hex" CHECK ("phash" IS NULL OR "phash" ~ '^[0-9a-f]{16}$'),
  ADD CONSTRAINT "Photo_sha256_hex" CHECK ("sha256" IS NULL OR "sha256" ~ '^[0-9a-f]{64}$');

ALTER TABLE "DuplicateClusterMember"
  ADD CONSTRAINT "DuplicateClusterMember_confidence_range" CHECK ("confidence" >= 0 AND "confidence" <= 1);

ALTER TABLE "ExchangeRate"
  ADD CONSTRAINT "ExchangeRate_rate_positive" CHECK ("rate" > 0),
  ADD CONSTRAINT "ExchangeRate_distinct_pair" CHECK ("base" <> "quote");

ALTER TABLE "Generation"
  ADD CONSTRAINT "Generation_years" CHECK ("yearTo" IS NULL OR "yearTo" >= "yearFrom");
