import { toE164, type BodyType } from "@repo/core";
import {
  createRng,
  DEV_NOW,
  DEV_USD_KGS_RATE,
  EDGE_CASE_LISTINGS,
  makeListings,
} from "@/dev/fixtures";
import type { CarCardData } from "@/lib/listing-card";
import type { MarketPosition } from "@/lib/market";
import type { ListingDetail, MarketEstimate, PricePoint, SellerProfile } from "./types";

/**
 * Test data for the pages until the database is wired in. Built on the showcase generator, so the
 * same seed gives the same listings in every screenshot. Only `./listings.ts` reads this file.
 */

export const FIXTURE_NOW = DEV_NOW;
export const FIXTURE_USD_KGS_RATE = DEV_USD_KGS_RATE;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const daysAgo = (days: number) => new Date(FIXTURE_NOW.getTime() - days * DAY_MS);

/** VINs that pass validateVin (Korea/Japan/Europe: no mandatory check digit). Demo values. */
const VALID_VINS = [
  "KNAGT41BBK5123456",
  "JTDKB20U793123456",
  "WVWZZZ1KZBW123456",
  "KMHE341CBMA123456",
  "JHMGE88G7BS123456",
];
/** China WMI "L" requires the check digit; this one does not match (tested). */
export const VIN_CHECKSUM_MISMATCH = "LVSHCAMB2CE123456";

const DESCRIPTIONS = [
  "Машина в хорошем состоянии, обслуживалась у официального дилера. Все ТО по регламенту, сервисная книжка на руках. Два комплекта резины.",
  "Один хозяин. Не крашена, есть мелкие сколы на капоте. Масло менял каждые 8 000 км. Причина продажи — покупка машины побольше.",
  "Пригнана в прошлом году, растаможка и оформление сделаны. Кондиционер, камера заднего вида, подогрев сидений.",
  "Состояние нормальное для своего года. Есть вмятина на заднем бампере, на фото видно. Ходовая перебрана весной.",
  null,
];

/** Body type per fixture model — the "segment" for similar listings. */
const MODEL_BODY: Record<string, BodyType> = {
  Camry: "sedan",
  Sonata: "sedan",
  K5: "sedan",
  "E-Класс": "sedan",
  Granta: "sedan",
  "Song Plus": "crossover",
  RX: "crossover",
  Tucson: "crossover",
  "GLE-Класс Купе": "crossover",
  L7: "suv",
  "001": "wagon",
  Fit: "hatchback",
};

const DEALER_MEMBER_SINCE = new Date("2026-03-02T05:00:00Z");
const IMPORTER_MEMBER_SINCE = new Date("2026-05-20T05:00:00Z");

function int(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function phone(index: number): string {
  const e164 = toE164(`0555${String(100000 + index).slice(-6)}`);
  if (e164 === null) throw new Error(`fixture phone ${index} is not a KG number`);
  return e164;
}

const DIFF_RANGE: Record<MarketPosition, [number, number]> = {
  below: [-22, -6],
  fair: [-5, 5],
  above: [6, 18],
};

function estimate(rng: () => number, position: MarketPosition): MarketEstimate {
  const [min, max] = DIFF_RANGE[position];
  return {
    position,
    diffPercent: int(rng, min, max),
    comparedCount: int(rng, 6, 42),
    periodDays: 30,
    computedAt: new Date(FIXTURE_NOW.getTime() - 9 * HOUR_MS),
  };
}

/** Oldest first; each earlier price is 3–8% higher (sellers lower prices, rarely raise them). */
function history(
  rng: () => number,
  card: Pick<CarCardData, "priceAmount" | "currency" | "priceUsd" | "publishedAt">,
  changes: number,
): PricePoint[] {
  if (card.publishedAt === null) return [];
  const published = card.publishedAt.getTime();
  const span = FIXTURE_NOW.getTime() - published;
  const points: PricePoint[] = [];
  let amount = card.priceAmount;
  let usd = card.priceUsd;
  const step = card.currency === "USD" ? 100 : 10_000;
  for (let i = changes; i >= 0; i--) {
    const at = i === 0 ? published : published + (span * i) / (changes + 1);
    points.unshift({
      priceAmount: amount,
      currency: card.currency,
      priceUsd: usd,
      observedAt: new Date(at),
    });
    const factor = 1 + int(rng, 3, 8) / 100;
    amount = Math.round((amount * factor) / step) * step;
    usd = Math.round((usd * factor) / 100) * 100;
  }
  return points;
}

function sellerProfile(
  card: CarCardData,
  rng: () => number,
  counts: Map<string, number>,
): SellerProfile {
  const key = card.seller.name ?? "";
  if (card.seller.type === "dealer") {
    return {
      ...card.seller,
      memberSince: DEALER_MEMBER_SINCE,
      activeListings: counts.get(key) ?? 1,
    };
  }
  if (card.seller.type === "importer") {
    return {
      ...card.seller,
      memberSince: IMPORTER_MEMBER_SINCE,
      activeListings: counts.get(key) ?? 1,
    };
  }
  const published = card.publishedAt ?? FIXTURE_NOW;
  return {
    ...card.seller,
    memberSince: new Date(published.getTime() - int(rng, 0, 200) * DAY_MS),
    activeListings: int(rng, 1, 2),
  };
}

/**
 * The posting form requires mileage, fuel, transmission, city and at least one photo
 * (docs/mvp.md), so listings on the site always have them — the showcase generator does not.
 */
function asPostable(card: CarCardData, index: number): CarCardData {
  const age = Math.max(1, 2026 - card.year);
  return {
    ...card,
    mileageKm: card.mileageKm ?? age * 14_000,
    city: card.city ?? "Бишкек",
    photos: card.photos.length > 0 ? card.photos : photos(card.id, 1, index),
    vehicle: {
      ...card.vehicle,
      fuelType: card.vehicle.fuelType ?? "petrol",
      transmission: card.vehicle.transmission ?? "automatic",
    },
  };
}

function toDetail(
  card: CarCardData,
  index: number,
  rng: () => number,
  counts: Map<string, number>,
): ListingDetail {
  const vinRoll = rng();
  return {
    ...card,
    publishedAt: card.publishedAt ?? FIXTURE_NOW,
    status: "active",
    closedAt: null,
    description: DESCRIPTIONS[index % DESCRIPTIONS.length] ?? null,
    vehicle: {
      ...card.vehicle,
      vin: vinRoll < 0.3 ? null : (VALID_VINS[index % VALID_VINS.length] ?? null),
      bodyType: MODEL_BODY[card.model] ?? null,
      drivetrain: null,
      color: null,
    },
    seller: sellerProfile(card, rng, counts),
    contacts: {
      phone: phone(index),
      telegramUsername: rng() < 0.6 ? `demo_seller_${index}` : null,
      whatsapp: rng() < 0.6,
    },
    marketEstimate: card.market ? estimate(rng, card.market) : null,
    priceHistory: history(rng, card, int(rng, 0, 2)),
  };
}

function sellerCounts(cards: CarCardData[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const c of cards) {
    if (c.seller.type !== "private" && c.seller.name) {
      counts.set(c.seller.name, (counts.get(c.seller.name) ?? 0) + 1);
    }
  }
  return counts;
}

const photos = (id: string, count: number, offset: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${id}-p${i}`,
    url: `/placeholders/car-${((offset + i) % 4) + 1}.svg`,
    width: 800,
    height: 600,
  }));

/** Showcase cases for the listing page and TrustPanel: all good / warnings / almost no data / no VIN. */
const OK: ListingDetail = {
  id: "demo-ok",
  make: "Toyota",
  model: "Camry",
  trim: "2.5 Prestige",
  year: 2021,
  priceAmount: 24_500,
  currency: "USD",
  priceUsd: 24_500,
  negotiable: true,
  mileageKm: 68_000,
  customsCleared: true,
  availability: "in_stock",
  publishedAt: daysAgo(12.3),
  city: "Бишкек",
  photos: photos("demo-ok", 6, 0),
  market: "fair",
  status: "active",
  closedAt: null,
  description:
    "Машина в хорошем состоянии, обслуживалась у официального дилера. Все ТО по регламенту, сервисная книжка на руках.\n\nДва комплекта резины, зимняя на дисках. Возможен обмен на кроссовер с доплатой.",
  vehicle: {
    fuelType: "petrol",
    transmission: "automatic",
    steering: "left",
    originCountry: "usa",
    engineVolumeCc: 2487,
    vin: "JTDKB20U793123456",
    bodyType: "sedan",
    drivetrain: "fwd",
    color: "Белый",
  },
  seller: {
    type: "dealer",
    name: "Демо Моторс",
    memberSince: DEALER_MEMBER_SINCE,
    activeListings: 4,
  },
  contacts: { phone: phone(9001), telegramUsername: "demo_motors", whatsapp: true },
  marketEstimate: {
    position: "fair",
    diffPercent: -3,
    comparedCount: 27,
    periodDays: 30,
    computedAt: new Date(FIXTURE_NOW.getTime() - 9 * HOUR_MS),
  },
  priceHistory: [
    {
      priceAmount: 25_500,
      currency: "USD",
      priceUsd: 25_500,
      observedAt: daysAgo(12.3),
    },
    { priceAmount: 24_900, currency: "USD", priceUsd: 24_900, observedAt: daysAgo(7) },
    { priceAmount: 24_500, currency: "USD", priceUsd: 24_500, observedAt: daysAgo(2) },
  ],
};

const NO_VIN: ListingDetail = {
  ...OK,
  id: "demo-novin",
  make: "Hyundai",
  model: "Sonata",
  trim: "2.0 LPi",
  year: 2020,
  priceAmount: 1_180_000,
  currency: "KGS",
  priceUsd: 13_493,
  negotiable: null,
  mileageKm: 142_000,
  customsCleared: null,
  publishedAt: daysAgo(4.2),
  city: "Ош",
  photos: photos("demo-novin", 3, 2),
  market: "below",
  description: "Газ заводской. Салон чистый. Звоните в любое время.",
  vehicle: {
    fuelType: "lpg",
    transmission: "automatic",
    steering: "left",
    originCountry: "korea",
    engineVolumeCc: 1999,
    vin: null,
    bodyType: "sedan",
    drivetrain: null,
    color: null,
  },
  seller: {
    type: "private",
    name: "Азамат",
    memberSince: daysAgo(4.5),
    activeListings: 1,
  },
  contacts: { phone: phone(9002), telegramUsername: null, whatsapp: true },
  marketEstimate: {
    position: "below",
    diffPercent: -9,
    comparedCount: 14,
    periodDays: 30,
    computedAt: new Date(FIXTURE_NOW.getTime() - 9 * HOUR_MS),
  },
  priceHistory: [
    {
      priceAmount: 1_180_000,
      currency: "KGS",
      priceUsd: 13_493,
      observedAt: daysAgo(4.2),
    },
  ],
};

const WARN: ListingDetail = {
  ...OK,
  id: "demo-warn",
  make: "BYD",
  model: "Song Plus",
  trim: "DM-i Flagship",
  year: 2023,
  priceAmount: 19_900,
  priceUsd: 19_900,
  negotiable: false,
  mileageKm: 21_000,
  customsCleared: false,
  availability: "in_transit",
  publishedAt: daysAgo(26.1),
  city: "Бишкек",
  photos: photos("demo-warn", 4, 1),
  market: "below",
  description: "Машина в пути из Китая, будет в Бишкеке через две недели. Оформление под ключ.",
  vehicle: {
    fuelType: "plug_in_hybrid",
    transmission: "automatic",
    steering: "left",
    originCountry: "china",
    engineVolumeCc: 1498,
    vin: VIN_CHECKSUM_MISMATCH,
    bodyType: "crossover",
    drivetrain: "fwd",
    color: "Серый",
  },
  seller: {
    type: "importer",
    name: "Демо Импорт",
    memberSince: IMPORTER_MEMBER_SINCE,
    activeListings: 7,
  },
  contacts: { phone: phone(9003), telegramUsername: "demo_import", whatsapp: false },
  marketEstimate: {
    position: "below",
    diffPercent: -19,
    comparedCount: 11,
    periodDays: 30,
    computedAt: new Date(FIXTURE_NOW.getTime() - 9 * HOUR_MS),
  },
  priceHistory: [
    { priceAmount: 23_500, currency: "USD", priceUsd: 23_500, observedAt: daysAgo(26.1) },
    { priceAmount: 21_900, currency: "USD", priceUsd: 21_900, observedAt: daysAgo(15) },
    { priceAmount: 19_900, currency: "USD", priceUsd: 19_900, observedAt: daysAgo(3) },
  ],
};

function edge(id: string): CarCardData {
  const l = EDGE_CASE_LISTINGS.find((x) => x.id === id);
  if (!l) throw new Error(`edge fixture ${id} missing`);
  return l;
}
const EDGE_LONG = edge("edge-long");
const EDGE_EMPTY = edge("edge-empty");

/** "Почти нет данных": only what the posting form requires — no VIN, no market estimate. */
const NO_DATA: ListingDetail = {
  ...EDGE_EMPTY,
  id: "demo-nodata",
  status: "active",
  closedAt: null,
  publishedAt: daysAgo(0.4),
  mileageKm: 97_000,
  city: "Токмок",
  photos: photos("demo-nodata", 1, 3),
  description: null,
  vehicle: {
    ...EDGE_EMPTY.vehicle,
    fuelType: "petrol",
    transmission: "automatic",
    vin: null,
    bodyType: null,
    drivetrain: null,
    color: null,
  },
  seller: { ...EDGE_EMPTY.seller, memberSince: daysAgo(0.5), activeListings: 1 },
  contacts: { phone: phone(9004), telegramUsername: null, whatsapp: false },
  marketEstimate: null,
  priceHistory: [
    { priceAmount: 16_000, currency: "USD", priceUsd: 16_000, observedAt: daysAgo(0.4) },
  ],
};

const SOLD: ListingDetail = {
  ...OK,
  id: "demo-sold",
  status: "sold",
  closedAt: daysAgo(1),
  model: "RAV4",
  trim: "2.5 Hybrid",
  make: "Toyota",
  year: 2020,
};

const REMOVED: ListingDetail = {
  ...NO_VIN,
  id: "demo-removed",
  status: "removed",
  closedAt: daysAgo(3),
};

function buildDetails(): ListingDetail[] {
  const rng = createRng(2026);
  const cards = [
    ...makeListings(44, 7).map((c, i) => ({ ...c, id: `car-${i + 1}` })),
    { ...EDGE_LONG, id: "car-long" },
  ];
  const counts = sellerCounts(cards);
  return [
    OK,
    WARN,
    NO_VIN,
    NO_DATA,
    SOLD,
    REMOVED,
    ...cards.map((c, i) => toDetail(asPostable(c, i), i, rng, counts)),
  ];
}

export const FIXTURE_LISTINGS: readonly ListingDetail[] = buildDetails();
