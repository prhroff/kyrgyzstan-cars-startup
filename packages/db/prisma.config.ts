import path from "node:path";
import { config as loadDotenv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma 7 does not load env files itself. Root .env.local (e.g. from `neon env pull`) wins over
// .env; dotenv never overrides variables already set in the real environment (CI).
const root = path.resolve(import.meta.dirname, "../..");
loadDotenv({ path: [path.join(root, ".env.local"), path.join(root, ".env")], quiet: true });

// No env file yet (fresh clone, CI generate): fall back to the local docker-compose database.
// Assigned to process.env so the seed subprocess inherits it. Only local dev credentials —
// any real environment must set DATABASE_URL explicitly.
process.env.DATABASE_URL ??= "postgresql://auto:auto@localhost:5432/auto";

// Prisma CLI (migrate, diff, studio) needs a direct connection: migrations over a pooler
// (Neon "-pooler" host, PgBouncer) fail. The app and seed keep using the pooled DATABASE_URL.
const databaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx --conditions=@repo/source prisma/seed/index.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
