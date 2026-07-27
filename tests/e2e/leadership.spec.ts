import { test, expect } from "@playwright/test";

// C-1a: /leadership now reads the roster from the CMS (fetchLeadership)
// instead of a hardcoded content.ts. Assumes the CMS is seeded with
// LeaderSeeder's data (one chairman + three deputies), same as the content
// this replaced.

test("shows the chairman as a hero card and deputies in a grid", async ({ page }) => {
  await page.goto("/ru/leadership");

  await expect(page.getByRole("heading", { name: "Руководство Комитета" })).toBeVisible();

  const chairmanSection = page.getByRole("region", { name: "Председатель" });
  await expect(chairmanSection.getByText("Председатель Комитета")).toBeVisible();
  await expect(chairmanSection.getByText("Рустам Назарзода")).toBeVisible();
  // Static chrome (not CMS data) survives the migration unchanged.
  await expect(chairmanSection.getByRole("link", { name: "График приёма граждан" })).toBeVisible();

  const deputiesSection = page.getByRole("region", { name: "Заместители" });
  await expect(deputiesSection.getByText("Первый заместитель", { exact: true })).toBeVisible();
  await expect(deputiesSection.getByRole("link", { name: "«Структура»" })).toBeVisible();
});
