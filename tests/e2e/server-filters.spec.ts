import { expect, test } from "@playwright/test";

test("announcement kind is filtered by the CMS and survives reload", async ({
  page,
}) => {
  await page.goto("/ru/announcements");
  await expect(page.getByRole("article")).toHaveCount(2);

  await page.getByRole("link", { name: "Тендеры", exact: true }).click();

  await expect(page).toHaveURL(/\?kind=tender/);
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByText("Тестовый тендер")).toBeVisible();
  await expect(page.getByText("Тестовая вакансия")).toHaveCount(0);

  await page.reload();
  await expect(
    page.getByRole("link", { name: "Тендеры", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

test("document type and search are server-side shareable filters", async ({
  page,
}) => {
  await page.goto("/ru/documents");
  await expect(page.locator("tbody tr")).toHaveCount(2);

  await page.getByLabel("Тип документа").selectOption("law");
  await page.getByLabel("Поиск документов").fill("123");
  await page.getByRole("button", { name: "Найти" }).click();

  await expect(page).toHaveURL(/type=law/);
  await expect(page).toHaveURL(/q=123/);
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.getByText("Закон № 123")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Тип документа")).toHaveValue("law");
  await expect(page.getByLabel("Поиск документов")).toHaveValue("123");
});

test("news search is applied by the CMS before rendering", async ({ page }) => {
  await page.goto("/ru/news");

  await page.getByLabel("Поиск по новостям").fill("автоматических");
  await page.getByRole("button", { name: "Найти" }).click();

  await expect(page).toHaveURL(/q=%D0%B0%D0%B2%D1%82%D0%BE%D0%BC/);
  await expect(page.locator("article")).toHaveCount(1);

  await page.getByLabel("Поиск по новостям").fill("нет-такой-новости");
  await page.getByRole("button", { name: "Найти" }).click();
  await expect(page.getByText("Ничего не найдено")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Поиск по новостям")).toHaveValue(
    "нет-такой-новости",
  );
});
