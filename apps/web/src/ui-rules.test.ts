/**
 * Enforces apps/web/CLAUDE.md design bans on every source file.
 * Tailwind defaults are also reset in tokens.css, so banned classes would not render anyway —
 * this test makes the violation loud instead of silently unstyled.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(import.meta.dirname);

/**
 * Arbitrary values are banned for colors, font sizes, spacing, radii and shadows.
 * Layout-only exceptions are listed here explicitly — add one only when there is no token way.
 */
const LAYOUT_ARBITRARY_ALLOWLIST = new Set<string>([
  // Popover matches its trigger width (React Aria sets --trigger-width).
  "w-(--trigger-width)",
]);

/**
 * Files allowed to contain an inline <svg>. Only data charts that icons cannot express.
 * Decision: docs/decisions.md (2026-11-11, price history chart).
 */
const INLINE_SVG_ALLOWLIST = new Set<string>(["components/ui/PriceHistoryChart.tsx"]);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return sourceFiles(p);
    if (!/\.(ts|tsx)$/.test(e.name) || /\.test\.tsx?$/.test(e.name)) return [];
    return [p];
  });
}

const files = sourceFiles(SRC).map((path) => ({
  path: relative(SRC, path).replaceAll("\\", "/"),
  text: readFileSync(path, "utf8"),
}));

/** Each rule: regex over file text → list of offending matches. */
const rules: { name: string; find: (text: string, path: string) => string[] }[] = [
  {
    name: "arbitrary value outside the layout allowlist",
    find: (t) =>
      [...t.matchAll(/(?<![\w-])((?:[\w-]+:)*[a-z][\w-]*-(?:\[[^\]\s"'`]+\]|\(--[\w-]+\)))/g)]
        .map((m) => (m[1] ?? "").replace(/^(?:[\w-]+:)+/, ""))
        .filter((c) => !LAYOUT_ARBITRARY_ALLOWLIST.has(c)),
  },
  {
    name: "arbitrary variant ([&...]: / has-[...]: / data-[...]:)",
    find: (t) => [...t.matchAll(/[\w-]*\[[^\]\s]*\]:/g)].map((m) => m[0]),
  },
  {
    name: "raw color literal (use tokens)",
    find: (t) =>
      [...t.matchAll(/#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab)\(/g)].map((m) => m[0]),
  },
  {
    name: "gradient / blur / glass",
    find: (t) =>
      [
        ...t.matchAll(
          /\b(?:bg-(?:linear|radial|conic|gradient)[\w-]*|(?:backdrop-)?blur[\w-]*|glass\w*|from-[a-z]+-\d+|via-[a-z]+-\d+)\b/g,
        ),
      ].map((m) => m[0]),
  },
  {
    // Scale (tokens.css): xs (checkboxes only) / sm 8 / md 12 / lg 16 / xl 24 / full.
    name: "radius outside the token scale",
    find: (t) =>
      // Bare `rounded` / `shadow` render nothing (defaults are reset in tokens.css) and would
      // false-positive on prose in comments, so they are not matched here.
      [...t.matchAll(/(?<![\w-])rounded(?:-[trblse]{1,2})?-(?:none|[2-9]xl|\d+)\b/g)].map(
        (m) => m[0],
      ),
  },
  {
    name: "rounded-xs outside checkboxes",
    find: (t, path) =>
      path === "components/ui/Checkbox.tsx" || path === "dev/Showcase.tsx"
        ? []
        : [...t.matchAll(/(?<![\w-])rounded-xs\b/g)].map((m) => m[0]),
  },
  {
    // Only floating elements cast shadows: shadow-raised (sticky panels), shadow-overlay (sheets, menus).
    name: "shadow other than shadow-raised / shadow-overlay",
    find: (t) =>
      [
        ...t.matchAll(/(?<![\w-])shadow-(?!raised\b|overlay\b|none\b)[a-z0-9]+\b/g),
        ...t.matchAll(/(?<![\w])drop-shadow[\w-]*/g),
      ].map((m) => m[0]),
  },
  {
    name: "inline style attribute",
    find: (t) => [...t.matchAll(/\bstyle=\{/g)].map((m) => m[0]),
  },
  {
    name: "emoji in UI",
    find: (t) => [...t.matchAll(/\p{Extended_Pictographic}/gu)].map((m) => m[0]),
  },
  {
    name: "icon not from lucide-react",
    find: (t) =>
      [...t.matchAll(/from\s+["']([^"']*icon[^"']*)["']/gi)]
        .map((m) => m[1] ?? "")
        .filter((pkg) => pkg !== "lucide-react"),
  },
  {
    name: "inline <svg> (icons come from Lucide)",
    find: (t, path) =>
      INLINE_SVG_ALLOWLIST.has(path) ? [] : [...t.matchAll(/<svg\b/g)].map((m) => m[0]),
  },
];

describe("UI rules", () => {
  it("scans the source tree", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it.each(rules.map((r) => [r.name, r] as const))("no %s", (_, rule) => {
    const violations = files.flatMap((f) =>
      rule.find(f.text, f.path).map((m) => `${f.path}: ${m}`),
    );
    expect(violations).toEqual([]);
  });

  it("allowlist entries are still used (remove dead ones)", () => {
    const all = files.map((f) => f.text).join("\n");
    for (const entry of LAYOUT_ARBITRARY_ALLOWLIST) expect(all).toContain(entry);
    for (const path of INLINE_SVG_ALLOWLIST) {
      expect(files.find((f) => f.path === path)?.text).toContain("<svg");
    }
  });
});
