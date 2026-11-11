/**
 * "Вы смотрели": listing ids in this browser's localStorage, newest first. Per-device convenience
 * only — storage may be blocked or empty, so every access is guarded and the block simply hides.
 */

export const RECENTLY_VIEWED_KEY = "recently-viewed";
export const RECENTLY_VIEWED_MAX = 8;

/** Parses the stored value; anything unexpected → empty list. */
export function parseViewed(raw: string | null): string[] {
  if (raw === null) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    const ids = value.filter((v): v is string => typeof v === "string" && v.length > 0);
    return [...new Set(ids)].slice(0, RECENTLY_VIEWED_MAX);
  } catch {
    return [];
  }
}

/** Ids from an untrusted source (server action input): strings of sane length, at most MAX. */
export function sanitizeViewedIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  return ids
    .filter((v): v is string => typeof v === "string" && v.length > 0 && v.length <= 64)
    .slice(0, RECENTLY_VIEWED_MAX);
}

/** Moves `id` to the front, drops duplicates, keeps the newest MAX. */
export function addViewed(ids: readonly string[], id: string): string[] {
  return [id, ...ids.filter((x) => x !== id)].slice(0, RECENTLY_VIEWED_MAX);
}

export function readViewed(): string[] {
  try {
    return parseViewed(window.localStorage.getItem(RECENTLY_VIEWED_KEY));
  } catch {
    return [];
  }
}

export function recordViewed(id: string): void {
  try {
    const next = addViewed(readViewed(), id);
    window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  } catch {
    // Storage blocked (private mode): nothing to remember, nothing breaks.
  }
}
