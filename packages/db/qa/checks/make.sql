-- Make not confirmed by the raw ad: neither its name, slug nor any alias occurs in rawPayload.
-- Listing.makeId is NOT NULL, so a wrongly guessed make shows up exactly like this.
SELECT
  s.id AS listing_id,
  'make' AS problem,
  format('марка %s (%s) не встречается в сыром тексте', s.make_name, s.make_slug) AS details
FROM sample s
WHERE s.raw_payload IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM unnest(s.make_aliases || ARRAY[s.make_name, s.make_slug]) AS a(alias)
    WHERE length(a.alias) > 0
      AND position(lower(a.alias) IN lower(s.raw_payload::text)) > 0
  )
