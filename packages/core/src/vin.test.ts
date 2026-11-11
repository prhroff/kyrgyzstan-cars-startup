import { describe, expect, it } from "vitest";
import { computeVinCheckDigit, isValidVin, validateVin } from "./vin.js";

describe("validateVin", () => {
  it.each([
    "1HGCM82633A004352", // Honda Accord, US
    "1M8GDM9AXKP042788", // check digit X
    "11111111111111111",
  ])("accepts %s with a correct check digit", (vin) => {
    expect(validateVin(vin)).toEqual({ valid: true, vin, checksum: "ok" });
  });

  it("normalizes case, spaces and dashes", () => {
    expect(validateVin(" 1hgcm8263-3a004352 ")).toMatchObject({
      valid: true,
      vin: "1HGCM82633A004352",
    });
  });

  it("rejects a wrong check digit for North American VINs", () => {
    expect(validateVin("1HGCM82634A004352")).toEqual({
      valid: false,
      vin: "1HGCM82634A004352",
      error: "checksum",
    });
  });

  it("rejects a wrong check digit for Chinese VINs (WMI L)", () => {
    const vin = "LRW3E7EA1MC000000";
    const expected = computeVinCheckDigit(vin);
    const broken = vin.slice(0, 8) + (expected === "1" ? "2" : "1") + vin.slice(9);
    expect(validateVin(broken)).toMatchObject({ valid: false, error: "checksum" });
  });

  it("accepts Korean/Japanese/European VINs without a check digit", () => {
    // Korean Hyundai VIN — KM* WMI, position 9 is not a check digit
    const vin = "KMHD141AAJU123456";
    expect(computeVinCheckDigit(vin)).not.toBe(vin.charAt(8));
    expect(validateVin(vin)).toEqual({ valid: true, vin, checksum: "not_applicable" });
  });

  it.each([
    ["1HGCM82633A00435", "length"],
    ["1HGCM82633A0043521", "length"],
    ["", "length"],
    ["1HGCM82633A0O4352", "characters"], // O
    ["1HGCM8263IA004352", "characters"], // I
    ["1HGCM82633Q004352", "characters"], // Q
    ["1HGCM82633A00435!", "characters"],
  ])("rejects %j (%s)", (vin, error) => {
    expect(validateVin(vin)).toMatchObject({ valid: false, error });
  });

  it("rejects a JDM frame number (not a VIN)", () => {
    expect(isValidVin("GX110-6012345")).toBe(false);
  });
});
