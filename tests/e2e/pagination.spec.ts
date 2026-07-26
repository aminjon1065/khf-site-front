import { test, expect } from "@playwright/test";

// B-1: pagination. The seeded demo dataset is small (a handful of items per
// content type — nowhere near the "60 news items" scale the plan describes),
// so with a sane per_page (12-20) no list actually spans 2 pages right now.
// That's a property of the demo data, not the pagination code, so these
// tests exercise the `?page=` mechanism directly (works for any dataset
// size) plus a conditional check that clicks a real "2" link when the data
// happens to support it.

test("?page=2 and a far-out ?page=999 never 500, even on a single-page list", async ({ page }) => {
  for (const url of ["/ru/news?page=2", "/ru/news?page=999"]) {
    const response = await page.goto(url);
    expect(response?.status()).toBe(200);
  }
});

test("clicking page 2 (when the list has one) shows different items and updates the URL", async ({ page }) => {
  await page.goto("/ru/guides");

  const pageTwoLink = page.getByRole("link", { name: "Страница 2" });
  if ((await pageTwoLink.count()) === 0) {
    test.skip(true, "demo dataset does not have enough guides for a second page");
    return;
  }

  const firstPageHeading = await page.locator("h2, h3").first().textContent();
  await pageTwoLink.click();

  await expect(page).toHaveURL(/\?page=2/);
  const secondPageHeading = await page.locator("h2, h3").first().textContent();
  expect(secondPageHeading).not.toBe(firstPageHeading);
});
