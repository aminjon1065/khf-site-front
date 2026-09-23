import { expect, test } from "@playwright/test";

// Подписи меню из CMS (шапка и подвал). Раньше словарь подменял подпись
// редактора для встроенных разделов, и переименование пункта в CMS на сайт не
// попадало. Правило теперь такое: подпись CMS на языке страницы важнее;
// словарь — только для встроенного раздела с пустой подписью (пункт не
// переведён); пустое меню — статичная навигация. Меню — в мок-CMS
// (tests/fixtures/cms-server.mjs, `menus`).

test.use({ viewport: { width: 1280, height: 800 } });

test("/ru: пункт шапки называется так, как его назвал редактор", async ({
  page,
}) => {
  await page.goto("/ru");
  const nav = page.locator("header nav.knav");

  await expect(
    nav.getByRole("link", { name: "Новости и заявления", exact: true }),
  ).toHaveAttribute("href", "/ru/news");
  // Словарная подпись встроенного раздела подпись CMS не подменяет…
  await expect(
    nav.getByRole("link", { name: "Новости", exact: true }),
  ).toHaveCount(0);
  // …и подставляется, только когда подпись CMS пуста.
  await expect(
    nav.getByRole("link", { name: "Безопасность", exact: true }),
  ).toHaveAttribute("href", "/ru/guides");
});

test("/ru: подвал следует тому же правилу", async ({ page }) => {
  await page.goto("/ru");
  const footer = page.getByRole("contentinfo");

  await expect(
    footer.getByRole("link", { name: "Новости КЧС", exact: true }),
  ).toHaveAttribute("href", "/ru/news");
  await expect(
    footer.getByRole("link", { name: "Новости и заявления", exact: true }),
  ).toHaveCount(0);
  // Подпись из одних пробелов — та же непереведённая.
  await expect(
    footer.getByRole("link", { name: "Инструкции населению", exact: true }),
  ).toHaveAttribute("href", "/ru/guides");
});

test("/tj: непереведённые пункты показывают подписи словаря", async ({
  page,
}) => {
  await page.goto("/tj");
  const nav = page.locator("header nav.knav");

  await expect(
    nav.getByRole("link", { name: "Хабарҳо", exact: true }),
  ).toHaveAttribute("href", "/tj/news");
  await expect(
    nav.getByRole("link", { name: "Бехатарӣ", exact: true }),
  ).toHaveAttribute("href", "/tj/guides");
});

test("/en: пустое меню CMS — статичная навигация", async ({ page }) => {
  await page.goto("/en");
  const nav = page.locator("header nav.knav");

  for (const [name, href] of [
    ["News", "/en/news"],
    ["Safety", "/en/guides"],
    ["Risk map", "/en/map"],
    ["Contacts", "/en/contacts"],
  ] as const) {
    await expect(nav.getByRole("link", { name, exact: true })).toHaveAttribute(
      "href",
      href,
    );
  }
});
