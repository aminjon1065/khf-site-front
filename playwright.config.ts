import { defineConfig, devices } from "@playwright/test";

const frontendPort = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const backendDownPort = Number(
  process.env.PLAYWRIGHT_BACKEND_DOWN_PORT ?? frontendPort + 1,
);
const cmsPort = Number(process.env.CMS_MOCK_PORT ?? 38848);
const frontendUrl = `http://127.0.0.1:${frontendPort}`;
const backendDownUrl = `http://127.0.0.1:${backendDownPort}`;
const cmsUrl = `http://127.0.0.1:${cmsPort}/api/v1`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [["line"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: frontendUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: [
    {
      command: "node tests/fixtures/cms-server.mjs",
      port: cmsPort,
      // В CI поднимаем свой мок всегда: переиспользование чужого процесса
      // означало бы прогон против неизвестной версии фикстуры.
      reuseExistingServer: !process.env.CI,
      env: {
        CMS_MOCK_HOST: "127.0.0.1",
        CMS_MOCK_PORT: String(cmsPort),
      },
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      // Настоящая сборка и `next start`, а не `next dev`. Стенд на dev-режиме
      // оказался недостоверным: Turbopack компилирует маршрут при первом
      // обращении, и пока идёт компиляция, сервер отдаёт не ту разметку.
      // Сильнее всего страдала экспериментальная граница `global-not-found` —
      // вместо локализованной страницы приходил каркас
      // `<html id="__next_error__">` без lang, из-за чего тесты 404 падали
      // примерно в двух прогонах из девяти. Замер на этой же машине: 36
      // подряд запросов к `next start` — ни одного такого каркаса.
      // Побочно исчезли гонки холодной компиляции, ради которых прогон
      // держали в один воркер, так что `fullyParallel` вернулся.
      command: `npx next build && npx next start --hostname 127.0.0.1 --port ${frontendPort}`,
      url: frontendUrl,
      reuseExistingServer: !process.env.CI,
      // Сборка укладывается примерно в минуту; дефолтных 60 с на весь
      // `build && start` не хватает.
      timeout: 300_000,
      env: {
        API_URL: cmsUrl,
        // Свой distDir, как и у backend-down: Next 16 держит lock-файл на
        // dist-каталог и отказывается работать со вторым сервером на том же
        // `.next`. Без этого прогон падал на машине разработчика, где уже
        // запущен обычный `npm run dev`.
        NEXT_DIST_DIR: ".next-e2e",
        NEXT_PUBLIC_API_URL: cmsUrl,
        NEXT_PUBLIC_RUM_SAMPLE_RATE: "1",
        NEXT_PUBLIC_SITE_URL: frontendUrl,
        RUM_INGEST_SECRET: "playwright-rum-secret",
      },
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      // Тоже настоящая сборка: пустые состояния должны попасть в статически
      // сгенерированные страницы, иначе «CMS недоступна» проверялось бы не на
      // том, что реально уедет в прод. `CMS_BUILD_MODE=preview` снимает
      // fail-fast проверку готовности CMS — здесь она недоступна намеренно.
      command: `npx next build && npx next start --hostname 127.0.0.1 --port ${backendDownPort}`,
      url: backendDownUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      env: {
        API_URL: "http://127.0.0.1:39999/api/v1",
        CMS_BUILD_MODE: "preview",
        NEXT_DIST_DIR: ".next-backend-down-e2e",
        NEXT_PUBLIC_API_URL: "http://127.0.0.1:39999/api/v1",
        NEXT_PUBLIC_RUM_SAMPLE_RATE: "0",
        NEXT_PUBLIC_SITE_URL: backendDownUrl,
      },
      stdout: "pipe",
      stderr: "pipe",
    },
  ],
  projects: [
    {
      name: "chromium",
      testIgnore: "**/graceful-degradation.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "backend-down",
      testMatch: "**/graceful-degradation.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: backendDownUrl,
      },
    },
  ],
  outputDir: "test-results",
});
