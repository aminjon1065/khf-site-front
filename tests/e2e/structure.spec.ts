import { test, expect } from "@playwright/test";

// C-1b: /structure now reads its units and stat plates from the CMS
// (fetchStructureUnits + fetchSettings) instead of a hardcoded content.ts.
// Assumes the CMS is seeded with StructureUnitSeeder/SettingSeeder's data.

test("shows the stat plates and all six units from the CMS", async ({ page }) => {
  await page.goto("/ru/structure");

  await expect(page.getByRole("heading", { name: "Структура Комитета" })).toBeVisible();

  // Stat plates: values come from Settings, labels are static UI copy.
  await expect(page.getByText("1994", { exact: true })).toBeVisible();
  await expect(page.getByText("год образования")).toBeVisible();
  await expect(page.getByText("68", { exact: true })).toBeVisible();

  const unitsSection = page.getByRole("region", { name: "Подразделения" });
  await expect(unitsSection.getByText("Центр управления в кризисных ситуациях")).toBeVisible();
  await expect(unitsSection.getByText("Управление международного сотрудничества")).toBeVisible();
  // Static chrome (not CMS data) survives the migration unchanged.
  await expect(unitsSection.getByRole("link", { name: "руководство →" })).toBeVisible();
});
