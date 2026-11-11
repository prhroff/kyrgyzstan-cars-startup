# База данных

PostgreSQL 18 (Neon — прод; та же мажорная версия в docker-compose и CI), Prisma 7 с driver adapter
`@prisma/adapter-pg`. Схема: `packages/db/prisma/schema.prisma` — источник правды.

## Модели (кратко)

- **Справочники**: `Region` (область или город респ. значения) → `City`; `Make` → `Model` →
  `Generation` (code, yearFrom, yearTo). У Make/Model есть `aliases[]` для парсеров.
- **Vehicle** — физическая машина: `vin` (nullable, unique), make/model/generation, year, specs
  (все nullable: парсинг неполный). Объём двигателя — `engineVolumeCc` (см³), батарея — Decimal кВт·ч.
- **Listing** — объявление. Дубли с разных источников — **отдельные** Listing, связанные через
  `DuplicateCluster`. Статусы: draft, active, sold, archived, removed; `closedAt` — когда ушло из active.
- **Source** — конкретный канал/дилер/сайт или системный `user`. Поле `defaultCurrency` передаётся
  в `parsePrice`.
- **ListingSource** — 1:1 с Listing: `sourceId`, `externalId`, URL, `rawPayload` (jsonb),
  `lastSyncedAt`. Unique `(sourceId, externalId)`. У пользовательских объявлений `externalId` = id
  объявления.
- **Seller** (`origin`: registered | parsed, `claimedAt`) + **SellerPhone** (E.164, индекс по номеру,
  глобально не unique — парсенные продавцы могут делить номер до склейки). `Listing.sellerId` nullable.
- **PriceHistory** — каждое реальное изменение цены (amount, currency, priceUsd, observedAt).
- **Photo** — `sha256` (точные копии), `phash` как 16 hex-символов (строка, не BigInt — JSON-safe).
- **DuplicateCluster** (+ `canonicalListingId`) и **DuplicateClusterMember** (`listingId` unique,
  `reason`: vin | phone_params | photo_hash, `confidence` 0..1).
- **ExchangeRate** — `1 base = rate quote` на дату, `rate` Decimal(14,6).

ID: UUID v7 для сущностей, Int autoincrement для справочников.

## Инвариант денормализации Listing

| Поле Listing                | Источник правды                           |
| --------------------------- | ----------------------------------------- |
| `makeId`, `modelId`, `year` | `Vehicle`                                 |
| `mileageKm`                 | `mileageValue` + `mileageUnit`            |
| `priceUsd`                  | `priceAmount` + `currency` + курс USD→KGS |

Пишутся **только** функциями `packages/db/src/listings.ts`:
`createListing` (+ ListingSource + первая запись PriceHistory), `updateListingPrice` (история —
только при реальном изменении), `updateListingMileage`, `updateVehicle` (пропагирует на все
объявления машины), `moveListingToVehicle` (склейка по VIN), `refreshKgsPriceUsd` (после загрузки
нового курса). Остальные поля Listing (description, status…) можно обновлять напрямую.

`findListingDrift(db)` ищет расхождения и обязан возвращать `[]`. KGS→USD не проверяется (зависит
от курса на момент записи). Покрыто `listings.test.ts` (чистая логика) и `listings.db.test.ts`.

Нет курса USD→KGS → `MissingExchangeRateError` при записи KGS-объявления. Сид кладёт стартовый курс.

## Индексы под поиск

`(status, makeId, modelId, year, priceUsd)`, `(status, priceUsd)`, `(status, publishedAt desc)`,
`(cityId, status)`, `vehicleId`, `sellerId`; `Vehicle.vin` unique; `SellerPhone.phoneE164`;
`Photo.phash`, `Photo.sha256`.

## CHECK-ограничения

Prisma их не выражает и не учитывает при diff (drift не возникает). Лежат в конце
`migrations/20261111000000_init/migration.sql`: цены > 0, год 1900–2100, пробег ≥ 0, пара
`mileageValue`/`mileageUnit` задаётся вместе, формат VIN, E.164, hex для phash/sha256,
confidence 0..1, курс > 0 и base ≠ quote, `yearTo ≥ yearFrom`.

## Миграции

- Правка схемы → `pnpm db:migrate` (`prisma migrate dev`). Применённые миграции не править.
- Нужен SQL, который Prisma не умеет (CHECK, partial index, триггер) →
  `pnpm --filter @repo/db exec prisma migrate dev --create-only`, дописать SQL, затем `db:migrate`.
- Прод/CI — `pnpm db:deploy`. CI проверяет drift: `prisma migrate diff --from-config-datasource
--to-schema prisma/schema.prisma --exit-code`.
- Миграции на прод-данных сначала проверять на ветке Neon (`neon checkout <name> --create`).
- После правки enum в схеме — синхронно поменять `packages/core/src/enums.ts` (тест `enums.test.ts`).

## Подключение

- Env-файлы: корневой `.env.local` (из `neon env pull --file .env.local`) приоритетнее `.env`.
  Без обоих — docker-compose по умолчанию (`postgresql://auto:auto@localhost:5432/auto`).
- Prisma CLI (migrate/diff/studio) использует прямой `DATABASE_URL_UNPOOLED` — через пулер
  (`-pooler`, PgBouncer) миграции падают. Приложение и сид — пулинг `DATABASE_URL`.
- Клиент: `getPrisma()` (синглтон из валидированного env) или `createPrismaClient(url)`.
  Транзакции — `withTransaction(db, fn)` (переиспользует внешнюю транзакцию).

## Сид

`pnpm db:seed` — идемпотентный (upsert по естественным ключам): 9 регионов, 26 городов, 30 марок,
~215 моделей, поколения для ходовых моделей, системный Source `user` (`USER_SOURCE_SLUG`),
стартовый курс 87.45 (**заглушка**, не реальные данные — нужен job курса НБКР).
Данные: `prisma/seed/regions.ts`, `prisma/seed/catalog.ts`; тест консистентности `seed-data.test.ts`.
