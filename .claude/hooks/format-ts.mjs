// PostToolUse hook: runs Prettier on a .ts/.tsx file right after Claude edits it.
// Uses the project's own Prettier and config; respects .prettierignore (generated code, dist).
// Never blocks: any failure (syntax error mid-edit, missing file) is reported and ignored.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

try {
  const input = JSON.parse(readFileSync(0, "utf8"));
  const file = input.tool_input?.file_path;
  if (typeof file !== "string" || !/\.(ts|tsx|mts|cts)$/i.test(file)) process.exit(0);

  const projectDir = process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? process.cwd();
  const require = createRequire(path.join(projectDir, "package.json"));
  // require.resolve picks Prettier's CJS entry; its API lives on `default` when imported from ESM.
  const mod = await import(pathToFileURL(require.resolve("prettier")).href);
  const prettier = typeof mod.format === "function" ? mod : mod.default;

  const ignorePath = path.join(projectDir, ".prettierignore");
  const info = await prettier.getFileInfo(file, { ignorePath, resolveConfig: true });
  if (info.ignored || info.inferredParser === null) process.exit(0);

  const source = readFileSync(file, "utf8");
  const config = (await prettier.resolveConfig(file)) ?? {};
  const formatted = await prettier.format(source, { ...config, filepath: file });
  if (formatted !== source) writeFileSync(file, formatted);
} catch (error) {
  process.stderr.write(`format-ts: prettier пропущен (${error?.message ?? error})\n`);
}
process.exit(0);
