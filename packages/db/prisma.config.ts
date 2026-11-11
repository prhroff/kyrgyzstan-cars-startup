import path from "node:path";
import { config as loadDotenv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma 7 does not load .env itself. The repo keeps a single .env at the root.
loadDotenv({ path: path.resolve(import.meta.dirname, "../../.env"), quiet: true });

// No .env yet (fresh clone, CI generate): fall back to the local docker-compose database.
// Assigned to process.env so the seed subprocess inherits it. Only local dev credentials —
// any real environment must set DATABASE_URL explicitly.
process.env.DATABASE_URL ??= "postgresql://auto:auto@localhost:5432/auto";
const databaseUrl = process.env.DATABASE_URL;

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
