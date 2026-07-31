import { test, expect } from "@playwright/test";

// B-5. Two distinct not-found paths in this app, with different guarantees:
//
// 1. notFound() called from WITHIN a matched dynamic route (e.g. an unknown
//    news/project/announcement slug) renders app/[locale]/not-found.tsx per
//    request, so the locale is correct even in the raw (pre-hydration) HTML,
//    и статус честный — 404.
//
//    Так было не всегда: пока в сегменте лежал loading.tsx, ответ уходил
//    потоком, заголовки коммитились раньше, чем разрешался асинхронный
//    notFound(), и статус застывал на 200. Скелетон убрали (о загрузке
//    сообщает полоса прогресса) — и статус стал корректным. Если поток
//    когда-нибудь вернётся, этот тест снова начнёт видеть 200.
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
      expect(response?.status()).toBe(404);

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
