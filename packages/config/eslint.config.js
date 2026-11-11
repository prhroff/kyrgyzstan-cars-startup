// @ts-check
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Shared flat config. Consumers: `export default createConfig(import.meta.dirname)`.
 * @param {string} tsconfigRootDir
 */
export function createConfig(tsconfigRootDir) {
  return tseslint.config(
    {
      ignores: ["dist/**", "coverage/**", "src/generated/**", "**/*.config.js"],
    },
    js.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
      languageOptions: {
        globals: { ...globals.node },
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
      rules: {
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/consistent-type-imports": "error",
        "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        eqeqeq: ["error", "always"],
        "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      },
    },
    prettier,
  );
}

export default createConfig;
