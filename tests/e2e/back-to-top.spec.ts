import { expect, test } from "@playwright/test";

test("the back-to-top control appears on scroll and returns to the top", async ({
  page,
}) => {
  await page.goto("/ru");

  const button = page.getByRole("button", { name: "Наверх" });

  await expect(button).toBeHidden();

  await page.evaluate(() => window.scrollTo(0, 900));

  await expect(button).toBeVisible();
  await expect
    .poll(async () =>
      button.evaluate((element) => Math.round(element.getBoundingClientRect().left)),
    )
    .toBeLessThan(40);

  await button.click();

  await expect
    .poll(() => page.evaluate(() => Math.round(window.scrollY)))
    .toBe(0);
  await expect
    .poll(async () =>
      page
        .locator("header .ksite-utility")
        .evaluate((element) => Math.round(element.getBoundingClientRect().top)),
    )
    .toBe(0);
  await expect(button).toBeHidden();
});
