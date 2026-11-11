/** Shared class fragments. Keep here so every control has the same focus/disabled look. */

/**
 * Keyboard focus ring (not shown on mouse/touch focus).
 * `outline-solid` is required: in Tailwind v4 `outline-none` sets --tw-outline-style: none, which outline-2 inherits.
 */
export const focusRing =
  "outline-none ui-focus:outline-2 ui-focus:outline-solid ui-focus:outline-offset-2 ui-focus:outline-focus";

/** Text-field-like box: inputs, select triggers. */
export const fieldBox =
  "flex h-11 w-full items-center gap-2 rounded-md border border-line-strong bg-surface px-3 text-base text-fg transition-colors " +
  "ui-hover:border-fg-subtle " +
  "data-invalid:border-danger " +
  "data-disabled:cursor-not-allowed data-disabled:border-line data-disabled:bg-surface-muted data-disabled:text-fg-disabled";

export const labelText = "text-sm font-medium text-fg";
export const descriptionText = "text-sm text-fg-muted";
export const errorText = "text-sm text-danger";

/** Focus look for text fields (any focus, not only keyboard). Invalid fields keep a red ring. */
export const fieldFocus =
  "ui-focus-within:border-accent ui-focus-within:outline-2 ui-focus-within:outline-accent-line " +
  "data-invalid:ui-focus-within:border-danger data-invalid:ui-focus-within:outline-danger-subtle";
