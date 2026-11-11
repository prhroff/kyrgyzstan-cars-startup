# Авто-агрегатор КР

Агрегатор и классифайд объявлений о продаже авто в Кыргызстане: объявления пользователей + парсинг
Telegram-каналов и сайтов дилеров. Ценность — доверие: история цены, склейка дублей, проверка VIN,
оценка «ниже / в рынке / дорого».

Сейчас в репозитории только фундамент: схема данных, доменные утилиты, инфраструктура.

## Быстрый старт

Нужны Node 22+, Docker и pnpm (`corepack enable`).

```bash
cp .env.example .env
pnpm i && docker compose up -d && pnpm db:migrate && pnpm db:seed
```

Свой Postgres (локальный или Neon) вместо Docker: укажите `DATABASE_URL` в `.env` и пропустите
`docker compose up -d`.

## Команды

| Команда                             | Что делает                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| `pnpm build`                        | Сборка всех пакетов (Turborepo)                                                |
| `pnpm dev`                          | Watch-режим пакетов                                                            |
| `pnpm test`                         | Тесты (vitest). DB-тесты включаются при заданном `TEST_DATABASE_URL`           |
| `pnpm lint` / `pnpm typecheck`      | ESLint / tsc                                                                   |
| `pnpm format` / `pnpm format:check` | Prettier                                                                       |
| `pnpm db:migrate`                   | `prisma migrate dev` — применить миграции / создать новую после правки схемы   |
| `pnpm db:deploy`                    | `prisma migrate deploy` — только применить (CI, прод)                          |
| `pnpm db:seed`                      | Справочники: регионы, города, марки/модели, системный источник, стартовый курс |
| `pnpm db:studio`                    | Prisma Studio                                                                  |

## Структура

```
apps/               приложения (web, bot, workers) — пока пусто
packages/config     общие tsconfig, ESLint, Prettier
packages/core       доменные enum'ы, zod-схемы, env, утилиты нормализации
packages/db         Prisma-схема, миграции, клиент, слой записи объявлений, сид
```

Подробные правила разработки — в [CLAUDE.md](CLAUDE.md).
