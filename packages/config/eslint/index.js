import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/.wrangler/**",
      "**/node_modules/**",
      "apps/mobile/**",
      "apps/web/src/routeTree.gen.ts",
      "packages/contracts/openapi/openapi.json",
      "docs/**",
      "content/**",
      "tools/tracker/manifest.json",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,mjs}"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["apps/web/src/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@sadhanayog/db",
              message: "web may not import the database package",
            },
            {
              name: "wrangler",
              message: "web may not import Worker internals",
            },
          ],
          patterns: [
            {
              group: ["**/apps/api/**", "**/packages/db/**"],
              message: "web may not import db or Worker internals",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["packages/contracts/**/*.{ts,js,mjs}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@sadhanayog/db",
              message: "contracts may not depend on db",
            },
          ],
          patterns: [
            {
              group: ["**/apps/**", "**/packages/db/**"],
              message: "contracts may not depend on apps or db",
            },
          ],
        },
      ],
    },
  },
);
