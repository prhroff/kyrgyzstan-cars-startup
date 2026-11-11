"use client";

import {
  FieldError,
  Group,
  Input as AriaInput,
  Label,
  Text,
  TextField,
  type TextFieldProps,
} from "react-aria-components";
import { cx } from "@/lib/cx";
import { descriptionText, errorText, fieldBox, fieldFocus, labelText } from "./styles";

export interface InputProps extends Omit<TextFieldProps, "className" | "children"> {
  label?: string;
  description?: string | undefined;
  /** Shown when `isInvalid` (or native validation fails). */
  errorMessage?: string;
  placeholder?: string;
  /** Unit after the value: "$", "км", "г.". */
  suffix?: string;
  className?: string;
}

export function Input({
  label,
  description,
  errorMessage,
  placeholder,
  suffix,
  className,
  ...props
}: InputProps) {
  return (
    <TextField {...props} className={cx("flex min-w-0 flex-col gap-1.5", className)}>
      {label && <Label className={labelText}>{label}</Label>}
      <Group
        isInvalid={props.isInvalid ?? false}
        isDisabled={props.isDisabled ?? false}
        className={cx(fieldBox, fieldFocus)}
      >
        <AriaInput
          {...(placeholder === undefined ? {} : { placeholder })}
          className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed"
        />
        {suffix && (
          <span aria-hidden className="shrink-0 text-sm text-fg-muted">
            {suffix}
          </span>
        )}
      </Group>
      {description && !props.isInvalid && (
        <Text slot="description" className={descriptionText}>
          {description}
        </Text>
      )}
      <FieldError className={errorText}>{errorMessage}</FieldError>
    </TextField>
  );
}
