"use client";

import { LayoutGrid, List, type LucideIcon } from "lucide-react";
import { ToggleButton, ToggleButtonGroup } from "react-aria-components";
import { cx } from "@/lib/cx";
import { isCatalogView, type CatalogView } from "@/lib/catalog-view";
import { focusRing } from "./styles";

const OPTIONS: { id: CatalogView; label: string; icon: LucideIcon }[] = [
  { id: "list", label: "Списком", icon: List },
  { id: "grid", label: "Плиткой", icon: LayoutGrid },
];

export interface ViewToggleProps {
  value: CatalogView;
  onChange: (view: CatalogView) => void;
  className?: string;
}

/** Rows / tiles switch: icon segments on a muted track, the chosen one in primary. */
export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <ToggleButtonGroup
      aria-label="Вид каталога"
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={new Set([value])}
      onSelectionChange={(keys) => {
        const next = [...keys][0];
        if (isCatalogView(next)) onChange(next);
      }}
      className={cx("inline-flex shrink-0 rounded-full bg-surface-muted", className)}
    >
      {OPTIONS.map(({ id, label, icon: Icon }) => (
        <ToggleButton
          key={id}
          id={id}
          aria-label={label}
          className={cx(
            "inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-fg-muted transition-colors ui-hover:text-fg",
            "data-selected:bg-primary data-selected:text-fg-on-accent",
            focusRing,
          )}
        >
          <Icon aria-hidden className="size-5" />
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
