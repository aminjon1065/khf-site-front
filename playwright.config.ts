import { defineConfig, devices } from "@playwright/test";

const GRACEFUL_DEGRADATION_SPEC = /graceful-degradation\.spec\.ts/;

export default defineConfig({
  testDir: "./tests/e2e",
  // Serialized on purpose: `next dev` (Turbopack) compiles each route on
  // first request, and many workers hitting different cold routes at once
  // has been observed to race and 500 with "Unexpected end of JSON input"
  // (a truncated chunk read mid-compile), not a real app bug.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      testIgnore: GRACEFUL_DEGRADATION_SPEC,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // B-6: server-side fetches (Server Components) never touch the
      // browser's network stack, so page.route() can't mock them — the only
      // faithful way to exercise "CMS is unreachable" end-to-end is a real
      // server pointed at an address nothing listens on. Isolated to its own
      // project/port so the normal suite keeps using the real local CMS.
      name: "backend-down",
      testMatch: GRACEFUL_DEGRADATION_SPEC,
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3010" },
    },
  ],
  webServer: [
    {
      // CI already ran `npm run build` as its own step; serve that instead of
      // paying for a second (Turbopack dev) compile.
      command: process.env.CI ? "npm run start" : "npm run dev",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      // Always a real build + `next start`, never `next dev`: Turbopack
      // refuses a second concurrent dev server against the same project
      // directory (see the distDir comment in next.config.ts) regardless of
      // port, so dev mode can't run this alongside the main webServer.
      command: "npm run build && npm run start -- -p 3010",
      url: "http://localhost:3010",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        NEXT_DIST_DIR: ".next-backend-down",
        // Port 1 is a reserved/privileged port: nothing can listen on it, so
        // every server-side fetch in lib/api.ts fails fast with ECONNREFUSED
        // instead of waiting out a DNS/routing timeout against a bogus host.
        API_URL: "http://127.0.0.1:1/api/v1",
        NEXT_PUBLIC_API_URL: "http://127.0.0.1:1/api/v1",
      },
    },
  ],
});
