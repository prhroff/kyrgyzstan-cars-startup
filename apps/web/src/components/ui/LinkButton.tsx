"use client";

import type { LucideIcon } from "lucide-react";
import { Link, type LinkProps } from "react-aria-components";
import { cx } from "@/lib/cx";
import { buttonIconSize, buttonStyles, type ButtonSize, type ButtonVariant } from "./Button";

export interface LinkButtonProps extends Omit<LinkProps, "className" | "children"> {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeading?: LucideIcon;
  /** Icon-only link: pass `aria-label`, no children. */
  iconOnly?: boolean;
  fullWidth?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/** Navigation that looks like a Button (a link, not a button: it changes the page or opens an app). */
export function LinkButton({
  variant = "primary",
  size = "md",
  iconLeading: Leading,
  iconOnly = false,
  fullWidth = false,
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      {...props}
      className={cx(buttonStyles({ variant, size, iconOnly, fullWidth }), className)}
    >
      {Leading && <Leading aria-hidden className={buttonIconSize(size)} />}
      {!iconOnly && children}
    </Link>
  );
}
