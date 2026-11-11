import {
  AVAILABILITIES,
  BODY_TYPES,
  FUEL_TYPES,
  ORIGIN_COUNTRIES,
  SELLER_TYPES,
  STEERING_SIDES,
  TRANSMISSIONS,
} from "@repo/core";
import { describe, expect, it } from "vitest";
import {
  AVAILABILITY_LABELS,
  BODY_LABELS,
  FUEL_LABELS,
  MARKET_LABELS,
  ORIGIN_LABELS,
  SELLER_TYPE_LABELS,
  STEERING_LABELS,
  TRANSMISSION_LABELS,
} from "./labels";
import { MARKET_POSITIONS } from "./market";

const cases: [string, readonly string[], Record<string, string>][] = [
  ["fuel", FUEL_TYPES, FUEL_LABELS],
  ["transmission", TRANSMISSIONS, TRANSMISSION_LABELS],
  ["steering", STEERING_SIDES, STEERING_LABELS],
  ["body", BODY_TYPES, BODY_LABELS],
  ["origin", ORIGIN_COUNTRIES, ORIGIN_LABELS],
  ["availability", AVAILABILITIES, AVAILABILITY_LABELS],
  ["seller", SELLER_TYPES, SELLER_TYPE_LABELS],
  ["market", MARKET_POSITIONS, MARKET_LABELS],
];

describe("labels", () => {
  it.each(cases)(
    "%s: every enum value has a non-empty label and nothing extra",
    (_, values, labels) => {
      expect(Object.keys(labels).sort()).toEqual([...values].sort());
      for (const v of values) expect(labels[v]?.trim()).toBeTruthy();
    },
  );
});
