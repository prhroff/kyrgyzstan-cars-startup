import { EMPTY_FILTERS } from "./filters";
import { catalogQueryString } from "./search-params";

/** One step of the path. `href: null` = the page itself (rendered as text, aria-current). */
export interface Crumb {
  label: string;
  href: string | null;
}

export interface CrumbPath {
  make?: { id: string; label: string } | null;
  model?: { id: string; label: string } | null;
  /** Kept in links so going up the path does not drop the chosen city. */
  city?: string | null;
}

function catalogHref(p: CrumbPath, depth: "all" | "make" | "model"): string {
  const make = depth === "all" ? null : (p.make?.id ?? null);
  const model = depth === "model" ? (p.model?.id ?? null) : null;
  const qs = catalogQueryString({
    filters: { ...EMPTY_FILTERS, make, model, city: p.city ?? null },
  });
  return `/cars${qs}`;
}

function path(p: CrumbPath): Crumb[] {
  const crumbs: Crumb[] = [
    { label: "Главная", href: "/" },
    { label: "Автомобили", href: catalogHref(p, "all") },
  ];
  if (p.make) {
    crumbs.push({ label: p.make.label, href: catalogHref(p, "make") });
    if (p.model) crumbs.push({ label: p.model.label, href: catalogHref(p, "model") });
  }
  return crumbs;
}

/** Catalog: "Главная › Автомобили › Toyota › Camry", the deepest level is the current page. */
export function catalogCrumbs(p: CrumbPath): Crumb[] {
  const crumbs = path(p);
  const last = crumbs.at(-1);
  if (last) last.href = null;
  return crumbs;
}

/** Listing page: the same path, every step is a link (the listing itself is the H1). */
export function listingCrumbs(p: CrumbPath): Crumb[] {
  return path(p);
}
