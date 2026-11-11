"use client";

import {
  BODY_TYPES,
  ORIGIN_COUNTRIES,
  STEERING_SIDES,
  TRANSMISSIONS,
  type FuelType,
  type SteeringSide,
  type Transmission,
} from "@repo/core";
import { ChevronDown, ChevronUp, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import {
  Button as AriaButton,
  Dialog,
  DialogTrigger,
  Disclosure,
  DisclosurePanel,
  Heading,
  Modal,
  ModalOverlay,
  ToggleButton,
  ToggleButtonGroup,
} from "react-aria-components";
import { cx } from "@/lib/cx";
import {
  countActiveFilters,
  EMPTY_FILTERS,
  FUEL_GROUPS,
  fuelGroupState,
  HYBRID_SUBTYPE_LABELS,
  toggleFuelGroup,
  toggleFuelType,
  isInvalidRange,
  parseIntegerInput,
  type FilterValues,
} from "@/lib/filters";
import { formatNumber, pluralRu } from "@/lib/format";
import { ORIGIN_FILTER_LABELS } from "@/lib/filter-chips";
import { BODY_LABELS, STEERING_LABELS, TRANSMISSION_LABELS } from "@/lib/labels";
import { Button } from "./Button";
import { Checkbox, CheckboxGroup } from "./Checkbox";
import { Input } from "./Input";
import { Select, type SelectOption } from "./Select";
import { focusRing } from "./styles";

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
  /** Open the make picker on arrival ("Все марки" on the home page). */
  autoOpenMake?: boolean;
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
  autoOpenMake = false,
}: Omit<FilterPanelProps, "resultCount" | "className">) {
  const set = (patch: Partial<FilterValues>) => {
    onChange({ ...value, ...patch });
  };
  const make = makes.find((m) => m.id === value.make);
  const yearInvalid = isInvalidRange(value.yearFrom, value.yearTo);
  const priceInvalid = isInvalidRange(value.priceFrom, value.priceTo);

  return (
    <div className="flex flex-col gap-5">
      <Input
        label="Поиск по названию"
        placeholder="Например, Camry Hybrid"
        value={value.q ?? ""}
        onChange={(s) => {
          set({ q: s.trim() === "" ? null : s });
        }}
      />
      <Select
        label="Марка"
        defaultOpen={autoOpenMake}
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

      <PillGroup
        label="Кузов"
        options={BODY_TYPES.map((b) => ({ id: b, label: BODY_LABELS[b] }))}
        value={value.body}
        onChange={(ids) => {
          set({ body: BODY_TYPES.filter((b) => ids.includes(b)) });
        }}
      />

      <Select
        label="Город"
        placeholder="Любой"
        options={[{ id: ANY, label: "Любой" }, ...cities.map((c) => ({ id: c, label: c }))]}
        value={value.city ?? ANY}
        onChange={(key) => {
          set({ city: key === null || key === ANY ? null : String(key) });
        }}
      />

      <FuelFilter
        value={value.fuel}
        onChange={(fuel) => {
          set({ fuel });
        }}
      />

      <Disclosure
        defaultExpanded={
          value.steering !== null ||
          value.transmission.length > 0 ||
          value.origin.length > 0 ||
          value.inTransit ||
          value.belowMarket
        }
        className="group/more flex flex-col gap-4 border-t border-line pt-4"
      >
        <Heading className="flex">
          <AriaButton
            slot="trigger"
            className={cx(
              "flex h-11 w-full cursor-pointer items-center justify-between rounded-md text-base font-medium text-fg ui-hover:text-accent",
              focusRing,
            )}
          >
            Ещё фильтры
            <ChevronDown
              aria-hidden
              className="size-5 transition-transform group-data-expanded/more:rotate-180"
            />
          </AriaButton>
        </Heading>
        <DisclosurePanel className="flex flex-col gap-5">
          <PillGroup
            label="Откуда машина"
            options={ORIGIN_COUNTRIES.map((o) => ({ id: o, label: ORIGIN_FILTER_LABELS[o] }))}
            value={value.origin}
            onChange={(ids) => {
              set({ origin: ORIGIN_COUNTRIES.filter((o) => ids.includes(o)) });
            }}
          />
          <fieldset className="flex flex-col">
            <legend className="mb-1 text-sm font-medium text-fg">Наличие и цена</legend>
            <Checkbox
              isSelected={value.inTransit}
              onChange={(inTransit) => {
                set({ inTransit });
              }}
            >
              В пути
            </Checkbox>
            <Checkbox
              isSelected={value.belowMarket}
              onChange={(belowMarket) => {
                set({ belowMarket });
              }}
            >
              Ниже рынка
            </Checkbox>
          </fieldset>
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
        </DisclosurePanel>
      </Disclosure>
    </div>
  );
}

/** Multi-select pills (body type, origin). Selected = accent, per docs/design/direction.md. */
function PillGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { id: string; label: string }[];
  value: readonly string[];
  onChange: (ids: string[]) => void;
}) {
  const labelId = useId();
  return (
    <div className="flex flex-col gap-2">
      <span id={labelId} className="text-sm font-medium text-fg">
        {label}
      </span>
      <ToggleButtonGroup
        aria-labelledby={labelId}
        selectionMode="multiple"
        selectedKeys={new Set(value)}
        onSelectionChange={(keys) => {
          onChange([...keys].map(String));
        }}
        className="flex flex-wrap gap-2"
      >
        {options.map((o) => (
          <ToggleButton
            key={o.id}
            id={o.id}
            className={cx(
              "inline-flex h-11 cursor-pointer items-center rounded-full bg-surface-muted px-4 text-sm text-fg transition-colors ui-hover:bg-surface-strong",
              "data-selected:bg-accent data-selected:text-fg-on-accent",
              focusRing,
            )}
          >
            {o.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </div>
  );
}

/** Five groups; "Гибрид" opens into subtypes (plain names). Group checkbox is mixed when partial. */
function FuelFilter({
  value,
  onChange,
}: {
  value: FuelType[];
  onChange: (fuel: FuelType[]) => void;
}) {
  const subtypesId = useId();
  const hybrid = FUEL_GROUPS.find((g) => g.id === "hybrid");
  const [hybridOpen, setHybridOpen] = useState(
    hybrid !== undefined && fuelGroupState(value, hybrid) === "some",
  );
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="mb-1 text-sm font-medium text-fg">Топливо</legend>
      {FUEL_GROUPS.map((group) => {
        const state = fuelGroupState(value, group);
        const checkbox = (
          <Checkbox
            isSelected={state === "all"}
            isIndeterminate={state === "some"}
            onChange={() => {
              onChange(toggleFuelGroup(value, group));
            }}
          >
            {group.label}
          </Checkbox>
        );
        if (group.id !== "hybrid") return <div key={group.id}>{checkbox}</div>;
        return (
          <div key={group.id} className="flex flex-col">
            <div className="flex items-center justify-between gap-2">
              {checkbox}
              <Button
                variant="ghost"
                size="md"
                iconTrailing={hybridOpen ? ChevronUp : ChevronDown}
                aria-expanded={hybridOpen}
                aria-controls={subtypesId}
                onPress={() => {
                  setHybridOpen((o) => !o);
                }}
              >
                Тип гибрида
              </Button>
            </div>
            {hybridOpen && (
              <div
                id={subtypesId}
                role="group"
                aria-label="Тип гибрида"
                className="flex flex-col border-l border-line pl-4"
              >
                {group.types.map((t) => (
                  <Checkbox
                    key={t}
                    isSelected={value.includes(t)}
                    onChange={() => {
                      onChange(toggleFuelType(value, t));
                    }}
                  >
                    {HYBRID_SUBTYPE_LABELS[t]}
                  </Checkbox>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </fieldset>
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
  autoOpenMake = false,
  className,
}: FilterPanelProps) {
  const active = countActiveFilters(value);
  const reset = () => {
    onChange(EMPTY_FILTERS);
  };
  // Which layout is visible decides where the make picker opens; known only after mount.
  const [openOn, setOpenOn] = useState<"desktop" | "mobile" | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  useEffect(() => {
    if (!autoOpenMake) return;
    // After the first frame: the layout (and so the visible picker) is known only in the browser.
    const frame = requestAnimationFrame(() => {
      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      setOpenOn(desktop ? "desktop" : "mobile");
      if (!desktop) setSheetOpen(true);
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [autoOpenMake]);
  const fields = (open: boolean) => (
    <FilterFields
      key={open ? "open" : "closed"}
      value={value}
      onChange={onChange}
      makes={makes}
      cities={cities}
      autoOpenMake={open}
    />
  );

  return (
    <div className={className}>
      <div className="lg:hidden">
        <DialogTrigger
          isOpen={sheetOpen}
          onOpenChange={(open) => {
            setSheetOpen(open);
            // Auto-open the make picker only on the first opening (arrival from "Все марки").
            if (!open) setOpenOn(null);
          }}
        >
          <Button variant="secondary" iconLeading={SlidersHorizontal}>
            Фильтры
            {active > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-fg-on-accent">
                {active}
                <span className="sr-only"> активно</span>
              </span>
            )}
          </Button>
          <ModalOverlay isDismissable className="fixed inset-0 z-50 bg-overlay">
            <Modal className="fixed inset-x-0 top-12 bottom-0 flex flex-col overflow-hidden rounded-t-xl bg-surface shadow-overlay outline-none">
              <Dialog aria-label="Фильтры" className="flex min-h-0 flex-1 flex-col outline-none">
                {({ close }) => (
                  <FilterSheetFrame
                    className="flex-1"
                    onClose={close}
                    onReset={reset}
                    resultCount={resultCount}
                  >
                    {fields(openOn === "mobile")}
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
        {fields(openOn === "desktop")}
      </aside>
    </div>
  );
}
