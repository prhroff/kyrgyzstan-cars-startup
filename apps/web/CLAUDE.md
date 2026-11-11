# apps/web — правила интерфейса

Next.js (App Router) + Tailwind v4 + React Aria Components. Иконки — только `lucide-react`.

## Стили

- Единственный источник стилей — `src/styles/tokens.css`. Стандартная тема Tailwind сброшена
  (`--color-*: initial` и т.д.): в классах доступны только токены. Нужен новый цвет/размер —
  добавь токен, а не значение в класс.
- Arbitrary values (`text-[13px]`, `bg-[#fff]`, `p-[7px]`) запрещены. Для раскладки есть короткий
  allowlist в `src/ui-rules.test.ts` — пополнять только при отсутствии способа через токены.
- Состояния: `ui-hover:`, `ui-focus:`, `ui-focus-within:`, `ui-pressed:` (из `globals.css`), а не
  `hover:`/`focus:`. Они работают от data-атрибутов React Aria и от `data-demo` на витрине.
- Без tailwind-merge: не передавай классы, которые конфликтуют с базовыми (`rounded-none` поверх
  `rounded-md`) — делай проп или условие.

## Направление

Визуальный язык — `docs/design/direction.md` (+ референсы в `docs/design/references/`):
чёрно-белая основа, главные кнопки `bg-primary`, синий `accent` — только ссылки, фокус, выбранное.
Скругления: `rounded-xs` (только чекбокс) / `sm` 8 / `md` 12 (поля) / `lg` 16 (карточки, фото) /
`xl` 24 (галерея, шторки) / `full` (кнопки, метки, чипы). Подложки `surface-muted` вместо рамок.
Заголовки — `tracking-tight`, H1 `text-3xl lg:text-5xl`.

## Запреты

- Градиенты, glassmorphism, blur, эмодзи в интерфейсе, декоративные иллюстрации, логотипы брендов.
- Скругления вне шкалы; тени кроме `shadow-raised` (sticky-блоки, панель связи) и `shadow-overlay`
  (шторки, выпадающие списки, меню). У обычных карточек теней нет.
- Иконки не из Lucide, inline `<svg>` (кроме графика цены по allowlist), атрибут `style`.

Нарушения ловит `src/ui-rules.test.ts` (входит в `pnpm test`).

## Mobile-first

Большинство пользователей — с телефона. Базовые классы — для 375px, `sm:`/`lg:` — расширение.
Цели касания ≥ 44px (`h-11`). Проверка — скриншоты на 375px и 1280px:

```bash
pnpm dev                                             # в отдельном терминале
pnpm --filter @repo/web screenshots -- --sections    # → apps/web/.screenshots/
pnpm --filter @repo/web screenshots -- --click=Фильтры   # мобильная шторка фильтров
```

Скрипт падает при ошибках в консоли и горизонтальном скролле.

## Данные

- Типы — из `@repo/core` (enum'ы) и `@repo/db` (только `import type`, Prisma не попадает в бандл).
- Цены — `src/lib/format.ts`: «15 500 $», «1 350 000 сом». Пересчитанное помечается «≈».
- Тексты интерфейса — по `docs/tone-of-voice.md`.
- `null` из парсинга = «неизвестно»: не показывать как «нет» (растаможка, торг, пробег).
- Витрина компонентов: `/dev/ui` (только `NODE_ENV=development`), данные — `src/dev/fixtures.ts`.
