-- Mileage stored as km although the raw ad mentions miles, or a US car with km and no raw proof.
SELECT
  s.id AS listing_id,
  'miles' AS problem,
  format('%s %s %s: %s %s, origin=%s; %s',
    s.make_name, s.model_name, s.year, s."mileageValue", s."mileageUnit", s."originCountry",
    CASE WHEN raw_miles THEN 'в тексте мили' ELSE 'авто из США, пробег в км' END) AS details
FROM (
  SELECT
    s.*,
    coalesce(s.raw_payload::text ~* '\d[\d\s.,]*\s*(mi|miles|миль|мили)([^[:alpha:]]|$)', false)
      AS raw_miles
  FROM sample s
) s
WHERE s."mileageValue" IS NOT NULL
  AND s."mileageUnit" = 'km'
  AND (s.raw_miles OR s."originCountry" = 'usa')
