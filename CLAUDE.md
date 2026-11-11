# CLAUDE.md

## Продукт

Агрегатор и классифайд объявлений о продаже авто в Кыргызстане. Два источника объявлений:
пользователи размещают сами + парсинг внешних источников (Telegram-каналы, фиды/сайты дилеров).
Ключевая ценность — **доверие**: история цены, склейка дублей между источниками, проверка VIN,
оценка цены относительно рынка. Любое решение по данным оценивай через вопрос «не теряем ли мы
доверие/прослеживаемость».

## Стек

pnpm workspaces + Turborepo · TypeScript strict · Node 22+ · PostgreSQL 16 · Prisma 7 (driver adapter
`@prisma/adapter-pg`, ESM-клиент) · zod 4 · vitest · ESLint 9 (flat) + Prettier.

## Структура

- `apps/` — пусто (будут web, bot, workers).
- `packages/config` — общие `tsconfig/base.json`, `tsconfig/library.json`, ESLint (`createConfig`), Prettier.
- `packages/core` — доменные enum'ы (`enums.ts` — единый источник значений), `env.ts` (zod-валидация
  env), утилиты: `normalizePhone` (+ конфиг операторов `phone/kg-operators.ts`), `normalizeMileage`,
  `validateVin`, `parsePrice`.
- `packages/db` — `prisma/schema.prisma`, `prisma/migrations`, сид `prisma/seed/`, клиент
  (`src/client.ts`), курсы (`src/exchange-rates.ts`), **слой записи объявлений** (`src/listings.ts`).

Внутренние пакеты экспортируют `dist/`, плюс условие `@repo/source` → `src/*.ts` (используется tsx в сиде).
Turbo собирает зависимости перед typecheck/lint/test (`dependsOn: ["^build"]`).

## Команды

```bash
pnpm i && docker compose up -d && pnpm db:migrate && pnpm db:seed   # с нуля
pnpm test | pnpm lint | pnpm typecheck | pnpm build | pnpm format
pnpm db:migrate     # после правки schema.prisma — создаёт и применяет миграцию
pnpm db:deploy      # только применить миграции
pnpm db:seed        # идемпотентный, можно запускать повторно
pnpm db:studio
TEST_DATABASE_URL=... pnpm test   # + интеграционные DB-тесты
```

## Правила

- **TypeScript strict, без `any`** (ESLint `no-explicit-any: error`). Для неизвестных данных —
  `unknown` + zod. Включены `noUncheckedIndexedAccess` и `exactOptionalPropertyTypes`; если
  `exactOptionalPropertyTypes` начнёт серьёзно мешать с Prisma/zod — отключить в
  `packages/config/tsconfig/base.json` и записать это здесь, но не обходить через `any`.
- **Каждая утилита — с тестами** (`*.test.ts` рядом с файлом).
- **Цены — integer в целых единицах валюты** (доллары, сомы). Без float, без центов/тыйынов, без BigInt.
  `priceUsd` — тоже Int в целых долларах. Курс (`ExchangeRate.rate`) — Decimal.
- **Телефоны — только E.164** (`+996XXXXXXXXX`), через `normalizePhone`. Префиксы операторов живут
  только в `kg-operators.ts`; неизвестный префикс не отбрасывается, а помечается `knownPrefix: false`.
- **VIN** — через `validateVin` перед записью; хранится в верхнем регистре.
- **Денормализованные поля Listing** (`makeId`, `modelId`, `year`, `mileageKm`, `priceUsd`) пишутся
  **только** функциями из `packages/db/src/listings.ts` (`createListing`, `updateListingPrice`,
  `updateListingMileage`, `updateVehicle`, `moveListingToVehicle`, `refreshKgsPriceUsd`). Изменение
  make/model/year у Vehicle — только через `updateVehicle`. `findListingDrift` обязан возвращать `[]`.
- **Каждое объявление имеет ListingSource**; пользовательские — через системный Source `user`
  (`USER_SOURCE_SLUG`).
- **Enum'ы**: значения в `schema.prisma` и `packages/core/src/enums.ts` должны совпадать (тест
  `packages/db/src/enums.test.ts`). Добавляешь значение — меняй оба места.
- **Миграции только через `prisma migrate`**. Не править применённые миграции. CHECK-ограничения
  и прочий SQL, который Prisma не выражает, — дописывать в миграцию, созданную
  `prisma migrate dev --create-only`.
- **Не трогать сгенерированные файлы**: `packages/db/src/generated/**`, `dist/`, `pnpm-lock.yaml` руками.
- **Секреты не коммитить**: `.env` в `.gitignore`, новые переменные — в `.env.example` и zod-схему.
- **Маленькие коммиты** по логическим шагам, Conventional Commits (`feat(core): …`, `fix(db): …`).
- Nullable `Boolean?` в данных из парсинга означает «неизвестно» — не подставлять `false`.
