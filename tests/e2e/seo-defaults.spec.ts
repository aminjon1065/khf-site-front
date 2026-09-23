import { expect, test, type Page } from "@playwright/test";

// Title и description сайта по умолчанию — из SEO-настроек CMS
// (seo.meta_title / seo.meta_description) для языка страницы; пустое поле —
// встроенная строка словаря. Страницы со своими метаданными их сохраняют.
// Значения — settings мок-CMS (tests/fixtures/cms-server.mjs): на ru и tg
// поля заполнены, на en пусты.

async function description(page: Page): Promise<string | null> {
  return page.locator('meta[name="description"]').getAttribute("content");
}

test("/ru: title и description главной — из SEO-настроек CMS", async ({
  page,
}) => {
  await page.goto("/ru");

  await expect(page).toHaveTitle("КЧС Таджикистана");
  expect(await description(page)).toBe(
    "Официальный сайт Комитета по чрезвычайным ситуациям и гражданской обороне Республики Таджикистан.",
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "КЧС Таджикистана",
  );
});

test("/tj: настройки — на языке страницы", async ({ page }) => {
  await page.goto("/tj");

  await expect(page).toHaveTitle("КҲФ ва МГ Тоҷикистон");
  expect(await description(page)).toBe(
    "Сомонаи расмии Кумитаи ҳолатҳои фавқулодда ва мудофиаи гражданӣ.",
  );
});

test("/en: пустые SEO-поля — встроенные title и description", async ({
  page,
}) => {
  await page.goto("/en");

  await expect(page).toHaveTitle(
    "Committee of Emergency Situations and Civil Defence of the Republic of Tajikistan",
  );
  expect(await description(page)).toBe(
    "Committee of Emergency Situations and Civil Defence under the Government of the Republic of Tajikistan",
  );
});

test("страница со своими метаданными их сохраняет", async ({ page }) => {
  await page.goto("/ru/contacts");

  await expect(page).toHaveTitle("Контакты — КЧС РТ");
  expect(await description(page)).toBe(
    "Центральный аппарат и региональные управления",
  );
});
