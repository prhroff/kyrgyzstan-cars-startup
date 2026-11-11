import path from "node:path";
import { config as loadDotenv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma 7 does not load .env itself. The repo keeps a single .env at the root.
loadDotenv({ path: path.resolve(import.meta.dirname, "../../.env"), quiet: true });

// `prisma generate` / `validate` don't connect, so a placeholder keeps them working without a DB (CI).
const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder";

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
