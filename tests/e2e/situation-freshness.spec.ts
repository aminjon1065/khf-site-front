import { expect, test } from "@playwright/test";

// A-2: страницы обстановки говорят, на какой момент она известна, и
// предупреждают, если это было давно — старше срока, который выбрал
// администратор CMS. В моке срок — сутки, а сводка датирована 27 июля.

const OUTDATED =
  "Сведения давно не обновлялись и могли устареть. При угрозе жизни звоните 112.";

for (const path of ["/ru", "/ru/alerts", "/ru/map"]) {
  test(`${path}: время обстановки и предупреждение об устаревании`, async ({
    page,
  }) => {
    await page.goto(path);

    await expect(
      page.locator('time[datetime="2026-07-27T11:58:00+05:00"]'),
    ).toBeVisible();
    await expect(
      page.getByText("Обстановка на 27 июля, 11:58 (UTC+5)"),
    ).toBeVisible();
    await expect(
      page.getByRole("status").filter({ hasText: OUTDATED }),
    ).toBeVisible();
  });
}

test("/tj/alerts: предупреждение на языке страницы", async ({ page }) => {
  await page.goto("/tj/alerts");

  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Маълумот кайҳо нав карда нашудааст" }),
  ).toBeVisible();
});
