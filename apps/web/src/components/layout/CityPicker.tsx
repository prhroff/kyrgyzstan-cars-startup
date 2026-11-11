"use client";

import { Check, ChevronDown, MapPin } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Button,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
  type Key,
} from "react-aria-components";
import { focusRing } from "@/components/ui/styles";
import { ALL_CITIES, CITY_OPTIONS } from "@/lib/city";
import { cx } from "@/lib/cx";
import { saveCityCookie } from "./city-cookie";

/**
 * Бишкек / Ош / весь Кыргызстан. Picking a city saves it as the default (cookie) and applies it to the
 * current page through the URL (`?city=`), so the address bar always tells what is shown.
 */
export function CityPicker({ value, className }: { value: string; className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const options = CITY_OPTIONS.some((o) => o.id === value)
    ? CITY_OPTIONS
    : [...CITY_OPTIONS, { id: value, label: value, heading: value }];

  const onChange = (key: Key | null) => {
    if (key === null) return;
    const id = String(key);
    if (CITY_OPTIONS.some((o) => o.id === id)) saveCityCookie(id);
    const next = new URLSearchParams(params.toString());
    next.delete("page");
    if (id === ALL_CITIES) {
      // Home: "all" must be explicit to override the cookie; catalog: no city = whole country.
      if (pathname === "/") next.set("city", ALL_CITIES);
      else next.delete("city");
    } else {
      next.set("city", id);
    }
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <Select aria-label="Город" value={value} onChange={onChange} className={cx("flex", className)}>
      <Button
        className={cx(
          "inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full px-3 text-base text-fg ui-hover:bg-surface-muted",
          focusRing,
        )}
      >
        <MapPin aria-hidden className="size-4 shrink-0 text-fg-muted" />
        <SelectValue className="whitespace-nowrap" />
        <ChevronDown aria-hidden className="size-4 shrink-0 text-fg-muted" />
      </Button>
      <Popover className="min-w-56 rounded-lg bg-surface p-1 shadow-overlay outline-none">
        <ListBox items={options} className="outline-none">
          {(item) => (
            <ListBoxItem
              id={item.id}
              textValue={item.label}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-sm px-3 text-base text-fg outline-none data-focused:bg-surface-muted data-selected:font-medium"
            >
              {({ isSelected }) => (
                <>
                  <span className="flex-1">{item.label}</span>
                  {isSelected && <Check aria-hidden className="size-4 text-accent" />}
                </>
              )}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </Select>
  );
}
