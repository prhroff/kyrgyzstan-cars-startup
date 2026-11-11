-- Likely duplicate not in a shared DuplicateCluster: same Vehicle (VIN is unique per Vehicle),
-- or same make/model/year/priceUsd and a shared seller phone.
SELECT
  s.id AS listing_id,
  'duplicate' AS problem,
  format('совпадает с %s (%s), общего кластера нет', d.id, d.reason) AS details
FROM sample s
CROSS JOIN LATERAL (
  SELECT
    l.id,
    CASE WHEN l."vehicleId" = s."vehicleId" THEN 'тот же vehicle/VIN' ELSE 'авто+цена+телефон' END
      AS reason
  FROM "Listing" l
  WHERE l.id <> s.id
    AND (
      l."vehicleId" = s."vehicleId"
      OR (
        l."makeId" = s."makeId"
        AND l."modelId" = s."modelId"
        AND l.year = s.year
        AND l."priceUsd" = s."priceUsd"
        AND EXISTS (
          SELECT 1
          FROM "SellerPhone" p1
          JOIN "SellerPhone" p2 ON p2."phoneE164" = p1."phoneE164"
          WHERE p1."sellerId" = s."sellerId" AND p2."sellerId" = l."sellerId"
        )
      )
    )
    AND NOT EXISTS (
      SELECT 1
      FROM "DuplicateClusterMember" a
      JOIN "DuplicateClusterMember" b ON b."clusterId" = a."clusterId"
      WHERE a."listingId" = s.id AND b."listingId" = l.id
    )
  LIMIT 1
) d
