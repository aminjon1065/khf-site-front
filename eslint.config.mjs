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
    // Изолированные dist-каталоги стенда Playwright (playwright.config.ts,
    // NEXT_DIST_DIR): `.next-e2e`, `.next-backend-down-e2e` и любые будущие.
    // Раньше здесь был прибит один конкретный `.next-backend-down`, который
    // разошёлся с реальным именем каталога, и eslint часами линтил
    // минифицированный вывод сборки, выдавая полторы тысячи «ошибок».
    ".next-*/**",
    "out/**",
    "build/**",
    // Артефакты прогона Playwright: HTML-отчёт со сжатым бандлом внутри и
    // трассы упавших тестов. В .gitignore они есть, в ignores eslint — не были.
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
    // Дизайн-референсы (не исходники приложения).
    "design_handoff_kchs_redesign/**",
  ]),
]);

export default eslintConfig;
