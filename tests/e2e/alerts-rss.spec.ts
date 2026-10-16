import { test, expect } from "@playwright/test";

// Канал «RSS» в мастере предупреждения раньше ничего не отправлял: ленты не
// было. Теперь /{locale}/alerts/rss.xml отдаёт предупреждения, которые
// оператор отправил в этот канал, и страница предупреждений на неё ссылается.

test("RSS-лента отдаёт предупреждения из канала RSS", async ({ request }) => {
  const response = await request.get("/ru/alerts/rss.xml");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/rss+xml");
  const xml = await response.text();
  expect(xml).toContain("<title>Тестовое предупреждение</title>");
  expect(xml).toMatch(/<link>https?:\/\/[^<]+\/ru\/alerts\/test-alert<\/link>/);
  expect(xml).toContain("<language>ru</language>");
});

test("лента на таджикском — с таджикским кодом языка", async ({ request }) => {
  const xml = await (await request.get("/tj/alerts/rss.xml")).text();

  expect(xml).toContain("<language>tg</language>");
  expect(xml).toMatch(/\/tj\/alerts\/test-alert<\/link>/);
});

test("несуществующий язык ленты — 404", async ({ request }) => {
  expect((await request.get("/xx/alerts/rss.xml")).status()).toBe(404);
});

test("страница предупреждений ведёт к ленте", async ({ page }) => {
  await page.goto("/ru/alerts");

  await expect(
    page.locator('link[rel="alternate"][type="application/rss+xml"]'),
  ).toHaveAttribute("href", /\/ru\/alerts\/rss\.xml$/);
  await expect(
    page.getByRole("link", { name: "RSS-лента предупреждений" }),
  ).toHaveAttribute("href", "/ru/alerts/rss.xml");
});
