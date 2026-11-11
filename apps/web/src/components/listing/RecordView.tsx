"use client";

import { useEffect } from "react";
import { recordViewed } from "@/lib/recently-viewed";

/** Remembers the opened listing for "Вы смотрели" on the home page. Renders nothing. */
export function RecordView({ id }: { id: string }) {
  useEffect(() => {
    recordViewed(id);
  }, [id]);
  return null;
}
