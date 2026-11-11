/**
 * City picker in the header: Бишкек, Ош or all of Kyrgyzstan. The URL (`?city=`) wins — a shared
 * link "Авто в Оше" opens as sent; the cookie only remembers the visitor's default.
 */

export const CITY_COOKIE = "city";

/** Cookie / picker value for "весь Кыргызстан" (no city filter). */
export const ALL_CITIES = "all";

export interface CityOption {
  /** Cookie and picker value: the city name as used in Listing.city, or ALL_CITIES. */
  id: string;
  label: string;
  /** Whole heading, so it can be translated as one string. */
  heading: string;
}

export const CITY_OPTIONS: readonly CityOption[] = [
  { id: "Бишкек", label: "Бишкек", heading: "Авто в Бишкеке" },
  { id: "Ош", label: "Ош", heading: "Авто в Оше" },
  { id: ALL_CITIES, label: "Весь Кыргызстан", heading: "Авто в Кыргызстане" },
];

/** The site is promoted in Bishkek first (docs/mvp.md). */
export const DEFAULT_CITY = "Бишкек";

export interface ResolvedCity {
  /** City for the listing filter; null = whole country. */
  city: string | null;
  heading: string;
  /** Picker value. */
  optionId: string;
}

function fromOption(o: CityOption): ResolvedCity {
  return { city: o.id === ALL_CITIES ? null : o.id, heading: o.heading, optionId: o.id };
}

/**
 * URL first, then cookie, then the default. Any city from the URL is honoured (the catalog filters by
 * every city); a city outside the picker gets a neutral heading.
 */
export function resolveCity(urlCity: string | null, cookieCity: string | null): ResolvedCity {
  if (urlCity !== null && urlCity.trim() !== "") {
    const name = urlCity.trim();
    const known = CITY_OPTIONS.find((o) => o.id === name);
    if (known) return fromOption(known);
    return { city: name, heading: `Авто: ${name}`, optionId: name };
  }
  const saved = CITY_OPTIONS.find((o) => o.id === cookieCity);
  const fallback = CITY_OPTIONS.find((o) => o.id === DEFAULT_CITY);
  const option = saved ?? fallback;
  if (!option) throw new Error("default city missing from CITY_OPTIONS");
  return fromOption(option);
}
