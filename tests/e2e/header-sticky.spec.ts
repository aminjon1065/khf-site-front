import { expect, test } from "@playwright/test";

// Основная навигация должна оставаться на экране при прокрутке: на десктопе
// это строка `.knav`, на узком экране — бренд-ряд с 112 и меню. Служебная
// полоса (флаг, язык) уезжает — иначе закреплённая шапка съедает экран.

test("desktop keeps the main nav pinned after the brand row scrolls away", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/ru");

  const nav = page.locator("header nav.knav");
  const brand = page.locator("header .ksite-brand");
  const utility = page.locator("header .ksite-utility");
  const compact112 = page.locator("header .ksite-nav-112");

  await expect(nav).toBeVisible();
  await expect(compact112).toBeHidden();

  await page.evaluate(() => window.scrollTo(0, 900));

  await expect
    .poll(async () =>
      nav.evaluate((element) => Math.round(element.getBoundingClientRect().top)),
    )
    .toBe(0);
  await expect
    .poll(async () =>
      brand.evaluate((element) => element.getBoundingClientRect().bottom),
    )
    .toBeLessThanOrEqual(0);
  await expect
    .poll(async () =>
      utility.evaluate((element) => element.getBoundingClientRect().bottom),
    )
    .toBeLessThanOrEqual(0);

  await expect(page.locator("header.ksite-header")).toHaveAttribute(
    "data-compact",
  );
  await expect(compact112).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Основная навигация" })).toContainText(
    "Главная",
  );
});

test("mobile keeps the brand row pinned so 112 and the menu stay reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ru");

  const brand = page.locator("header .ksite-brand");
  const utility = page.locator("header .ksite-utility");
  const emergency = page.locator("header .ksite-brand a[href='tel:112']");
  const menu = page.locator('header button[aria-controls="public-mobile-menu"]');

  await expect(page.locator("header nav.knav")).toBeHidden();
  await expect(emergency).toBeVisible();
  await expect(menu).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, 900));

  await expect
    .poll(async () =>
      brand.evaluate((element) => Math.round(element.getBoundingClientRect().top)),
    )
    .toBe(0);
  await expect
    .poll(async () =>
      utility.evaluate((element) => element.getBoundingClientRect().bottom),
    )
    .toBeLessThanOrEqual(0);
  await expect(emergency).toBeVisible();
  await expect(menu).toBeVisible();
});
