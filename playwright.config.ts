import { defineConfig, devices } from "@playwright/test";

const frontendPort = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const cmsPort = Number(process.env.CMS_MOCK_PORT ?? 38848);
const frontendUrl = `http://127.0.0.1:${frontendPort}`;
const cmsUrl = `http://127.0.0.1:${cmsPort}/api/v1`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
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
      reuseExistingServer: true,
      env: {
        CMS_MOCK_HOST: "127.0.0.1",
        CMS_MOCK_PORT: String(cmsPort),
      },
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      command: `npx next dev --hostname 127.0.0.1 --port ${frontendPort}`,
      url: frontendUrl,
      reuseExistingServer: !process.env.CI,
      env: {
        API_URL: cmsUrl,
        NEXT_PUBLIC_API_URL: cmsUrl,
        NEXT_PUBLIC_RUM_SAMPLE_RATE: "1",
        NEXT_PUBLIC_SITE_URL: frontendUrl,
        RUM_INGEST_SECRET: "playwright-rum-secret",
      },
      stdout: "pipe",
      stderr: "pipe",
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  outputDir: "test-results",
});
