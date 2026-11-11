import type {
  Availability,
  BodyType,
  FuelType,
  OriginCountry,
  SellerType,
  SteeringSide,
  Transmission,
} from "@repo/core";
import type { MarketPosition } from "./market";

export const FUEL_LABELS: Record<FuelType, string> = {
  petrol: "Бензин",
  diesel: "Дизель",
  lpg: "Газ",
  petrol_lpg: "Бензин/газ",
  hybrid: "Гибрид",
  plug_in_hybrid: "Подключаемый гибрид",
  erev: "Последовательный гибрид",
  electric: "Электро",
};

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  manual: "Механика",
  automatic: "Автомат",
  robot: "Робот",
  cvt: "Вариатор",
};

export const STEERING_LABELS: Record<SteeringSide, string> = {
  left: "Левый",
  right: "Правый",
};

export const BODY_LABELS: Record<BodyType, string> = {
  sedan: "Седан",
  hatchback: "Хэтчбек",
  liftback: "Лифтбек",
  wagon: "Универсал",
  suv: "Внедорожник",
  crossover: "Кроссовер",
  coupe: "Купе",
  convertible: "Кабриолет",
  minivan: "Минивэн",
  pickup: "Пикап",
  van: "Фургон",
};

/** "из Кореи" — used as "Авто из …". */
export const ORIGIN_LABELS: Record<OriginCountry, string> = {
  korea: "из Кореи",
  china: "из Китая",
  usa: "из США",
  japan: "из Японии",
  uae: "из ОАЭ",
  europe: "из Европы",
  local: "местная",
  other: "другая страна",
};

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  in_stock: "В наличии",
  in_transit: "В пути",
  on_order: "Под заказ",
};

export const SELLER_TYPE_LABELS: Record<SellerType, string> = {
  private: "Частное лицо",
  dealer: "Дилер",
  importer: "Импортёр",
};

export const MARKET_LABELS: Record<MarketPosition, string> = {
  below: "Ниже рынка",
  fair: "В рынке",
  above: "Дорого",
};
