"use server";

import { getListingsByIds } from "@/data/listings";
import { sanitizeViewedIds } from "@/lib/recently-viewed";
import type { CarCardData } from "@/lib/listing-card";

/** "Вы смотрели": cards for ids from the visitor's localStorage (untrusted input, so filtered). */
export async function fetchViewedListings(ids: unknown): Promise<CarCardData[]> {
  return getListingsByIds(sanitizeViewedIds(ids));
}
