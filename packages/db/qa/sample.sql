-- Deterministic sample of one source's listings. Every check reads it as relation `sample`.
-- $1 = source slug, $2 = salt (same salt → same sample), $3 = sample size.
SELECT
  l.id,
  l."vehicleId",
  l."sellerId",
  l."makeId",
  l."modelId",
  l.year,
  l."priceAmount",
  l.currency,
  l."priceUsd",
  l."mileageValue",
  l."mileageUnit",
  l."mileageKm",
  v.vin,
  v."originCountry",
  mk.slug AS make_slug,
  mk.name AS make_name,
  mk.aliases AS make_aliases,
  md.name AS model_name,
  src.type AS source_type,
  ls."rawPayload" AS raw_payload
FROM "Listing" l
JOIN "ListingSource" ls ON ls."listingId" = l.id
JOIN "Source" src ON src.id = ls."sourceId"
JOIN "Vehicle" v ON v.id = l."vehicleId"
JOIN "Make" mk ON mk.id = l."makeId"
JOIN "Model" md ON md.id = l."modelId"
WHERE src.slug = $1
ORDER BY md5(l.id::text || $2)
LIMIT $3
