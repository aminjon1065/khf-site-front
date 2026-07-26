import { test, expect } from "@playwright/test";

// B-5. Two distinct not-found paths in this app, with different guarantees:
//
// 1. notFound() called from WITHIN a matched dynamic route (e.g. an unknown
//    news/project/announcement slug) renders app/[locale]/not-found.tsx per
//    request, so the locale is correct even in the raw (pre-hydration) HTML.
//    The HTTP status is 200, not 404 — a documented Next.js limitation: the
//    response headers commit before an async notFound() resolves once the
//    route streams (it does here, via app/[locale]/loading.tsx). SEO is
//    still protected: Next always injects <meta name="robots" content="
//    noindex">, which is asserted below.
//
// 2. A genuinely unmatched path (no route at all, e.g. /tj/nonexistent)
//    renders app/global-not-found.tsx. That boundary IS optimized as a
//    build-time static shell, so the very first byte of HTML defaults to
//    the canonical locale (ru) regardless of the requested path — but it
//    correctly self-corrects to the right locale via usePathname() once
//    React hydrates, which is what a real browser user actually sees.

test.describe("genuinely unmatched route (global-not-found)", () => {
  for (const [locale, lang, snippet] of [
    ["tj", "tg", "Саҳифа ёфт нашуд"],
    ["en", "en", "Page not found"],
    ["ru", "ru", "Страница не найдена"],
  ] as const) {
    test(`/${locale}/nonexistent is a 404, noindex, and hydrates to the ${locale} locale`, async ({ page }) => {
      const response = await page.goto(`/${locale}/nonexistent`);
      expect(response?.status()).toBe(404);

      const robots = await page.locator('meta[name="robots"]').first().getAttribute("content");
      expect(robots).toContain("noindex");

      // Post-hydration: usePathname() has resolved to the real client-side URL.
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.getByText(snippet)).toBeVisible();
    });
  }
});

test.describe("unknown slug on a matched dynamic route", () => {
  for (const path of [
    "/ru/projects/this-does-not-exist-xyz",
    "/ru/announcements/this-does-not-exist-xyz",
    "/tj/news/this-does-not-exist-xyz",
  ]) {
    test(`${path} does not 500 and shows the not-found UI`, async ({ page }) => {
      const response = await page.goto(path);
      // Documented Next.js limitation (see file header): streamed responses
      // can't update their status after notFound() resolves, so this is 200
      // rather than 404. The regression this guards against is a 500.
      expect(response?.status()).toBeLessThan(500);

      const robots = await page.locator('meta[name="robots"]').first().getAttribute("content");
      expect(robots).toContain("noindex");
    });
  }

  test("the locale is correct even in the raw (pre-hydration) response for a matched route", async ({ request }) => {
    const response = await request.get("/tj/news/this-does-not-exist-xyz");
    const body = await response.text();
    expect(body).toContain('<html lang="tg"');
  });
});
