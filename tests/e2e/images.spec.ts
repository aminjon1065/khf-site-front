import { test, expect, type Page } from "@playwright/test";

// B-4: next/image for CMS media + local assets. Regression guard against a
// broken conversion (bad width/height, missing remotePatterns, wrong fill
// wrapper) actually decoding to nothing. Each <img> is scrolled into view
// first so native `loading="lazy"` images (header/footer icons) get a
// chance to load, not just the `eager` hero images.
async function expectAllImagesToDecode(page: Page) {
  // Responsive shells intentionally keep alternate desktop/mobile logos at
  // `display:none`; browsers do not have to fetch hidden lazy images. Assert
  // the images a visitor can actually see rather than forcing hidden assets
  // into view with a Playwright action that can never become actionable.
  const images = page.locator("img:visible");
  const count = await images.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const img = images.nth(i);
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
  const firstArticleLink = page.locator("main article h2 a[href*='/news/']").first();
  await expect(firstArticleLink).toBeVisible();
  const href = await firstArticleLink.getAttribute("href");
  expect(href).toMatch(/\/ru\/news\/[^/?]+$/);
  await page.goto(href!);
  await expect(page.locator("h1")).toBeVisible();
  await expectAllImagesToDecode(page);
});
