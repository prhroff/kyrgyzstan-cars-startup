/**
 * Catalog view: rows (photo left, default) or tiles. A visitor preference, not a search filter:
 * kept in a cookie (server renders the right view at once), never in the URL or canonical.
 */

export const CATALOG_VIEWS = ["list", "grid"] as const;
export type CatalogView = (typeof CATALOG_VIEWS)[number];

export const CATALOG_VIEW_COOKIE = "catalog_view";
export const DEFAULT_CATALOG_VIEW: CatalogView = "list";

export function isCatalogView(value: unknown): value is CatalogView {
  return typeof value === "string" && (CATALOG_VIEWS as readonly string[]).includes(value);
}

/** Raw cookie value → view; missing or garbage → default. */
export function parseCatalogView(raw: string | undefined): CatalogView {
  return isCatalogView(raw) ? raw : DEFAULT_CATALOG_VIEW;
}
