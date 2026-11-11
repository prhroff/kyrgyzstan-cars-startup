"use client";

import { LoaderCircle, type LucideIcon } from "lucide-react";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";
import { cx } from "@/lib/cx";
import { focusRing } from "./styles";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<AriaButtonProps, "className" | "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeading?: LucideIcon;
  iconTrailing?: LucideIcon;
  /** Icon-only button: pass `aria-label`, no children. */
  iconOnly?: boolean;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-fg-on-accent ui-hover:bg-accent-hover ui-pressed:bg-accent-active " +
    "data-disabled:bg-surface-strong data-disabled:text-fg-disabled",
  secondary:
    "border border-line-strong bg-surface text-fg ui-hover:bg-surface-subtle ui-pressed:bg-surface-muted " +
    "data-disabled:border-line data-disabled:bg-surface data-disabled:text-fg-disabled",
  ghost:
    "bg-transparent text-fg ui-hover:bg-surface-muted ui-pressed:bg-surface-strong data-disabled:text-fg-disabled",
  danger:
    "bg-danger text-fg-on-accent ui-hover:bg-danger-hover ui-pressed:bg-danger-hover " +
    "data-disabled:bg-surface-strong data-disabled:text-fg-disabled",
};

const SIZES: Record<ButtonSize, { box: string; icon: string; iconOnly: string }> = {
  sm: { box: "h-9 px-3 text-sm gap-1.5", icon: "size-4", iconOnly: "size-9" },
  md: { box: "h-11 px-4 text-base gap-2", icon: "size-5", iconOnly: "size-11" },
  lg: { box: "h-12 px-5 text-base gap-2", icon: "size-5", iconOnly: "size-12" },
};

/** Classes shared by Button and LinkButton, so a link styled as a button looks identical. */
export function buttonStyles({
  variant = "primary",
  size = "md",
  iconOnly = false,
  fullWidth = false,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  fullWidth?: boolean;
}): string {
  const s = SIZES[size];
  return cx(
    "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md font-medium whitespace-nowrap transition-colors select-none",
    "data-disabled:cursor-not-allowed data-pending:cursor-wait",
    focusRing,
    VARIANTS[variant],
    iconOnly ? s.iconOnly : s.box,
    fullWidth && "w-full",
  );
}

export function buttonIconSize(size: ButtonSize): string {
  return SIZES[size].icon;
}

export function Button({
  variant = "primary",
  size = "md",
  iconLeading: Leading,
  iconTrailing: Trailing,
  iconOnly = false,
  fullWidth = false,
  isPending,
  className,
  children,
  ...props
}: ButtonProps) {
  const s = SIZES[size];
  return (
    <AriaButton
      {...props}
      {...(isPending === undefined ? {} : { isPending })}
      className={cx(buttonStyles({ variant, size, iconOnly, fullWidth }), className)}
    >
      {isPending ? (
        <LoaderCircle aria-hidden className={cx(s.icon, "animate-spin")} />
      ) : (
        Leading && <Leading aria-hidden className={s.icon} />
      )}
      {!iconOnly && children}
      {!iconOnly && Trailing && <Trailing aria-hidden className={s.icon} />}
    </AriaButton>
  );
}
