# packages/db

Перед работой прочитай `docs/db.md` (схема, инварианты, миграции).

- `src/listings.ts` — **единственный** писатель денормализованных полей Listing. Не писать
  `makeId/modelId/year/mileageKm/priceUsd` и make/model/year у Vehicle напрямую.
- `src/generated/**` — сгенерировано `prisma generate`, не трогать и не читать без нужды
  (типы смотри через `schema.prisma`).
- После правки `prisma/schema.prisma`: `pnpm db:migrate`; enum — синхронно с
  `packages/core/src/enums.ts`.
- Нужен SQL, который Prisma не выражает, → `prisma migrate dev --create-only` и дописать SQL.
- Тесты: `pnpm --filter @repo/db test`. DB-тесты (`*.db.test.ts`) идут только при
  `TEST_DATABASE_URL`, трогают лишь свои строки.
- `prisma.config.ts` читает корневые `.env.local` → `.env`; CLI берёт `DATABASE_URL_UNPOOLED`.
- Сид идемпотентный (upsert); новые справочные данные — в `prisma/seed/*.ts` + проверка в
  `seed-data.test.ts`.
- Строки подключения не выводить: маскируй `sed -E 's#postgres(ql)?://[^ ]+#<redacted>#g'`.
