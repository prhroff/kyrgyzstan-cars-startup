"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Form, Input, Label, TextField } from "react-aria-components";
import { Button } from "@/components/ui/Button";
import type { MakeOptionData } from "@/data/search";
import { cx } from "@/lib/cx";
import { EMPTY_FILTERS, type FilterValues } from "@/lib/filters";
import { catalogQueryString } from "@/lib/search-params";
import { resolveSearchText } from "@/lib/search-text";

export interface SearchBarProps {
  makes: readonly MakeOptionData[];
  /** City filter to carry into the catalog; null = whole country. */
  city: string | null;
  /** compact = mobile header (icon button inside the field). */
  compact?: boolean;
  className?: string;
}

/** "Марка или модель" → /cars with make/model filters when the text matches, otherwise free text. */
export function SearchBar({ makes, city, compact = false, className }: SearchBarProps) {
  const router = useRouter();
  const [text, setText] = useState("");

  const submit = () => {
    const r = resolveSearchText(text, makes);
    const filters: FilterValues = {
      ...EMPTY_FILTERS,
      city,
      ...(r.kind === "model" ? { make: r.make, model: r.model } : {}),
      ...(r.kind === "make" ? { make: r.make } : {}),
      ...(r.kind === "text" ? { q: r.q } : {}),
    };
    router.push(`/cars${catalogQueryString({ filters })}`);
  };

  return (
    <Form
      role="search"
      className={cx("flex min-w-0 items-center gap-2", className)}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <TextField
        value={text}
        onChange={setText}
        aria-label="Марка или модель"
        className="relative flex min-w-0 flex-1"
      >
        <Label className="sr-only">Марка или модель</Label>
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-fg-subtle"
        />
        <Input
          placeholder="Марка или модель, например Camry"
          className={cx(
            "w-full min-w-0 rounded-full bg-surface-muted pr-4 pl-12 text-base text-fg outline-none placeholder:text-fg-subtle",
            "data-focused:bg-surface data-focused:outline-2 data-focused:outline-solid data-focused:outline-accent",
            compact ? "h-11" : "h-12",
          )}
        />
      </TextField>
      {!compact && (
        <Button type="submit" size="lg">
          Найти
        </Button>
      )}
    </Form>
  );
}
