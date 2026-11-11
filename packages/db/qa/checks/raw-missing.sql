-- Parsed listing without rawPayload: traceability lost.
SELECT
  s.id AS listing_id,
  'raw-missing' AS problem,
  format('источник типа %s, rawPayload пуст', s.source_type) AS details
FROM sample s
WHERE s.source_type <> 'user'
  AND s.raw_payload IS NULL
