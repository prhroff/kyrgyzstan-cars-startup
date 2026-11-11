"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  Button,
  FieldError,
  ListBox,
  ListBoxItem,
  Label,
  Popover,
  Select as AriaSelect,
  SelectValue,
  Text,
  type Key,
  type SelectProps as AriaSelectProps,
} from "react-aria-components";
import { cx } from "@/lib/cx";
import { descriptionText, errorText, fieldBox, focusRing, labelText } from "./styles";

export interface SelectOption {
  id: string;
  label: string;
  isDisabled?: boolean;
}

export interface SelectProps extends Omit<
  AriaSelectProps<SelectOption>,
  "className" | "children" | "items"
> {
  label?: string;
  description?: string | undefined;
  errorMessage?: string;
  options: readonly SelectOption[];
  className?: string;
}

export function Select({
  label,
  description,
  errorMessage,
  options,
  placeholder = "Не выбрано",
  className,
  ...props
}: SelectProps) {
  const disabledKeys: Key[] = options.filter((o) => o.isDisabled).map((o) => o.id);
  return (
    <AriaSelect
      {...props}
      placeholder={placeholder}
      disabledKeys={disabledKeys}
      className={cx("group flex min-w-0 flex-col gap-1.5", className)}
    >
      {label && <Label className={labelText}>{label}</Label>}
      <Button
        className={cx(
          fieldBox,
          focusRing,
          "cursor-pointer text-left group-data-invalid:border-danger group-data-open:border-accent",
        )}
      >
        <SelectValue className="min-w-0 flex-1 truncate data-placeholder:text-fg-subtle" />
        <ChevronDown
          aria-hidden
          className="size-5 shrink-0 text-fg-muted transition-transform group-data-open:rotate-180"
        />
      </Button>
      {description && (
        <Text slot="description" className={descriptionText}>
          {description}
        </Text>
      )}
      <FieldError className={errorText}>{errorMessage}</FieldError>
      <Popover
        offset={4}
        className="w-(--trigger-width) overflow-auto rounded-lg bg-surface shadow-overlay outline-none"
      >
        <ListBox items={options} className="max-h-72 p-1 outline-none">
          {(item) => (
            <ListBoxItem
              id={item.id}
              textValue={item.label}
              className={cx(
                "flex min-h-11 cursor-pointer items-center gap-2 rounded-sm px-3 text-base text-fg outline-none",
                "data-focused:bg-surface-muted data-selected:font-medium",
                "data-disabled:cursor-not-allowed data-disabled:text-fg-disabled",
              )}
            >
              {({ isSelected }) => (
                <>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {isSelected && <Check aria-hidden className="size-4 shrink-0 text-accent" />}
                </>
              )}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}
