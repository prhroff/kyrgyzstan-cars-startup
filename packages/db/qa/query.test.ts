import { describe, expect, it } from "vitest";
import { assertReadOnlySql, buildCheckQuery, maskSecrets, summarize } from "./query.js";
import type { Finding } from "./query.js";

describe("assertReadOnlySql", () => {
  it("accepts SELECT and WITH", () => {
    expect(() => {
      assertReadOnlySql("SELECT 1");
    }).not.toThrow();
    expect(() => {
      assertReadOnlySql("-- note\nWITH a AS (SELECT 1) SELECT * FROM a;");
    }).not.toThrow();
  });

  it("ignores keywords inside comments and strings", () => {
    expect(() => {
      assertReadOnlySql("SELECT 'delete me' -- drop\nFROM x");
    }).not.toThrow();
    expect(() => {
      assertReadOnlySql("SELECT $$drop; it$$, E'it\\'s' FROM x");
    }).not.toThrow();
  });

  it("does not treat -- inside a literal as a comment", () => {
    expect(() => {
      assertReadOnlySql("SELECT 'a--b'; DROP TABLE x");
    }).toThrow(/single statement/);
  });

  it("rejects writes, DDL and multiple statements", () => {
    expect(() => {
      assertReadOnlySql('UPDATE "Listing" SET "priceUsd" = 1');
    }).toThrow(/SELECT or WITH/);
    expect(() => {
      assertReadOnlySql("WITH d AS (DELETE FROM x RETURNING *) SELECT 1");
    }).toThrow(/DELETE/i);
    expect(() => {
      assertReadOnlySql("SELECT 1; DROP TABLE x");
    }).toThrow(/single statement/);
    expect(() => {
      assertReadOnlySql("  ");
    }).toThrow(/empty/);
  });
});

describe("buildCheckQuery", () => {
  it("prepends the sample CTE", () => {
    expect(buildCheckQuery("SELECT 1;", "SELECT * FROM sample")).toBe(
      "WITH sample AS (\nSELECT 1\n)\nSELECT * FROM sample",
    );
  });

  it("merges into an existing WITH, keeping leading comments", () => {
    expect(buildCheckQuery("SELECT 1", "-- c\nWITH x AS (SELECT 2) SELECT * FROM x")).toBe(
      "-- c\nWITH sample AS (\nSELECT 1\n), x AS (SELECT 2) SELECT * FROM x",
    );
  });
});

describe("summarize", () => {
  const f = (listing_id: string, problem: string): Finding => ({
    listing_id,
    problem,
    details: "",
  });

  it("counts listings with at least one problem and prefers distinct examples", () => {
    const findings = [f("a", "price"), f("a", "miles"), f("b", "price"), f("c", "price")];
    const summary = summarize(10, findings, 3);
    expect(summary.withProblems).toBe(3);
    expect(summary.percent).toBe(30);
    expect(summary.byProblem).toEqual({ price: 3, miles: 1 });
    expect(summary.examples.map((e) => e.problem)).toEqual(["price", "miles", "price"]);
  });

  it("handles an empty sample", () => {
    expect(summarize(0, []).percent).toBe(0);
  });
});

describe("maskSecrets", () => {
  it("hides credentials in connection strings", () => {
    expect(maskSecrets("failed postgresql://u:p4ss@host/db")).toBe(
      "failed postgresql://***@host/db",
    );
  });
});
