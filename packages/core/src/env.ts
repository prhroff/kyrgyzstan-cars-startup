import { z } from "zod";

export const nodeEnvSchema = z.enum(["development", "test", "production"]).default("development");

export const databaseUrlSchema = z
  .string()
  .regex(/^postgres(?:ql)?:\/\//, "must be a postgres:// or postgresql:// connection string");

/** Variables every runtime needs. Apps extend this with `baseEnvSchema.extend({...})`. */
export const baseEnvSchema = z.object({
  NODE_ENV: nodeEnvSchema,
});

export const dbEnvSchema = baseEnvSchema.extend({
  DATABASE_URL: databaseUrlSchema,
});

export class EnvValidationError extends Error {
  constructor(public readonly issues: readonly string[]) {
    super(`Invalid environment variables:\n${issues.map((i) => `  - ${i}`).join("\n")}`);
    this.name = "EnvValidationError";
  }
}

/**
 * Validates `source` (defaults to process.env) against a zod schema.
 * Throws EnvValidationError listing every problem at once. Never prints values (they may be secrets).
 */
export function parseEnv<T extends z.ZodType>(
  schema: T,
  source: Record<string, string | undefined> = process.env,
): z.infer<T> {
  const result = schema.safeParse(source);
  if (!result.success) {
    throw new EnvValidationError(
      result.error.issues.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`),
    );
  }
  return result.data;
}
