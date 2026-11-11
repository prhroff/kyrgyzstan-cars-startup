import type { Currency, FuelType, OriginCountry, SourceType, Transmission } from "@repo/core";
import type { CarCardData, CarPhoto } from "@/lib/listing-card";
import { MARKET_POSITIONS } from "@/lib/market";

/** Dev placeholder rate (same as the seed). Real rate comes from ExchangeRate. */
export const DEV_USD_KGS_RATE = 87.45;

/** A trim fixes fuel and engine together, so fixtures never say "1.6T Hybrid · Дизель". */
interface TrimSpec {
  name: string;
  fuel: FuelType;
  /** cm³; null for EVs. */
  cc: number | null;
}

interface ModelSpec {
  make: string;
  model: string;
  trims: TrimSpec[];
  years: [number, number];
  /** Whole USD range for a mid-year car. */
  priceUsd: [number, number];
  transmission: Transmission[];
  origins: OriginCountry[];
}

const t = (name: string, fuel: FuelType, cc: number | null): TrimSpec => ({ name, fuel, cc });

const MODELS: ModelSpec[] = [
  {
    make: "Toyota",
    model: "Camry",
    trims: [
      t("2.5 Prestige", "petrol", 2487),
      t("3.5 Luxe", "petrol", 3456),
      t("2.5 Hybrid SE", "hybrid", 2487),
    ],
    years: [2015, 2024],
    priceUsd: [15000, 34000],
    transmission: ["automatic"],
    origins: ["usa", "korea", "local"],
  },
  {
    make: "Hyundai",
    model: "Sonata",
    trims: [
      t("2.0 LPi", "lpg", 1999),
      t("2.5 Smartstream", "petrol", 2497),
      t("1.6T", "petrol", 1598),
    ],
    years: [2016, 2024],
    priceUsd: [11000, 26000],
    transmission: ["automatic"],
    origins: ["korea"],
  },
  {
    make: "Kia",
    model: "K5",
    trims: [
      t("2.0 LPi Prestige", "lpg", 1999),
      t("1.6T GT-Line", "petrol", 1598),
      t("2.0 Noblesse", "petrol", 1999),
    ],
    years: [2019, 2024],
    priceUsd: [14000, 27000],
    transmission: ["automatic"],
    origins: ["korea"],
  },
  {
    make: "BYD",
    model: "Song Plus",
    trims: [t("DM-i Flagship", "plug_in_hybrid", 1498), t("EV 605", "electric", null)],
    years: [2021, 2025],
    priceUsd: [21000, 31000],
    transmission: ["automatic"],
    origins: ["china"],
  },
  {
    make: "Li Auto",
    model: "L7",
    trims: [t("Pro", "erev", 1496), t("Max", "erev", 1496), t("Ultra", "erev", 1496)],
    years: [2023, 2025],
    priceUsd: [36000, 49000],
    transmission: ["automatic"],
    origins: ["china"],
  },
  {
    make: "Lexus",
    model: "RX",
    trims: [
      t("350 F Sport", "petrol", 3456),
      t("450h Luxury", "hybrid", 3456),
      t("300", "petrol", 1998),
    ],
    years: [2013, 2023],
    priceUsd: [24000, 62000],
    transmission: ["automatic"],
    origins: ["usa", "japan", "uae"],
  },
  {
    make: "Hyundai",
    model: "Tucson",
    trims: [t("2.0 CRDi", "diesel", 1995), t("1.6T Hybrid", "hybrid", 1598)],
    years: [2016, 2024],
    priceUsd: [14000, 29000],
    transmission: ["automatic"],
    origins: ["korea"],
  },
  {
    make: "Zeekr",
    model: "001",
    trims: [t("You", "electric", null), t("Me", "electric", null)],
    years: [2022, 2025],
    priceUsd: [33000, 45000],
    transmission: ["automatic"],
    origins: ["china"],
  },
  {
    make: "Honda",
    model: "Fit",
    trims: [t("1.3", "petrol", 1317), t("1.5 Hybrid", "hybrid", 1496)],
    years: [2008, 2016],
    priceUsd: [5200, 8900],
    transmission: ["cvt", "automatic"],
    origins: ["japan", "local"],
  },
  {
    make: "Mercedes-Benz",
    model: "E-Класс",
    trims: [
      t("E 200", "petrol", 1991),
      t("E 300 4MATIC", "petrol", 1991),
      t("E 220 d", "diesel", 1950),
    ],
    years: [2010, 2020],
    priceUsd: [13000, 39000],
    transmission: ["automatic"],
    origins: ["europe", "korea"],
  },
  {
    make: "Lada",
    model: "Granta",
    trims: [t("1.6 Classic", "petrol", 1596), t("1.6 Comfort", "petrol", 1596)],
    years: [2014, 2023],
    priceUsd: [4000, 8500],
    transmission: ["manual", "robot"],
    origins: ["local"],
  },
];

export const CITIES = [
  "Бишкек",
  "Ош",
  "Джалал-Абад",
  "Каракол",
  "Токмок",
  "Кара-Балта",
  "Нарын",
  "Талас",
  "Кант",
  "Балыкчы",
];

const SOURCES: { type: SourceType; name: string }[] = [
  { type: "telegram", name: "Telegram · Авторынок (демо)" },
  { type: "telegram", name: "Telegram · Авто из Кореи (демо)" },
  { type: "dealer_feed", name: "Дилер «Демо Моторс»" },
  { type: "site", name: "Сайт объявлений (демо)" },
  { type: "user", name: "Частное лицо" },
];

/** Deterministic PRNG (mulberry32) — same seed, same fixtures. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  const item = items[Math.floor(rng() * items.length)];
  if (item === undefined) throw new Error("pick from empty list");
  return item;
}

function int(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function placeholderPhotos(id: string, count: number, offset: number): CarPhoto[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${id}-p${i}`,
    url: `/placeholders/car-${((offset + i) % 4) + 1}.svg`,
    width: 800,
    height: 600,
  }));
}

/** One plausible KG-market listing. */
export function makeListing(rng: () => number, index: number): CarCardData {
  const spec = pick(rng, MODELS);
  const year = int(rng, spec.years[0], spec.years[1]);
  const age = 2026 - year;
  const midYear = (spec.years[0] + spec.years[1]) / 2;
  const yearFactor = 1 + (year - midYear) * 0.06;
  const base = int(rng, spec.priceUsd[0], spec.priceUsd[1]) * yearFactor;
  const priceUsd = Math.max(1500, Math.round(base / 100) * 100);
  const origin = pick(rng, spec.origins);
  const availability = origin !== "local" && rng() < 0.3 ? "in_transit" : "in_stock";
  const currency: Currency = rng() < 0.25 ? "KGS" : "USD";
  const priceAmount =
    currency === "USD" ? priceUsd : Math.round((priceUsd * DEV_USD_KGS_RATE) / 10000) * 10000;
  const trim = pick(rng, spec.trims);
  const id = `demo-${index}`;

  return {
    id,
    make: spec.make,
    model: spec.model,
    // Trim name is sometimes missing in parsed ads; fuel/engine stay known from the trim.
    trim: rng() < 0.85 ? trim.name : null,
    year,
    priceAmount,
    currency,
    priceUsd,
    negotiable: pick(rng, [true, false, null]),
    mileageKm:
      availability === "in_transit" && rng() < 0.3
        ? null
        : Math.max(0, age * int(rng, 9, 22) * 1000),
    // In transit = not cleared yet; otherwise often unknown for parsed ads.
    customsCleared: availability === "in_transit" ? false : pick(rng, [true, true, null]),
    availability,
    city: rng() < 0.9 ? pick(rng, CITIES) : null,
    vehicle: {
      fuelType: trim.fuel,
      transmission: pick(rng, spec.transmission),
      steering: origin === "japan" && rng() < 0.6 ? "right" : "left",
      originCountry: origin,
      engineVolumeCc: trim.cc,
    },
    photos: placeholderPhotos(id, int(rng, 0, 7), index),
    source: pick(rng, SOURCES),
    market: rng() < 0.75 ? pick(rng, MARKET_POSITIONS) : null,
  };
}

export function makeListings(count: number, seed = 42): CarCardData[] {
  const rng = createRng(seed);
  return Array.from({ length: count }, (_, i) => makeListing(rng, i));
}

/** Hand-made layout stress cases: long names, every optional field empty, extreme numbers. */
export const EDGE_CASE_LISTINGS: CarCardData[] = [
  {
    id: "edge-long",
    make: "Mercedes-Benz",
    model: "GLE-Класс Купе",
    trim: "450 4MATIC AMG Line Premium Plus Night Package с панорамной крышей",
    year: 2021,
    priceAmount: 8_950_000,
    currency: "KGS",
    priceUsd: 102_344,
    negotiable: true,
    mileageKm: 1_250_000,
    customsCleared: true,
    availability: "in_stock",
    city: "Джалал-Абад",
    vehicle: {
      fuelType: "plug_in_hybrid",
      transmission: "automatic",
      steering: "left",
      originCountry: "europe",
      engineVolumeCc: 2999,
    },
    photos: placeholderPhotos("edge-long", 12, 1),
    source: {
      type: "telegram",
      name: "Telegram · Очень длинное название канала с автомобилями из Европы (демо)",
    },
    market: "above",
  },
  {
    id: "edge-empty",
    make: "Kia",
    model: "K5",
    trim: null,
    year: 2020,
    priceAmount: 16_000,
    currency: "USD",
    priceUsd: 16_000,
    negotiable: null,
    mileageKm: null,
    customsCleared: null,
    availability: "in_stock",
    city: null,
    vehicle: {
      fuelType: null,
      transmission: null,
      steering: null,
      originCountry: null,
      engineVolumeCc: null,
    },
    photos: [],
    source: { type: "user", name: "Частное лицо" },
    market: null,
  },
  {
    id: "edge-transit",
    make: "Li Auto",
    model: "L7",
    trim: "Max",
    year: 2025,
    priceAmount: 43_900,
    currency: "USD",
    priceUsd: 43_900,
    negotiable: false,
    mileageKm: 0,
    customsCleared: false,
    availability: "in_transit",
    city: "Бишкек",
    vehicle: {
      fuelType: "erev",
      transmission: "automatic",
      steering: "left",
      originCountry: "china",
      engineVolumeCc: 1496,
    },
    photos: placeholderPhotos("edge-transit", 1, 2),
    source: { type: "dealer_feed", name: "Дилер «Демо Моторс»" },
    market: "below",
  },
];

/** Make → models for the filter panel, derived from the same specs. */
export const MAKE_OPTIONS: {
  id: string;
  label: string;
  models: { id: string; label: string }[];
}[] = Object.values(
  MODELS.reduce<
    Record<string, { id: string; label: string; models: { id: string; label: string }[] }>
  >((acc, m) => {
    const id = m.make.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    acc[id] ??= { id, label: m.make, models: [] };
    acc[id].models.push({ id: `${id}:${m.model.toLowerCase()}`, label: m.model });
    return acc;
  }, {}),
);
