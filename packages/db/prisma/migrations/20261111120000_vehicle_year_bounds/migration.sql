-- Vehicle (model) year: 1950 … current UTC year + 1.
-- Bounds mirror packages/core/src/year.ts (MIN_VEHICLE_YEAR, maxVehicleYear); kept in sync by
-- packages/db/src/year-bounds.test.ts. The upper bound depends on now(), which a CHECK must not
-- (CHECK expressions are assumed immutable), so it lives in a trigger.

ALTER TABLE "Vehicle"
  DROP CONSTRAINT "Vehicle_year_range",
  ADD CONSTRAINT "Vehicle_year_min" CHECK ("year" >= 1950);

ALTER TABLE "Listing"
  DROP CONSTRAINT "Listing_year_range",
  ADD CONSTRAINT "Listing_year_min" CHECK ("year" >= 1950);

CREATE FUNCTION "check_year_not_after_next"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."year" > EXTRACT(YEAR FROM now() AT TIME ZONE 'UTC')::int + 1 THEN
    RAISE EXCEPTION 'year % is after next calendar year', NEW."year"
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER "Vehicle_year_max"
  BEFORE INSERT OR UPDATE OF "year" ON "Vehicle"
  FOR EACH ROW EXECUTE FUNCTION "check_year_not_after_next"();

CREATE TRIGGER "Listing_year_max"
  BEFORE INSERT OR UPDATE OF "year" ON "Listing"
  FOR EACH ROW EXECUTE FUNCTION "check_year_not_after_next"();
