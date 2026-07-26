import { test, expect, type Page } from "@playwright/test";

// B-4: next/image for CMS media + local assets. Regression guard against a
// broken conversion (bad width/height, missing remotePatterns, wrong fill
// wrapper) actually decoding to nothing. Each <img> is scrolled into view
// first so native `loading="lazy"` images (header/footer icons) get a
// chance to load, not just the `eager` hero images.
async function expectAllImagesToDecode(page: Page) {
  const count = await page.locator("img").count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const img = page.locator("img").nth(i);
    await img.scrollIntoViewIfNeeded();
    const alt = await img.getAttribute("alt");
    await expect
      .poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth), {
        message: `image "${alt}" failed to decode`,
      })
      .toBeGreaterThan(0);
  }
}

test("homepage images (header icons + president photo) all decode successfully", async ({ page }) => {
  await page.goto("/ru");
  await expectAllImagesToDecode(page);
});

test("symbols page images (flag, emblem) decode successfully", async ({ page }) => {
  await page.goto("/ru/symbols");
  await expectAllImagesToDecode(page);
});

test("a news article cover photo decodes successfully", async ({ page }) => {
  await page.goto("/ru/news");
  const firstArticleLink = page.locator("main a[href*='/news/']").first();
  await firstArticleLink.click();
  await expectAllImagesToDecode(page);
});
