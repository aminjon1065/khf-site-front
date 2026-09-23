import { expect, test } from "@playwright/test";

// Адрес материала сменили в CMS. Прежний CMS отвечает 301 на текущий
// (tests/fixtures/cms-server.mjs), сайт отправляет посетителя 308-м на
// канонический адрес (lib/canonical-slug.ts): у материала один URL, а
// ссылки, которыми уже поделились, не ведут на 404.

test("a former news address leads to the current one with a permanent redirect", async ({
  page,
}) => {
  const response = await page.goto("/ru/news/test-news-old-address");

  expect(response?.status()).toBe(200);
  expect(new URL(page.url()).pathname).toBe("/ru/news/test-news");

  const redirect = await response?.request().redirectedFrom()?.response();
  expect(redirect?.status()).toBe(308);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Учебная новость для автоматических проверок",
  );
});

test("the current address is served as is", async ({ page }) => {
  const response = await page.goto("/ru/news/test-news");

  expect(response?.status()).toBe(200);
  expect(response?.request().redirectedFrom()).toBeNull();
});
