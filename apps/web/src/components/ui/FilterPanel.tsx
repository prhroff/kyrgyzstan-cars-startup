"use client";

import {
  FUEL_TYPES,
  STEERING_SIDES,
  TRANSMISSIONS,
  type FuelType,
  type SteeringSide,
  type Transmission,
} from "@repo/core";
import { RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from "react-aria-components";
import { cx } from "@/lib/cx";
import {
  countActiveFilters,
  EMPTY_FILTERS,
  isInvalidRange,
  parseIntegerInput,
  type FilterValues,
} from "@/lib/filters";
import { formatNumber, pluralRu } from "@/lib/format";
import { FUEL_LABELS, STEERING_LABELS, TRANSMISSION_LABELS } from "@/lib/labels";
import { Button } from "./Button";
import { Checkbox, CheckboxGroup } from "./Checkbox";
import { Input } from "./Input";
import { Select, type SelectOption } from "./Select";

export interface MakeOption extends SelectOption {
  models: SelectOption[];
}

export interface FilterPanelProps {
  value: FilterValues;
  onChange: (value: FilterValues) => void;
  makes: readonly MakeOption[];
  cities: readonly string[];
  /** Matching listings for the current filters (shown on the mobile "apply" button). */
  resultCount: number;
  className?: string;
}

const ANY = "__any";

function resultLabel(n: number): string {
  return `Показать ${formatNumber(n)} ${pluralRu(n, ["объявление", "объявления", "объявлений"])}`;
}

function numberText(n: number | null): string {
  return n === null ? "" : String(n);
}

/** The fields themselves — shared by the desktop column and the mobile sheet. */
export function FilterFields({
  value,
  onChange,
  makes,
  cities,
}: Omit<FilterPanelProps, "resultCount" | "className">) {
  const set = (patch: Partial<FilterValues>) => {
    onChange({ ...value, ...patch });
  };
  const make = makes.find((m) => m.id === value.make);
  const yearInvalid = isInvalidRange(value.yearFrom, value.yearTo);
  const priceInvalid = isInvalidRange(value.priceFrom, value.priceTo);

  return (
    <div className="flex flex-col gap-5">
      <Select
        label="Марка"
        placeholder="Любая"
        options={[{ id: ANY, label: "Любая" }, ...makes]}
        value={value.make ?? ANY}
        onChange={(key) => {
          const id = key === null || key === ANY ? null : String(key);
          set({ make: id, model: null });
        }}
      />
      <Select
        label="Модель"
        placeholder="Любая"
        isDisabled={!make}
        description={make ? undefined : "Сначала выберите марку"}
        options={[{ id: ANY, label: "Любая" }, ...(make?.models ?? [])]}
        value={value.model ?? ANY}
        onChange={(key) => {
          set({ model: key === null || key === ANY ? null : String(key) });
        }}
      />

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-medium text-fg">Год выпуска</legend>
        <div className="grid grid-cols-2 gap-2">
          <Input
            aria-label="Год выпуска от"
            placeholder="от"
            inputMode="numeric"
            value={numberText(value.yearFrom)}
            onChange={(s) => {
              set({ yearFrom: parseIntegerInput(s) });
            }}
            isInvalid={yearInvalid}
          />
          <Input
            aria-label="Год выпуска до"
            placeholder="до"
            inputMode="numeric"
            value={numberText(value.yearTo)}
            onChange={(s) => {
              set({ yearTo: parseIntegerInput(s) });
            }}
            isInvalid={yearInvalid}
          />
        </div>
        {yearInvalid && (
          <p className="text-sm text-danger">Год «от» должен быть не позже года «до»</p>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-medium text-fg">Цена, $</legend>
        <div className="grid grid-cols-2 gap-2">
          <Input
            aria-label="Цена от, долларов"
            placeholder="от"
            suffix="$"
            inputMode="numeric"
            value={numberText(value.priceFrom)}
            onChange={(s) => {
              set({ priceFrom: parseIntegerInput(s) });
            }}
            isInvalid={priceInvalid}
          />
          <Input
            aria-label="Цена до, долларов"
            placeholder="до"
            suffix="$"
            inputMode="numeric"
            value={numberText(value.priceTo)}
            onChange={(s) => {
              set({ priceTo: parseIntegerInput(s) });
            }}
            isInvalid={priceInvalid}
          />
        </div>
        {priceInvalid && (
          <p className="text-sm text-danger">Цена «от» должна быть не больше цены «до»</p>
        )}
      </fieldset>

      <Select
        label="Город"
        placeholder="Любой"
        options={[{ id: ANY, label: "Любой" }, ...cities.map((c) => ({ id: c, label: c }))]}
        value={value.city ?? ANY}
        onChange={(key) => {
          set({ city: key === null || key === ANY ? null : String(key) });
        }}
      />

      <CheckboxGroup
        label="Топливо"
        value={value.fuel}
        onChange={(v) => {
          set({ fuel: FUEL_TYPES.filter((f) => v.includes(f)) });
        }}
      >
        {FUEL_TYPES.map((f: FuelType) => (
          <Checkbox key={f} value={f}>
            {FUEL_LABELS[f]}
          </Checkbox>
        ))}
      </CheckboxGroup>

      <Select
        label="Руль"
        placeholder="Любой"
        options={[
          { id: ANY, label: "Любой" },
          ...STEERING_SIDES.map((s: SteeringSide) => ({ id: s, label: STEERING_LABELS[s] })),
        ]}
        value={value.steering ?? ANY}
        onChange={(key) => {
          set({ steering: STEERING_SIDES.find((s) => s === key) ?? null });
        }}
      />

      <CheckboxGroup
        label="Коробка передач"
        value={value.transmission}
        onChange={(v) => {
          set({ transmission: TRANSMISSIONS.filter((t) => v.includes(t)) });
        }}
      >
        {TRANSMISSIONS.map((t: Transmission) => (
          <Checkbox key={t} value={t}>
            {TRANSMISSION_LABELS[t]}
          </Checkbox>
        ))}
      </CheckboxGroup>
    </div>
  );
}

/** Sheet layout (header / scrolling body / footer). Rendered inside the modal, and inline on /dev/ui. */
export function FilterSheetFrame({
  onClose,
  onReset,
  resultCount,
  children,
  className,
}: {
  onClose: () => void;
  onReset: () => void;
  resultCount: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex min-h-0 flex-col bg-surface", className)}>
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-line pr-2 pl-4">
        <Heading slot="title" className="text-lg font-semibold text-fg">
          Фильтры
        </Heading>
        <Button
          variant="ghost"
          iconOnly
          iconLeading={X}
          aria-label="Закрыть фильтры"
          onPress={onClose}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
      <div className="flex shrink-0 gap-2 border-t border-line p-4">
        <Button
          variant="secondary"
          iconOnly
          iconLeading={RotateCcw}
          aria-label="Сбросить фильтры"
          onPress={onReset}
        />
        <Button fullWidth onPress={onClose} className="flex-1">
          {resultLabel(resultCount)}
        </Button>
      </div>
    </div>
  );
}

/** Mobile: button opening a bottom sheet. Desktop (lg+): a left column. */
export function FilterPanel({
  value,
  onChange,
  makes,
  cities,
  resultCount,
  className,
}: FilterPanelProps) {
  const active = countActiveFilters(value);
  const reset = () => {
    onChange(EMPTY_FILTERS);
  };
  const fields = <FilterFields value={value} onChange={onChange} makes={makes} cities={cities} />;

  return (
    <div className={className}>
      <div className="lg:hidden">
        <DialogTrigger>
          <Button variant="secondary" iconLeading={SlidersHorizontal}>
            Фильтры
            {active > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs text-fg-on-accent">
                {active}
                <span className="sr-only"> активно</span>
              </span>
            )}
          </Button>
          <ModalOverlay isDismissable className="fixed inset-0 z-50 bg-overlay">
            <Modal className="fixed inset-x-0 top-12 bottom-0 flex flex-col overflow-hidden rounded-t-lg bg-surface outline-none">
              <Dialog aria-label="Фильтры" className="flex min-h-0 flex-1 flex-col outline-none">
                {({ close }) => (
                  <FilterSheetFrame
                    className="flex-1"
                    onClose={close}
                    onReset={reset}
                    resultCount={resultCount}
                  >
                    {fields}
                  </FilterSheetFrame>
                )}
              </Dialog>
            </Modal>
          </ModalOverlay>
        </DialogTrigger>
      </div>

      <aside aria-label="Фильтры" className="hidden w-72 shrink-0 flex-col gap-4 lg:flex">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-fg">Фильтры</h2>
          {active > 0 && (
            <Button variant="ghost" size="sm" onPress={reset}>
              Сбросить
            </Button>
          )}
        </div>
        {fields}
      </aside>
    </div>
  );
}
