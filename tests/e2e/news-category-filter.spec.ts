import { test, expect } from "@playwright/test";

// B-2: the category filter is server-driven (?category=slug), not client
// JS state — it must work as a plain link and survive a reload.

test("selecting a category narrows the list and updates the URL", async ({ page }) => {
  await page.goto("/ru/news");

  const before = await page.getByRole("article").count().catch(() => 0);

  await page.getByRole("link", { name: "Сотрудничество" }).click();

  await expect(page).toHaveURL(/\?category=sotrudnichestvo/);
  const afterCount = await page.locator('[role="feed"] article, article').count();
  expect(afterCount).toBeGreaterThan(0);
  if (before > 0) {
    expect(afterCount).toBeLessThanOrEqual(before);
  }
});

test("the category filter survives a reload (shareable link)", async ({ page }) => {
  await page.goto("/ru/news?category=sotrudnichestvo");

  await expect(page.getByRole("link", { name: "Сотрудничество" })).toHaveAttribute(
    "aria-current",
    "true",
  );

  await page.reload();

  await expect(page).toHaveURL(/\?category=sotrudnichestvo/);
  await expect(page.getByRole("link", { name: "Сотрудничество" })).toHaveAttribute(
    "aria-current",
    "true",
  );
});

test('"Все" clears the category filter', async ({ page }) => {
  await page.goto("/ru/news?category=sotrudnichestvo");

  await page.getByRole("link", { name: "Все", exact: true }).click();

  await expect(page).not.toHaveURL(/category=/);
});
