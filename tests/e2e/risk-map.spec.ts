import { test, expect, type Page } from "@playwright/test";

// E-2: TjRiskMap is dynamically imported (next/dynamic) to keep d3-geo +
// topojson-client out of every route's initial JS. Regression guard against
// the dynamic boundary never resolving client-side (it did, silently, with
// `ssr: false` set — the map stayed on its loading placeholder forever with
// no console error) — assert the map actually finishes loading real region
// paths, not just that the page renders without throwing.
async function expectMapToRender(page: Page) {
  const svg = page.locator('svg[role="img"]');
  await expect(svg).toBeVisible();
  await expect
    .poll(() => svg.locator("path").count(), {
      message: "risk map never rendered region paths (stuck loading?)",
    })
    .toBeGreaterThan(0);
}

test("home page risk map renders region paths", async ({ page }) => {
  await page.goto("/ru");
  await expectMapToRender(page);
});

test("map page risk map renders region paths", async ({ page }) => {
  await page.goto("/ru/map");
  await expectMapToRender(page);
});

test("alerts list risk map renders region paths", async ({ page }) => {
  await page.goto("/ru/alerts");
  await expectMapToRender(page);
});

test("alert detail risk map renders region paths", async ({ page }) => {
  await page.goto("/ru/alerts");
  const firstAlertLink = page.locator("main a[href*='/alerts/']").first();
  await firstAlertLink.click();
  await expectMapToRender(page);
});
