import { test, expect } from "@playwright/test";

// B-6: what every public route does when the CMS API is unreachable. Runs
// ONLY against the "backend-down" project (see playwright.config.ts) — a
// real Next server started with API_URL pointed at a port nothing listens
// on, so every lib/api.ts fetch genuinely fails end-to-end. This can't be
// done with page.route(): these are Server Component fetches that run on
// the Next server process, never touching the browser's network stack, so
// browser-level request mocking has nothing to intercept.
//
// Acceptance bar (PROJECT_PLAN.md, B-6): no unhandled exception anywhere,
// and no page left with an empty <main> and no explanation.

test.describe("list pages show a human empty state, not a blank page", () => {
  const cases: Array<[url: string, text: string]> = [
    ["/ru/news", "Ничего не найдено"],
    ["/ru/documents", "Документы не найдены"],
    ["/ru/guides", "Инструкции пока не опубликованы."],
    ["/ru/projects", "Проекты пока не опубликованы."],
    ["/ru/announcements", "Объявления не найдены."],
    ["/ru/alerts", "Действующих предупреждений нет"],
    ["/ru/map", "Событий этого типа нет"],
  ];

  for (const [url, text] of cases) {
    test(`${url} shows an explanation instead of nothing`, async ({ page }) => {
      const response = await page.goto(url);
      expect(response?.status()).toBeLessThan(500);
      await expect(page.getByText(text)).toBeVisible();
    });
  }
});

test("home page still renders header/nav/footer when every CMS section is empty", async ({ page }) => {
  const response = await page.goto("/ru");
  expect(response?.status()).toBeLessThan(500);

  await expect(page.locator("main")).not.toBeEmpty();
  // Nav links are the static fallback (PublicHeader falls back to a
  // hardcoded array when fetchMenu() comes back empty) — not CMS content.
  await expect(page.getByRole("navigation").getByRole("link", { name: "Новости" })).toBeVisible();
  await expect(page.getByRole("contentinfo").or(page.locator("footer"))).toBeVisible();
});

test("a detail page shows a friendly message, not a crash, when its fetch fails", async ({ page }) => {
  const response = await page.goto("/ru/news/any-slug-at-all");
  expect(response?.status()).toBeGreaterThanOrEqual(200);

  // FetchErrorFallback, rendered inline by the page itself — NOT
  // app/[locale]/error.tsx. A throw from this page's data fetch was found
  // (during this very audit) to reach the client as a raw, unstyled
  // "Internal Server Error" under `next start`, bypassing the custom error
  // boundary entirely — the fetch failure is caught explicitly instead.
  await expect(page.getByRole("heading", { name: "Что-то пошло не так" })).toBeVisible();
  await expect(
    page.getByText("Произошла ошибка при загрузке страницы. Попробуйте обновить."),
  ).toBeVisible();
});

test("fully static pages are unaffected by a CMS outage", async ({ page }) => {
  const response = await page.goto("/ru/symbols");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: "Государственные символы Республики Таджикистан" }),
  ).toBeVisible();
});
