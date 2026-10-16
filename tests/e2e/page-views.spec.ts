import { test, expect } from "@playwright/test";

// Собственный учёт просмотров: страница материала отмечается один раз за
// сеанс вкладки, и в отметке нет ничего о читателе — только тип, адрес и язык.
//
// Тело sendBeacon Playwright не показывает, поэтому сам вызов подменяется
// записью в window.__views (как navigator.share в share.spec.ts).

test("a news page is counted once per session", async ({ page }) => {
  await page.goto("/ru/news");
  const href = await page.locator('main a[href^="/ru/news/"]').first().getAttribute("href");
  test.skip(!href, "нет ни одной новости в /ru/news");
  const slug = href!.split("/").pop();

  await page.addInitScript(() => {
    const store = window as unknown as { __views?: unknown[] };
    store.__views = [];
    navigator.sendBeacon = (url, data) => {
      if (String(url).endsWith("/api/views") && data instanceof Blob) {
        void data.text().then((text) => store.__views!.push(JSON.parse(text)));
      }
      return true;
    };
  });
  const recorded = () =>
    page.evaluate(() => (window as unknown as { __views: unknown[] }).__views);

  await page.goto(href!);
  await expect.poll(recorded).toEqual([{ type: "news", slug, locale: "ru" }]);

  // Reload in the same tab: not a new reader.
  await page.reload();
  await page.waitForLoadState("networkidle");
  expect(await recorded()).toEqual([]);
});
