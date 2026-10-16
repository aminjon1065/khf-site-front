import { test, expect } from "@playwright/test";

// Старая ссылка из мессенджера ведёт и на завершённое предупреждение. Его
// страница остаётся для справки, но не должна выглядеть действующей угрозой:
// заметная плашка «больше не действует» и путь к действующим предупреждениям.

test("завершённое предупреждение помечено и ведёт к действующим", async ({
  page,
}) => {
  await page.goto("/ru/alerts/ended-alert");

  const notice = page.getByRole("status").filter({
    hasText: "Предупреждение больше не действует",
  });
  await expect(notice).toBeVisible();
  await expect(
    notice.getByRole("link", { name: "Действующие предупреждения" }),
  ).toHaveAttribute("href", "/ru/alerts");
});

test("действующее предупреждение — без плашки о завершении", async ({
  page,
}) => {
  await page.goto("/ru/alerts/test-alert");

  await expect(
    page.getByRole("heading", { level: 1, name: "Тестовое предупреждение" }),
  ).toBeVisible();
  await expect(page.getByText("Предупреждение больше не действует")).toHaveCount(0);
});

test("номер 112 в каталоге инструкций набирается нажатием", async ({ page }) => {
  await page.goto("/ru/guides");

  await expect(page.locator('main a[href="tel:112"]').first()).toBeVisible();
});
