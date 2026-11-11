import { describe, expect, it } from "vitest";
import { dbEnvSchema, EnvValidationError, parseEnv } from "./env.js";

describe("parseEnv", () => {
  it("parses valid env and applies defaults", () => {
    expect(parseEnv(dbEnvSchema, { DATABASE_URL: "postgresql://u:p@localhost:5432/db" })).toEqual({
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://u:p@localhost:5432/db",
    });
  });

  it("reports every invalid variable without leaking values", () => {
    const secret = "mysql://root:supersecret@host/db";
    let caught: unknown;
    try {
      parseEnv(dbEnvSchema, { DATABASE_URL: secret, NODE_ENV: "staging" });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(EnvValidationError);
    const e = caught as EnvValidationError;
    expect(e.issues).toHaveLength(2);
    expect(e.message).toContain("DATABASE_URL");
    expect(e.message).toContain("NODE_ENV");
    expect(e.message).not.toContain("supersecret");
  });

  it("fails on a missing DATABASE_URL", () => {
    expect(() => parseEnv(dbEnvSchema, {})).toThrow(EnvValidationError);
  });
});
