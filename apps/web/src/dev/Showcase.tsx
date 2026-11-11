"use client";

import { ArrowRight, Plus, RefreshCw, SearchX, Share2, Trash2, WifiOff } from "lucide-react";
import { useState } from "react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button, type ButtonVariant } from "@/components/ui/Button";
import { CarCard } from "@/components/ui/CarCard";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterFields, FilterPanel, FilterSheetFrame } from "@/components/ui/FilterPanel";
import { Gallery } from "@/components/ui/Gallery";
import { Input } from "@/components/ui/Input";
import { PriceTag } from "@/components/ui/PriceTag";
import { Select } from "@/components/ui/Select";
import { CarCardSkeleton, LoadingRegion, Skeleton } from "@/components/ui/Skeleton";
import { EMPTY_FILTERS, type FilterValues } from "@/lib/filters";
import { vinLengthMessage, yearRangeMessage } from "@/lib/messages";
import {
  CITIES,
  DEV_NOW,
  DEV_USD_KGS_RATE,
  EDGE_CASE_LISTINGS,
  MAKE_OPTIONS,
  makeListings,
} from "./fixtures";
import { ListingSections } from "./ListingSections";
import { Section, State } from "./showcase-parts";

const LISTINGS = makeListings(6, 42);
const [EDGE_LONG, EDGE_EMPTY, EDGE_TRANSIT] = EDGE_CASE_LISTINGS;

const COLOR_SWATCHES: { name: string; className: string }[] = [
  { name: "surface", className: "bg-surface" },
  { name: "surface-subtle", className: "bg-surface-subtle" },
  { name: "surface-muted", className: "bg-surface-muted" },
  { name: "surface-strong", className: "bg-surface-strong" },
  { name: "line", className: "bg-line" },
  { name: "line-strong", className: "bg-line-strong" },
  { name: "fg", className: "bg-fg" },
  { name: "fg-muted", className: "bg-fg-muted" },
  { name: "fg-subtle", className: "bg-fg-subtle" },
  { name: "primary", className: "bg-primary" },
  { name: "primary-hover", className: "bg-primary-hover" },
  { name: "accent", className: "bg-accent" },
  { name: "accent-hover", className: "bg-accent-hover" },
  { name: "accent-subtle", className: "bg-accent-subtle" },
  { name: "success", className: "bg-success" },
  { name: "warning", className: "bg-warning" },
  { name: "danger", className: "bg-danger" },
  { name: "market-below", className: "bg-market-below" },
  { name: "market-fair", className: "bg-market-fair" },
  { name: "market-above", className: "bg-market-above" },
];

const RADII = [
  { name: "xs 4 (чекбокс)", className: "rounded-xs" },
  { name: "sm 8", className: "rounded-sm" },
  { name: "md 12 (поля)", className: "rounded-md" },
  { name: "lg 16 (карточки)", className: "rounded-lg" },
  { name: "xl 24 (галерея)", className: "rounded-xl" },
  { name: "full (кнопки)", className: "rounded-full" },
];

const TYPE_SCALE = [
  { name: "5xl", className: "text-5xl font-semibold tracking-tight" },
  { name: "4xl", className: "text-4xl font-semibold tracking-tight" },
  { name: "3xl", className: "text-3xl font-semibold tracking-tight" },
  { name: "2xl", className: "text-2xl font-semibold" },
  { name: "xl", className: "text-xl font-semibold" },
  { name: "lg", className: "text-lg" },
  { name: "base", className: "text-base" },
  { name: "sm", className: "text-sm" },
  { name: "xs", className: "text-xs" },
];

const BADGE_TONES: BadgeTone[] = [
  "neutral",
  "accent",
  "success",
  "warning",
  "danger",
  "market-below",
  "market-fair",
  "market-above",
];

const BUTTON_VARIANTS: ButtonVariant[] = ["primary", "secondary", "ghost", "danger"];

const SELECT_OPTIONS = MAKE_OPTIONS.map(({ id, label }) => ({ id, label }));

export function Showcase() {
  const [filters, setFilters] = useState<FilterValues>({
    ...EMPTY_FILTERS,
    make: "toyota",
    yearFrom: 2018,
    fuel: ["petrol", "hybrid"],
  });
  const [invalidFilters, setInvalidFilters] = useState<FilterValues>({
    ...EMPTY_FILTERS,
    yearFrom: 2022,
    yearTo: 2018,
  });

  if (!EDGE_LONG || !EDGE_EMPTY || !EDGE_TRANSIT) return null;

  return (
    <main className="mx-auto flex w-full max-w-content flex-col px-4 pb-16">
      <header className="flex flex-col gap-1 py-8">
        <h1 className="text-2xl font-semibold text-fg">Витрина компонентов</h1>
        <p className="text-sm text-fg-muted">
          Только для разработки. Состояния hover / focus / pressed показаны принудительно через
          data-demo.
        </p>
      </header>

      <Section id="tokens" title="Токены">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {COLOR_SWATCHES.map((c) => (
            <div key={c.name} className="flex min-w-0 flex-col gap-1">
              <div className={`h-12 rounded-md ${c.className}`} />
              <span className="truncate text-xs text-fg-muted">{c.name}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {TYPE_SCALE.map((t) => (
            <p key={t.name} className={`${t.className} truncate text-fg`}>
              <span className="mr-3 inline-block w-10 text-xs text-fg-subtle">{t.name}</span>
              Toyota Camry 2021 — 15 500 $
            </p>
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          {RADII.map((r) => (
            <State key={r.name} label={r.name}>
              <div className={`size-16 bg-surface-muted ${r.className}`} />
            </State>
          ))}
          <State label="shadow-raised">
            <div className="size-16 rounded-lg bg-surface shadow-raised" />
          </State>
          <State label="shadow-overlay">
            <div className="size-16 rounded-lg bg-surface shadow-overlay" />
          </State>
        </div>
      </Section>

      <Section id="button" title="Button">
        {BUTTON_VARIANTS.map((variant) => (
          <div key={variant} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <State label={`${variant} · обычная`}>
              <Button variant={variant}>Найти</Button>
            </State>
            <State label="наведение" demo="hover">
              <Button variant={variant}>Найти</Button>
            </State>
            <State label="фокус" demo="focus">
              <Button variant={variant}>Найти</Button>
            </State>
            <State label="нажатие" demo="pressed">
              <Button variant={variant}>Найти</Button>
            </State>
            <State label="отключена">
              <Button variant={variant} isDisabled>
                Найти
              </Button>
            </State>
            <State label="загрузка">
              <Button variant={variant} isPending>
                Найти
              </Button>
            </State>
          </div>
        ))}
        <div className="flex flex-wrap items-end gap-3">
          <State label="sm">
            <Button size="sm" iconLeading={Plus}>
              Подать объявление
            </Button>
          </State>
          <State label="md">
            <Button iconTrailing={ArrowRight}>Показать</Button>
          </State>
          <State label="lg">
            <Button size="lg">Показать телефон</Button>
          </State>
          <State label="только иконка">
            <Button variant="secondary" iconOnly iconLeading={Share2} aria-label="Поделиться" />
          </State>
          <State label="danger + иконка">
            <Button variant="danger" iconLeading={Trash2}>
              Удалить
            </Button>
          </State>
        </div>
      </Section>

      <Section id="input" title="Input">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <State label="обычное">
            <Input label="Пробег" placeholder="Например, 85 000" suffix="км" inputMode="numeric" />
          </State>
          <State label="наведение" demo="hover">
            <Input label="Пробег" placeholder="Например, 85 000" suffix="км" />
          </State>
          <State label="фокус" demo="focus">
            <Input label="Пробег" defaultValue="85000" suffix="км" />
          </State>
          <State label="с подсказкой">
            <Input
              label="VIN"
              placeholder="17 символов"
              description="Латиница и цифры, без I, O, Q"
            />
          </State>
          <State label="отключено">
            <Input label="Пробег" defaultValue="85000" suffix="км" isDisabled />
          </State>
          <State label="ошибка">
            <Input
              label="VIN"
              defaultValue="JTDBR32E60"
              isInvalid
              errorMessage={vinLengthMessage("JTDBR32E60")}
            />
          </State>
          <State label="ошибка + фокус" demo="focus">
            <Input
              label="Год"
              defaultValue="1890"
              isInvalid
              errorMessage={yearRangeMessage(DEV_NOW)}
            />
          </State>
          <State label="без подписи (aria-label)">
            <Input aria-label="Поиск" placeholder="Марка, модель или VIN" />
          </State>
        </div>
      </Section>

      <Section id="select" title="Select">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <State label="обычное">
            <Select label="Марка" options={SELECT_OPTIONS} />
          </State>
          <State label="наведение" demo="hover">
            <Select label="Марка" options={SELECT_OPTIONS} />
          </State>
          <State label="фокус" demo="focus">
            <Select label="Марка" options={SELECT_OPTIONS} defaultValue="toyota" />
          </State>
          <State label="выбрано">
            <Select label="Марка" options={SELECT_OPTIONS} defaultValue="mercedes-benz" />
          </State>
          <State label="отключено">
            <Select label="Модель" options={[]} isDisabled description="Сначала выберите марку" />
          </State>
          <State label="ошибка">
            <Select label="Город" options={[]} isInvalid errorMessage="Укажите город" />
          </State>
        </div>
      </Section>

      <Section id="checkbox" title="Checkbox">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          <State label="обычное">
            <Checkbox>Растаможен</Checkbox>
          </State>
          <State label="выбрано">
            <Checkbox defaultSelected>Растаможен</Checkbox>
          </State>
          <State label="частично">
            <Checkbox isIndeterminate>Все виды топлива</Checkbox>
          </State>
          <State label="наведение" demo="hover">
            <Checkbox>Растаможен</Checkbox>
          </State>
          <State label="фокус" demo="focus">
            <Checkbox defaultSelected>Растаможен</Checkbox>
          </State>
          <State label="отключено">
            <Checkbox isDisabled>Растаможен</Checkbox>
          </State>
          <State label="отключено + выбрано">
            <Checkbox isDisabled defaultSelected>
              Растаможен
            </Checkbox>
          </State>
          <State label="ошибка">
            <Checkbox isInvalid>Принимаю правила</Checkbox>
          </State>
        </div>
      </Section>

      <Section id="badge" title="Badge">
        <div className="flex flex-wrap gap-2">
          {BADGE_TONES.map((tone) => (
            <Badge key={tone} tone={tone}>
              {tone}
            </Badge>
          ))}
        </div>
      </Section>

      <Section id="price" title="PriceTag">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <State label="USD · ниже рынка">
            <PriceTag
              amount={15500}
              currency="USD"
              priceUsd={15500}
              usdKgsRate={DEV_USD_KGS_RATE}
              market="below"
            />
          </State>
          <State label="USD · в рынке">
            <PriceTag
              amount={23900}
              currency="USD"
              priceUsd={23900}
              usdKgsRate={DEV_USD_KGS_RATE}
              market="fair"
            />
          </State>
          <State label="KGS · дорого">
            <PriceTag
              amount={1350000}
              currency="KGS"
              priceUsd={15437}
              usdKgsRate={DEV_USD_KGS_RATE}
              market="above"
            />
          </State>
          <State label="без оценки, lg">
            <PriceTag
              amount={102344}
              currency="USD"
              priceUsd={102344}
              usdKgsRate={DEV_USD_KGS_RATE}
              size="lg"
            />
          </State>
        </div>
      </Section>

      <Section id="card" title="CarCard">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <State label="длинные названия · дилер">
            <CarCard
              listing={EDGE_LONG}
              href="#"
              usdKgsRate={DEV_USD_KGS_RATE}
              now={DEV_NOW}
              priority
            />
          </State>
          <State label="пустые поля, нет фото, черновик">
            <CarCard listing={EDGE_EMPTY} href="#" usdKgsRate={DEV_USD_KGS_RATE} now={DEV_NOW} />
          </State>
          <State label="в пути · импортёр · наведение" demo="hover">
            <CarCard listing={EDGE_TRANSIT} href="#" usdKgsRate={DEV_USD_KGS_RATE} now={DEV_NOW} />
          </State>
          <State label="фокус с клавиатуры" demo="focus">
            <CarCard
              listing={LISTINGS[0] ?? EDGE_TRANSIT}
              href="#"
              usdKgsRate={DEV_USD_KGS_RATE}
              now={DEV_NOW}
            />
          </State>
          {LISTINGS.slice(1).map((l) => (
            <State key={l.id} label={`фабрика · ${l.id}`}>
              <CarCard listing={l} href="#" usdKgsRate={DEV_USD_KGS_RATE} now={DEV_NOW} />
            </State>
          ))}
        </div>
      </Section>

      <Section id="gallery" title="Gallery">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <State label="12 фото">
            <Gallery photos={EDGE_LONG.photos} title="Mercedes-Benz GLE-Класс Купе 2021" />
          </State>
          <State label="1 фото">
            <Gallery photos={EDGE_TRANSIT.photos} title="Li Auto L7 2025" />
          </State>
          <State label="нет фото">
            <Gallery photos={[]} title="Kia K5 2020" />
          </State>
        </div>
      </Section>

      <Section id="filters" title="FilterPanel">
        <p className="text-sm text-fg-muted">
          До 1024px — кнопка «Фильтры» и шторка поверх экрана, шире — колонка слева.
        </p>
        <div className="flex flex-col gap-6 lg:flex-row">
          <FilterPanel
            value={filters}
            onChange={setFilters}
            makes={MAKE_OPTIONS}
            cities={CITIES}
            resultCount={1234}
          />
          <div className="grid min-w-0 flex-1 grid-cols-1 content-start gap-4 sm:grid-cols-2">
            {LISTINGS.slice(0, 2).map((l) => (
              <CarCard
                key={l.id}
                listing={l}
                href="#"
                usdKgsRate={DEV_USD_KGS_RATE}
                now={DEV_NOW}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <State label="шторка (статичный предпросмотр, как на телефоне)">
            <FilterSheetFrame
              className="h-80 overflow-hidden rounded-lg border border-line"
              onClose={() => undefined}
              onReset={() => {
                setFilters(EMPTY_FILTERS);
              }}
              resultCount={21}
            >
              <FilterFields
                value={filters}
                onChange={setFilters}
                makes={MAKE_OPTIONS}
                cities={CITIES}
              />
            </FilterSheetFrame>
          </State>
          <State label="ошибка диапазона">
            <div className="h-80 overflow-y-auto rounded-lg border border-line p-4">
              <FilterFields
                value={invalidFilters}
                onChange={setInvalidFilters}
                makes={MAKE_OPTIONS}
                cities={CITIES}
              />
            </div>
          </State>
        </div>
      </Section>

      <Section id="empty" title="EmptyState">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-line">
            <EmptyState
              icon={SearchX}
              title="Ничего не нашли"
              description="Попробуйте убрать часть фильтров или расширить диапазон цены."
              actions={<Button variant="secondary">Сбросить фильтры</Button>}
            />
          </div>
          <div className="rounded-lg border border-line">
            <EmptyState
              icon={WifiOff}
              title="Не удалось загрузить объявления"
              description="Возможно, пропал интернет. Попробуйте ещё раз."
              actions={<Button iconLeading={RefreshCw}>Повторить</Button>}
            />
          </div>
        </div>
      </Section>

      <ListingSections />

      <Section id="skeleton" title="Skeleton">
        <LoadingRegion
          label="Загрузка объявлений"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <CarCardSkeleton />
          <CarCardSkeleton />
          <div className="hidden sm:block">
            <CarCardSkeleton />
          </div>
          <div className="hidden flex-col gap-2 xl:flex">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </LoadingRegion>
      </Section>
    </main>
  );
}
