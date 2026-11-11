"use client";

import { Check, Minus } from "lucide-react";
import {
  CheckboxButton,
  CheckboxField,
  CheckboxGroup as AriaCheckboxGroup,
  FieldError,
  Label,
  Text,
  type CheckboxGroupProps as AriaCheckboxGroupProps,
  type CheckboxFieldProps,
} from "react-aria-components";
import { cx } from "@/lib/cx";
import { descriptionText, errorText } from "./styles";

export interface CheckboxProps extends Omit<CheckboxFieldProps, "className" | "children"> {
  children?: React.ReactNode;
  className?: string;
}

export function Checkbox({ children, className, ...props }: CheckboxProps) {
  return (
    <CheckboxField {...props} className={cx("flex", className)}>
      <CheckboxButton
        className={cx(
          "group flex min-h-11 cursor-pointer items-center gap-3 text-base text-fg outline-none",
          "data-disabled:cursor-not-allowed data-disabled:text-fg-disabled",
        )}
      >
        {({ isSelected, isIndeterminate, isDisabled }) => (
          <>
            <span
              aria-hidden
              className={cx(
                "flex size-5 shrink-0 items-center justify-center rounded-xs border transition-colors",
                !isDisabled &&
                  !isSelected &&
                  !isIndeterminate &&
                  "border-line-strong bg-surface group-ui-hover:border-fg-subtle",
                !isDisabled && "text-fg-on-accent",
                "group-ui-focus:outline-2 group-ui-focus:outline-offset-2 group-ui-focus:outline-focus",
                // Computed in JS: variant order in CSS is not guaranteed, disabled must win.
                isDisabled
                  ? "border-line bg-surface-muted text-fg-disabled"
                  : isSelected || isIndeterminate
                    ? "border-accent bg-accent"
                    : "group-data-invalid:border-danger",
              )}
            >
              {isIndeterminate ? (
                <Minus className="size-4" strokeWidth={3} />
              ) : (
                isSelected && <Check className="size-4" strokeWidth={3} />
              )}
            </span>
            {children}
          </>
        )}
      </CheckboxButton>
    </CheckboxField>
  );
}

export interface CheckboxGroupProps extends Omit<AriaCheckboxGroupProps, "className" | "children"> {
  label: string;
  description?: string;
  errorMessage?: string;
  children: React.ReactNode;
  className?: string;
}

export function CheckboxGroup({
  label,
  description,
  errorMessage,
  children,
  className,
  ...props
}: CheckboxGroupProps) {
  return (
    <AriaCheckboxGroup {...props} className={cx("flex flex-col gap-1", className)}>
      <Label className="text-sm font-medium text-fg">{label}</Label>
      <div className="flex flex-col">{children}</div>
      {description && (
        <Text slot="description" className={descriptionText}>
          {description}
        </Text>
      )}
      <FieldError className={errorText}>{errorMessage}</FieldError>
    </AriaCheckboxGroup>
  );
}
