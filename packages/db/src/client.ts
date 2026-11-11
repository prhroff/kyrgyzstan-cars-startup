import { PrismaPg } from "@prisma/adapter-pg";
import { dbEnvSchema, parseEnv } from "@repo/core";
import { PrismaClient } from "./generated/prisma/client.js";
import type { Prisma } from "./generated/prisma/client.js";

/** Either the root client or an interactive-transaction client. */
export type Db = PrismaClient | Prisma.TransactionClient;

export function createPrismaClient(databaseUrl: string): PrismaClient {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
}

let instance: PrismaClient | undefined;

/** Process-wide client, configured from validated env (DATABASE_URL). */
export function getPrisma(): PrismaClient {
  instance ??= createPrismaClient(parseEnv(dbEnvSchema).DATABASE_URL);
  return instance;
}

/** Runs `fn` inside a transaction, reusing the caller's transaction if `db` already is one. */
export async function withTransaction<T>(
  db: Db,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  if (db instanceof PrismaClient) return db.$transaction(fn);
  return fn(db);
}
