import { CITY_COOKIE } from "@/lib/city";

/** Remembers the visitor's default city for a year. Client-side only. */
export function saveCityCookie(optionId: string): void {
  try {
    document.cookie = `${CITY_COOKIE}=${encodeURIComponent(optionId)}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    // Cookies blocked: the choice still applies through the URL.
  }
}

/** Server side: decode the raw cookie value; garbage → null (resolveCity falls back to the default). */
export function decodeCityCookie(raw: string | undefined): string | null {
  if (raw === undefined) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}
