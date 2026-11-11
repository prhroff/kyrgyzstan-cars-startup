// @ts-check
import nextPlugin from "@next/eslint-plugin-next";
import { createConfig } from "@repo/config/eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  { ignores: [".next/**", "next-env.d.ts", ".screenshots/**", "scripts/**", "*.config.*"] },
  ...createConfig(import.meta.dirname),
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { "@next/next": nextPlugin, "react-hooks": reactHooks },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactHooks.configs.recommended.rules,
    },
  },
];
