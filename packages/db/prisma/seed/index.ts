/**
 * Idempotent seed: safe to run repeatedly (upserts by natural keys).
 * Run via `pnpm db:seed` (prisma db seed → tsx).
 */
import { dbEnvSchema, parseEnv } from "@repo/core";
import { createPrismaClient } from "../../src/client.js";
import { USER_SOURCE_SLUG } from "../../src/constants.js";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import { CATALOG } from "./catalog.js";
import { REGIONS } from "./regions.js";
import { slugify } from "./slugify.js";

/**
 * Bootstrap USD→KGS rate so KGS listings can be priced in USD on a fresh DB.
 * Real rates must be loaded by a job (NBKR) — this is NOT live data.
 */
const BOOTSTRAP_USD_KGS_RATE = 87.45;

async function seedRegions(db: PrismaClient): Promise<number> {
  let cities = 0;
  for (const [i, r] of REGIONS.entries()) {
    const region = await db.region.upsert({
      where: { slug: r.slug },
      create: { slug: r.slug, nameRu: r.nameRu, nameKy: r.nameKy, type: r.type, sortOrder: i },
      update: { nameRu: r.nameRu, nameKy: r.nameKy, type: r.type, sortOrder: i },
    });
    for (const [j, c] of r.cities.entries()) {
      const data = {
        regionId: region.id,
        nameRu: c.nameRu,
        nameKy: c.nameKy,
        isRegionalCenter: c.isRegionalCenter ?? false,
        sortOrder: j,
      };
      await db.city.upsert({
        where: { slug: c.slug },
        create: { slug: c.slug, ...data },
        update: data,
      });
      cities++;
    }
  }
  return cities;
}

async function seedCatalog(db: PrismaClient): Promise<{ models: number; generations: number }> {
  let models = 0;
  let generations = 0;
  for (const [i, m] of CATALOG.entries()) {
    const slug = slugify(m.name);
    const make = await db.make.upsert({
      where: { slug },
      create: { slug, name: m.name, aliases: m.aliases, sortOrder: i },
      update: { name: m.name, aliases: m.aliases, sortOrder: i },
    });
    for (const entry of m.models) {
      const model = typeof entry === "string" ? { name: entry } : entry;
      const modelSlug = slugify(model.name);
      const aliases = model.aliases ?? [];
      const row = await db.model.upsert({
        where: { makeId_slug: { makeId: make.id, slug: modelSlug } },
        create: { makeId: make.id, slug: modelSlug, name: model.name, aliases },
        update: { name: model.name, aliases },
      });
      models++;
      for (const gen of model.generations ?? []) {
        const data = { yearFrom: gen.yearFrom, yearTo: gen.yearTo ?? null };
        await db.generation.upsert({
          where: { modelId_code: { modelId: row.id, code: gen.code } },
          create: { modelId: row.id, code: gen.code, ...data },
          update: data,
        });
        generations++;
      }
    }
  }
  return { models, generations };
}

async function seedSystemData(db: PrismaClient): Promise<void> {
  await db.source.upsert({
    where: { slug: USER_SOURCE_SLUG },
    create: { slug: USER_SOURCE_SLUG, type: "user", name: "Пользователи сайта" },
    update: { type: "user" },
  });

  const anyRate = await db.exchangeRate.findFirst({ where: { base: "USD", quote: "KGS" } });
  if (!anyRate) {
    const today = new Date(new Date().toISOString().slice(0, 10));
    await db.exchangeRate.create({
      data: {
        base: "USD",
        quote: "KGS",
        rate: BOOTSTRAP_USD_KGS_RATE,
        date: today,
        source: "seed-bootstrap",
      },
    });
  }
}

async function main(): Promise<void> {
  const env = parseEnv(dbEnvSchema);
  const db = createPrismaClient(env.DATABASE_URL);
  try {
    const cities = await seedRegions(db);
    const { models, generations } = await seedCatalog(db);
    await seedSystemData(db);
    console.info(
      `Seeded: ${REGIONS.length} regions, ${cities} cities, ${CATALOG.length} makes, ` +
        `${models} models, ${generations} generations, system source, bootstrap rate.`,
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
