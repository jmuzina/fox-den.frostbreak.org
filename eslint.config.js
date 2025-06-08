import * as tseslint from "typescript-eslint";
import jseslint from "@eslint/js";

import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["node_modules/", "dist/", ".astro/", ".vscode/", ".idea/"]),
  ...tseslint.config(
    tseslint.configs.recommended,
    jseslint.configs.recommended,
  ),
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
  },
]);
