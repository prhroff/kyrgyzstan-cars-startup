"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FilterPanel, type MakeOption } from "@/components/ui/FilterPanel";
import { SortSelect } from "@/components/ui/SortSelect";
import type { Sort } from "@/data/types";
import { X } from "lucide-react";
import { Button as AriaButton } from "react-aria-components";
import { Button } from "@/components/ui/Button";
import { focusRing } from "@/components/ui/styles";
import { cx } from "@/lib/cx";
import { filterChips } from "@/lib/filter-chips";
import { EMPTY_FILTERS, isInvalidRange, type FilterValues } from "@/lib/filters";
import { formatNumber, pluralRu } from "@/lib/format";
import { catalogQueryString, type CatalogQuery } from "@/lib/search-params";

/** Typing in a price field should not navigate on every keystroke. */
const URL_DEBOUNCE_MS = 400;

export interface CatalogControlsProps {
  query: CatalogQuery;
  total: number;
  makes: readonly MakeOption[];
  cities: readonly string[];
  /** "Все марки" on the home page links here with the make picker open. */
  autoOpenMake?: boolean;
  /** The result list (server-rendered). */
  children: React.ReactNode;
}

/**
 * Filters + sort write to the URL (shareable search). Filters keep local state for instant input,
 * the URL catches up after a short pause; any filter change goes back to page 1.
 */
export function CatalogControls({
  query,
  total,
  makes,
  cities,
  autoOpenMake = false,
  children,
}: CatalogControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<FilterValues>(query.filters);
  const urlQs = catalogQueryString(query);
  const lastPushed = useRef(urlQs);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Back/forward or a link changed the URL: take filters from it.
  useEffect(() => {
    if (urlQs !== lastPushed.current) {
      lastPushed.current = urlQs;
      setFilters(query.filters);
    }
  }, [urlQs, query.filters]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const navigate = (qs: string) => {
    lastPushed.current = qs;
    router.replace(`${pathname}${qs}`, { scroll: false });
  };

  const onFiltersChange = (next: FilterValues) => {
    setFilters(next);
    if (timer.current) clearTimeout(timer.current);
    // Don't search with a broken range; the field already shows how to fix it.
    if (
      isInvalidRange(next.yearFrom, next.yearTo) ||
      isInvalidRange(next.priceFrom, next.priceTo)
    ) {
      return;
    }
    timer.current = setTimeout(() => {
      navigate(catalogQueryString({ filters: next, sort: query.sort, page: 1 }));
    }, URL_DEBOUNCE_MS);
  };

  /** Chips apply at once (no typing involved). */
  const applyNow = (next: FilterValues) => {
    if (timer.current) clearTimeout(timer.current);
    setFilters(next);
    navigate(catalogQueryString({ filters: next, sort: query.sort, page: 1 }));
  };
  const chips = filterChips(filters, makes);

  const onSortChange = (sort: Sort) => {
    if (timer.current) clearTimeout(timer.current);
    navigate(catalogQueryString({ filters, sort, page: 1 }));
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
      <FilterPanel
        value={filters}
        onChange={onFiltersChange}
        makes={makes}
        cities={cities}
        resultCount={total}
        autoOpenMake={autoOpenMake}
        className="lg:sticky lg:top-6"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="sr-only" aria-live="polite">
            {`Найдено ${formatNumber(total)} ${pluralRu(total, ["объявление", "объявления", "объявлений"])}`}
          </p>
          {chips.length > 0 ? (
            <ul aria-label="Выбранные фильтры" className="flex min-w-0 flex-1 flex-wrap gap-2">
              {chips.map((chip) => (
                <li key={chip.key}>
                  <AriaButton
                    aria-label={`Убрать фильтр: ${chip.label}`}
                    onPress={() => {
                      applyNow(chip.remove(filters));
                    }}
                    className={cx(
                      "inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full lg:h-9 bg-surface-muted pr-2.5 pl-3.5 text-sm text-fg transition-colors ui-hover:bg-surface-strong",
                      focusRing,
                    )}
                  >
                    {chip.label}
                    <X aria-hidden className="size-4 text-fg-muted" />
                  </AriaButton>
                </li>
              ))}
              {chips.length > 1 && (
                <li>
                  <Button
                    variant="ghost"
                    onPress={() => {
                      applyNow(EMPTY_FILTERS);
                    }}
                  >
                    Сбросить все
                  </Button>
                </li>
              )}
            </ul>
          ) : (
            <span className="flex-1" />
          )}
          <SortSelect value={query.sort} onChange={onSortChange} className="w-full sm:w-72" />
        </div>
        {children}
      </div>
    </div>
  );
}
