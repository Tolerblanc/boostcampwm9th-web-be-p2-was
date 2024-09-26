import globals from "globals";
import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tslint from "typescript-eslint";

export default tslint.config(
  pluginJs.configs.recommended,
  ...tslint.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2015,
        ...globals.browser,
        ...globals.jest,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  {
    rules: {
      "no-console": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      eqeqeq: ["error", "always"],
    },
  },
  {
    ignores: ["dist/*", "node_modules/*"],
  }
);
