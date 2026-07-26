import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    // B-6: isolated build dir for the "backend-down" Playwright project
    // (playwright.config.ts, NEXT_DIST_DIR) — same generated content as
    // .next/, just a second build.
    ".next-backend-down/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Дизайн-референсы (не исходники приложения).
    "design_handoff_kchs_redesign/**",
  ]),
]);

export default eslintConfig;
