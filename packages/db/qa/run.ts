/**
 * Read-only data-QA runner. Executes the fixed checks in qa/checks/*.sql against a deterministic
 * sample of one source's listings, inside `BEGIN READ ONLY … ROLLBACK`.
 *
 *   pnpm --filter @repo/db qa <source-slug> [--size 50] [--salt qa] [--check price]
 *
 * Without --check prints a summary over all checks; with --check prints that check's rows.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { config as loadDotenv } from "dotenv";
import pg from "pg";
import { z } from "zod";
import { dbEnvSchema, parseEnv } from "@repo/core";
import { assertReadOnlySql, buildCheckQuery, maskSecrets, summarize } from "./query.js";
import type { Finding } from "./query.js";

const qaDir = import.meta.dirname;
const root = path.resolve(qaDir, "../../..");
loadDotenv({ path: [path.join(root, ".env.local"), path.join(root, ".env")], quiet: true });

const findingSchema = z.object({
  listing_id: z.string(),
  problem: z.string(),
  details: z
    .string()
    .nullable()
    .transform((value) => value ?? ""),
});
const countSchema = z.object({ n: z.coerce.number().int() });

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      size: { type: "string", default: "50" },
      salt: { type: "string", default: "qa" },
      check: { type: "string" },
    },
  });
  const slug = positionals[0];
  if (!slug) throw new Error("usage: qa <source-slug> [--size 50] [--salt qa] [--check name]");
  const size = z.coerce.number().int().min(1).max(1000).parse(values.size);

  const sampleSql = await readFile(path.join(qaDir, "sample.sql"), "utf8");
  const checkFiles = (await readdir(path.join(qaDir, "checks")))
    .filter((file) => file.endsWith(".sql"))
    .filter((file) => values.check === undefined || file === `${values.check}.sql`)
    .sort();
  if (checkFiles.length === 0) throw new Error(`no check named "${values.check ?? ""}"`);

  const client = new pg.Client({ connectionString: parseEnv(dbEnvSchema).DATABASE_URL });
  await client.connect();
  try {
    await client.query("BEGIN READ ONLY");
    await client.query("SET LOCAL statement_timeout = '60s'");
    const params = [slug, values.salt, size];

    const totalSql =
      'SELECT count(*) AS n FROM "ListingSource" ls JOIN "Source" s ON s.id = ls."sourceId" WHERE s.slug = $1';
    const total = countSchema.parse((await client.query(totalSql, [slug])).rows[0]).n;
    const sampleCountSql = buildCheckQuery(sampleSql, "SELECT count(*) AS n FROM sample");
    assertReadOnlySql(sampleCountSql);
    const sampleSize = countSchema.parse((await client.query(sampleCountSql, params)).rows[0]).n;

    const findings: Finding[] = [];
    for (const file of checkFiles) {
      const sql = buildCheckQuery(
        sampleSql,
        await readFile(path.join(qaDir, "checks", file), "utf8"),
      );
      assertReadOnlySql(sql);
      const rows: unknown[] = (await client.query(sql, params)).rows;
      findings.push(...rows.map((row) => findingSchema.parse(row)));
    }

    console.info(
      `source=${slug} sample=${String(sampleSize)} of ${String(total)} salt=${values.salt}`,
    );
    if (values.check !== undefined) {
      for (const f of findings.slice(0, 30))
        console.info(`${f.listing_id} | ${f.problem} | ${f.details}`);
      if (findings.length > 30) console.info(`… and ${String(findings.length - 30)} more`);
      return;
    }
    const summary = summarize(sampleSize, findings);
    console.info(`with_problems=${String(summary.withProblems)} (${String(summary.percent)}%)`);
    const counts = checkFiles.map((file) => {
      const name = file.replace(/\.sql$/, "");
      return `${name}=${String(summary.byProblem[name] ?? 0)}`;
    });
    console.info(`by_problem: ${counts.join(" ")}`);
    for (const f of summary.examples) console.info(`${f.listing_id} | ${f.problem} | ${f.details}`);
  } finally {
    await client.query("ROLLBACK").catch(() => undefined);
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error(maskSecrets(error instanceof Error ? error.message : String(error)));
  process.exit(1);
});
