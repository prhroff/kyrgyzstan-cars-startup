-- Price outside the market range for the same make and year ±2 (whole DB, other listings).
-- n ≥ 10: below p5/2 or above p95×2. Fewer data points: below 500 or above 300 000 USD.
SELECT
  s.id AS listing_id,
  'price' AS problem,
  format('%s %s %s: %s USD; рынок p5–p95 %s–%s (n=%s)',
    s.make_name, s.model_name, s.year, s."priceUsd", st.p5, st.p95, st.n) AS details
FROM sample s
CROSS JOIN LATERAL (
  SELECT
    count(*) AS n,
    percentile_disc(0.05) WITHIN GROUP (ORDER BY l."priceUsd") AS p5,
    percentile_disc(0.95) WITHIN GROUP (ORDER BY l."priceUsd") AS p95
  FROM "Listing" l
  WHERE l."makeId" = s."makeId"
    AND l.year BETWEEN s.year - 2 AND s.year + 2
    AND l.id <> s.id
) st
WHERE (st.n >= 10 AND (s."priceUsd" < st.p5 / 2 OR s."priceUsd" > st.p95 * 2))
   OR (st.n < 10 AND (s."priceUsd" < 500 OR s."priceUsd" > 300000))
