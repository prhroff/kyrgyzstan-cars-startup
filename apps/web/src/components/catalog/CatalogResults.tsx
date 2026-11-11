"use client";

import { createContext, useContext } from "react";
import { ListingGrid, type ListingGridProps } from "@/components/listing/ListingGrid";
import { DEFAULT_CATALOG_VIEW, type CatalogView } from "@/lib/catalog-view";

/** Set by CatalogControls (owner of the toggle), read by the result list below it. */
export const CatalogViewContext = createContext<CatalogView>(DEFAULT_CATALOG_VIEW);

/** Catalog results in the chosen view: rows, or 3-column tiles next to the filters. */
export function CatalogResults(props: Omit<ListingGridProps, "columns">) {
  const view = useContext(CatalogViewContext);
  return <ListingGrid {...props} columns={view === "list" ? "list" : "narrow"} />;
}
