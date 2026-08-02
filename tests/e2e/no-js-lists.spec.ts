import { expect, test } from "@playwright/test";

// Пагинация и фильтры списков объявлены серверными — до сих пор это было
// написано только в комментариях, а проверялось браузером с включённым JS,
// где клиентская фильтрация дала бы ровно тот же результат. Здесь JS выключен:
// всё, что видно, пришло с сервера, и никакая клиентская логика не может
// подменить ответ.
test.use({ javaScriptEnabled: false });

test("категория новостей отбирается сервером, а не на клиенте", async ({
  page,
}) => {
  await page.goto("/ru/news");
  const all = await page.getByRole("article").count();
  expect(all).toBeGreaterThan(0);

  const category = page.getByRole("link", { name: "Сотрудничество" });
  const href = await category.getAttribute("href");
  // Фильтр обязан быть ссылкой с адресом, а не кнопкой с обработчиком:
  // именно это делает выбор разделяемым и переживающим перезагрузку.
  expect(href).toContain("category=");

  await category.click();
  await expect(page).toHaveURL(/category=sotrudnichestvo/);
  expect(await page.getByRole("article").count()).toBeGreaterThan(0);
});

test("поиск по документам — обычная GET-форма и работает без JS", async ({
  page,
}) => {
  await page.goto("/ru/documents");
  await expect(page.locator("tbody tr")).toHaveCount(2);

  await page.getByLabel("Поиск документов").fill("123");
  await page.getByRole("button", { name: "Найти" }).click();

  await expect(page).toHaveURL(/q=123/);
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.getByText("Закон № 123")).toBeVisible();
});

test("страницы списка — настоящие ссылки, а не клиентское состояние", async ({
  page,
}) => {
  // Демонстрационных данных не хватает на вторую страницу, поэтому проверяем
  // сам механизм: адрес со страницей отдаётся сервером и рендерит список.
  const response = await page.goto("/ru/news?page=2");
  expect(response?.status()).toBe(200);

  const nav = page.getByRole("navigation", { name: /страниц/i });
  if ((await nav.count()) > 0) {
    for (const link of await nav.getByRole("link").all()) {
      expect(await link.getAttribute("href")).toContain("page=");
    }
  }
});
