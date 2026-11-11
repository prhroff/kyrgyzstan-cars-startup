"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FilterPanel, type MakeOption } from "@/components/ui/FilterPanel";
import { SortSelect } from "@/components/ui/SortSelect";
import type { Sort } from "@/data/types";
import { isInvalidRange, type FilterValues } from "@/lib/filters";
import { formatNumber, pluralRu } from "@/lib/format";
import { catalogQueryString, type CatalogQuery } from "@/lib/search-params";

/** Typing in a price field should not navigate on every keystroke. */
const URL_DEBOUNCE_MS = 400;

export interface CatalogControlsProps {
  query: CatalogQuery;
  total: number;
  makes: readonly MakeOption[];
  cities: readonly string[];
  /** The result list (server-rendered). */
  children: React.ReactNode;
}

/**
 * Filters + sort write to the URL (shareable search). Filters keep local state for instant input,
 * the URL catches up after a short pause; any filter change goes back to page 1.
 */
export function CatalogControls({ query, total, makes, cities, children }: CatalogControlsProps) {
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
        className="lg:sticky lg:top-6"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-fg-muted" aria-live="polite">
            {`${formatNumber(total)} ${pluralRu(total, ["объявление", "объявления", "объявлений"])}`}
          </p>
          <SortSelect value={query.sort} onChange={onSortChange} className="w-full sm:w-72" />
        </div>
        {children}
      </div>
    </div>
  );
}
