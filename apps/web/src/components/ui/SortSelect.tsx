"use client";

import { SORTS, type Sort } from "@/data/types";
import { SORT_LABELS } from "@/lib/search-params";
import { Select } from "./Select";

export interface SortSelectProps {
  value: Sort;
  onChange: (sort: Sort) => void;
  className?: string;
}

export function SortSelect({ value, onChange, className }: SortSelectProps) {
  return (
    <Select
      aria-label="Сортировка"
      options={SORTS.map((s) => ({ id: s, label: SORT_LABELS[s] }))}
      value={value}
      onChange={(key) => {
        const next = SORTS.find((s) => s === key);
        if (next) onChange(next);
      }}
      {...(className === undefined ? {} : { className })}
    />
  );
}
