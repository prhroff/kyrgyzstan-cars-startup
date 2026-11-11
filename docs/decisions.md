# Журнал решений

Формат: дата — решение. Почему (1–3 строки). Новые записи — в конец.

**2026-11-11 — Цены Int в целых единицах валюты, не центы и не BigInt.**
Копейки для авто не нужны; Int покрывает ~2,1 млрд сом; BigInt ломает JSON-сериализацию.
`ExchangeRate.rate` — Decimal, `priceUsd` — Int.

**2026-11-11 — Дубли — отдельные Listing + DuplicateCluster, а не одно объявление с многими источниками.**
Сохраняется история и цена каждого источника (прослеживаемость). Причина и уверенность — на
членстве в кластере, у кластера есть канонический Listing.

**2026-11-11 — Денормализация полей поиска в Listing (make/model/year/mileageKm/priceUsd).**
Составной индекс через JOIN с Vehicle невозможен. Расхождения исключены единым слоем записи
`listings.ts` + `findListingDrift`. Триггер в БД — возможная будущая замена.

**2026-11-11 — priceUsd хранится рядом с исходной ценой; курсы в таблице ExchangeRate.**
Иначе нельзя сортировать USD и KGS вместе. KGS-цены пересчитываются `refreshKgsPriceUsd`.

**2026-11-11 — Source + ListingSource, системный Source `user`.**
`externalId` уникален только внутри канала; все объявления (включая пользовательские) идут через
ListingSource единообразно.

**2026-11-11 — Seller.origin (registered | parsed) + claimedAt, Listing.sellerId nullable.**
Продавцы из парсинга смогут «забрать» свои объявления.

**2026-11-11 — Телефоны в отдельной таблице SellerPhone, без глобальной уникальности.**
У продавца 2–3 номера; склейка «телефон + параметры» ищет по номеру.

**2026-11-11 — Неизвестный префикс оператора не отбрасываем (knownPrefix: false).**
Префиксы переназначаются; потеря валидного номера хуже, чем флаг.

**2026-11-11 — parsePrice: defaultCurrency источника важнее эвристики (<300 000 → USD).**
У Telegram-каналов валюта обычно постоянная. Голые числа < 1000 — тысячи с флагом.

**2026-11-11 — VIN: контрольная цифра обязательна только для WMI 1–5 и L.**
Корейские/японские/европейские VIN часто без неё — отказ потерял бы реальные машины.

**2026-11-11 — phash как hex-строка Char(16), не BigInt.**
JSON-safe; беззнаковые 64 бита не влезают в signed bigint без переинтерпретации.

**2026-11-11 — Nullable Boolean для растаможки/учёта/торга.**
`false` ≠ «неизвестно»; парсинг часто не знает.

**2026-11-11 — Prisma 7 (driver adapter pg, ESM-клиент в src/generated), TypeScript 6.0, ESLint 9.**
Prisma 8 была в RC; typescript-eslint не поддерживает TS 7.

**2026-11-11 — Внутренние пакеты: exports на dist + условие `@repo/source` → src.**
Turbo собирает зависимости перед typecheck/test; tsx в сиде запускает исходники без сборки.

**2026-11-11 — CHECK-ограничения дописаны вручную в init-миграцию.**
Prisma их не выражает и не учитывает в diff — drift не возникает.

**2026-11-11 — exactOptionalPropertyTypes оставлен включённым.**
С Prisma 7 и zod не мешает. Если начнёт — отключить и записать сюда, но не обходить через `any`.

**2026-11-11 — Без .env используется docker-compose URL по умолчанию.**
Чтобы `pnpm i && docker compose up -d && pnpm db:migrate && pnpm db:seed` работало с нуля.

**2026-11-11 — Neon в проде; .env.local приоритетнее .env; Prisma CLI — DATABASE_URL_UNPOOLED.**
Миграции через пулер (PgBouncer) падают; приложение использует пулинг.

**2026-11-11 — Postgres 18 везде (Neon, docker-compose, CI).**
Neon работает на 18; одна мажорная версия во всех окружениях. Volume в compose — `/var/lib/postgresql`.

**2026-11-11 — pnpm 12: allowBuilds для prisma, @prisma/engines, esbuild.**
pnpm 12 по умолчанию блокирует install-скрипты зависимостей и падает с ошибкой.

**2026-11-11 — Проект и dev-кэши только на диске E; на C ничего не создаём.**
Диск C переполнен, прав администратора нет. Проект — `E:\startup-project`, кэши — `E:\dev\.cache`:
pnpm store/cache/state (`pnpm config --location=global`), `npm_config_cache`, `COREPACK_HOME`,
`PLAYWRIGHT_BROWSERS_PATH` (пользовательские переменные через `setx`). Бэкап истории — `E:\dev\backup`.
Проверка, что кэши не растут на C (PowerShell; пусто или пара МБ — норма):
`"$env:LOCALAPPDATA\npm-cache","$env:LOCALAPPDATA\pnpm-cache","$env:LOCALAPPDATA\pnpm\store","$env:LOCALAPPDATA\node\corepack","$env:LOCALAPPDATA\ms-playwright","$env:USERPROFILE\.cache" | ? { Test-Path $_ } | % { "{0} {1:N0} MB" -f $_, ((gci $_ -r -fo -file -ea 0 | measure Length -sum).Sum/1MB) }`
Если папка снова появилась — значит, процесс запущен без новых переменных (перезапустить терминал/VS Code)
или инструмент их игнорирует; сверить `pnpm store path`, `npm config get cache`, `echo $env:COREPACK_HOME`.

**2026-11-11 — Проверки качества данных — фиксированные SQL в `packages/db/qa`.**
`qa/sample.sql` (детерминированная выборка источника) + `qa/checks/*.sql` (каждая возвращает
`listing_id, problem, details`). Раннер `pnpm --filter @repo/db qa <slug>` выполняет их только
внутри `BEGIN READ ONLY` и дополнительно отвергает не-SELECT. Агент data-qa запускает раннер, а не
пишет SQL сам. Новая проверка — новый файл в `qa/checks/`. «Неопознанная марка» = марка не
встречается в rawPayload (`Listing.makeId` обязателен, NULL невозможен).

**2026-11-11 — Защита секретов от Claude: permissions.deny + точный shell-хук.**
Основной механизм — `permissions.deny` в `.claude/settings.json` для Read/Edit `.env`,
`.env.local`, `.env.*.local`, `.env.{development,production,staging,test}`, ключей. Хук
`protect-secrets.mjs` (логика — `secret-guard.mjs`, тесты — `pnpm test:hooks`) — вторая линия для
файловых инструментов и единственная для Bash/PowerShell. Первая версия блокировала любое
упоминание `.env` в команде (даже в тексте коммита) — заменена разбором команды.
Блокируется: чтение/вывод содержимого (cat, type, Get-Content, more, less, head, tail, grep/rg/
findstr/Select-String по файлу или рекурсивно через каталог с секретом, `$(cat …)`, `node -e`
с readFileSync); вывод секретных переменных (`echo $DATABASE_URL`, `printenv`, `env`, `set`/
`export -p` без аргументов, `Get-ChildItem env:`, `console.log(process.env.X)`); запись/удаление
(перенаправление `>`, tee, Set-Content, rm, mv); `git add`/`git commit` с секретными файлами;
отключение gitleaks (`commit --no-verify`/`-n`, смена `core.hooksPath`, `git add -f .`). Разбор
видит группировки `( )`/`{ }`/`then`, `bash -c`, `eval`, `cmd /c`, `powershell -c`, `find -exec`,
`xargs`, глобы `*?[]{a,b}`, heredoc в shell/интерпретатор, `[IO.File]`/`[Environment]`.
Разрешено: упоминание в тексте, заметках, коммитах (тела heredoc и here-string — данные);
проверка существования (test -f, Test-Path, ls/dir, stat); `cp`/`Copy-Item .env.example .env`,
если цели ещё нет; программы проекта, которые сами читают env-файлы (prisma, тесты, скрипты,
`node --env-file`). Разбор эвристический — это страховка, а не граница безопасности; финальная
защита от утечки в git — gitleaks.
PostToolUse `format-ts.mjs` прогоняет Prettier по изменённому .ts-файлу (уважает .prettierignore,
никогда не блокирует).

**2026-11-11 — gitleaks 8.30.1: pre-commit и CI.**
Конфиг `.gitleaks.toml` = стандартные правила + свои: строка подключения с паролем (кроме
localhost/плейсхолдеров), Neon `npg_…`/`napi_…`, голый токен Telegram-бота — стандартные правила
их не ловят (проверено). Pre-commit: `.githooks/pre-commit` (`gitleaks git --pre-commit --staged`),
включается `pnpm install` через `prepare: git config core.hooksPath .githooks`; без gitleaks коммит
останавливается. Локально бинарь — `E:\dev\tools\gitleaks\gitleaks.exe` (sha256 сверен), путь — в
пользовательской переменной `GITLEAKS_BIN`. CI: job `secrets` — тот же пиннутый бинарь с проверкой
sha256, `gitleaks dir .` (все файлы) и `gitleaks git .` (вся история).

**2026-11-11 — Postgres закреплён на 18.6 в CI и docker-compose (как в Neon).**
`SELECT version()` на Neon (production) → `PostgreSQL 18.6`. Вместо плавающего `postgres:18-alpine`
— `postgres:18.6-alpine`: локально и в CI та же минорная версия, что в проде, образ не меняется сам.
Neon обновляет минорные версии автоматически — при расхождении проверить `SELECT version()` и
поднять тег в `docker-compose.yml` и `.github/workflows/ci.yml` вместе.

**2026-11-11 — UI: React Aria Components + свои стили на токенах, не Untitled UI.**
Untitled UI React (бесплатная часть — MIT) ставится копированием исходников через CLI, но его
компоненты завязаны на `@untitledui/icons` (у нас только Lucide), собственный большой `theme.css`
(конкурирует с `tokens.css` как единственным источником) и тени/объёмные эффекты (под запретом).
Берём движок, на котором он построен, — `react-aria-components` (Apache-2.0), стили свои; Untitled UI
— только образец API и набора состояний. Tailwind v4: стандартная тема сброшена в `tokens.css`
(`--color-*: initial` и т.п.), поэтому в классах есть только токены; запреты дополнительно ловит
`apps/web/src/ui-rules.test.ts` (arbitrary values разрешены лишь для раскладки по allowlist).
Состояния — свои варианты `ui-hover/ui-focus/…` от data-атрибутов React Aria (нет «залипшего»
hover на тач-экранах) + `data-demo` для статичных скриншотов витрины. `MarketPosition`
(ниже/в рынке/дорого) пока UI-тип в web — в схеме его нет; перенести в core с джобом оценки.

**2026-11-11 — Позиционирование: доска объявлений с упором на доверие, а не агрегатор.**
На сайте только объявления, поданные у нас (частники + вручную заведённые дилеры): чужие объявления не
проверяют гипотезу «продавцы размещают, покупатели звонят». Парсинг — за кулисами, для оценки к рынку.
Схема Source / ListingSource / DuplicateCluster не меняется. Объём MVP — `docs/mvp.md`.

**2026-11-11 — Год авто 1950…(текущий год + 1), единый источник `@repo/core/year.ts`.**
Верх — модельный год, не хардкодим. В БД нижняя граница — CHECK, верхняя — триггер: CHECK
с now() не immutable (ломает дамп/restore). Совпадение с core проверяет тест.

**2026-11-11 — Tone of voice — `docs/tone-of-voice.md`.**
На «вы», факты с источником вместо оценок; «проверено» только с кем и когда, «гарантия» — никогда.
