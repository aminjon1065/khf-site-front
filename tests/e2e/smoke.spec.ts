import { test, expect } from "@playwright/test";

// Smoke coverage for i18n routing (A-3). Not a full functional suite — just
// enough to catch a broken locale contract or redirect regressing silently.

const LOCALE_HTML_LANG: Record<string, string> = { ru: "ru", tj: "tg", en: "en" };

for (const locale of ["ru", "tj", "en"] as const) {
  test(`/${locale} responds 200 with <html lang="${LOCALE_HTML_LANG[locale]}">`, async ({ page }) => {
    const response = await page.goto(`/${locale}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", LOCALE_HTML_LANG[locale]);
  });
}

test("an unprefixed path redirects to the default locale (ru)", async ({ browser }) => {
  // Force a locale unsupported by the portal so proxy.ts's Accept-Language
  // fallback can't accidentally pick tj/en and make this test host-dependent.
  const context = await browser.newContext({ locale: "fr-FR" });
  const page = await context.newPage();

  await page.goto("/news");
  await expect(page).toHaveURL(/\/ru\/news$/);

  await context.close();
});

test("the language switcher navigates to the same path under the new locale", async ({ page }) => {
  await page.goto("/ru/news");

  // The radio input itself is visually hidden (custom-styled segmented
  // control) — click its label, like a real user would.
  await page.getByText("ТҶ", { exact: true }).click();

  await expect(page).toHaveURL(/\/tj\/news$/);
});

test("search submits to /{locale}/search?q=", async ({ page }) => {
  await page.goto("/ru");

  await page.getByRole("searchbox").fill("землетрясение");
  await page.getByRole("searchbox").press("Enter");

  await expect(page).toHaveURL(/\/ru\/search\?q=/);
});

test("a genuinely unmatched route returns 404", async ({ page }) => {
  // Slug-level 404 (e.g. /ru/news/unknown-slug) is a known gap — P1-5 in
  // PROJECT_PLAN.md, tracked for B-5. This checks the route-level case,
  // which already 404s correctly today.
  const response = await page.goto("/ru/this-route-does-not-exist-e2e");
  expect(response?.status()).toBe(404);
});
