import { test, expect } from "@playwright/test";

// Каталог документов на узком экране.
//
// Разобранная проблема: таблица из шести колонок на 390px сжимала название в
// узкий столбец на пять-шесть строк, а колонка «Файл» целиком уезжала за
// горизонтальный скролл — кнопки скачивания на мобильном не было видно вовсе.
//
// Решение: два представления одних и тех же данных — таблица на desktop и
// карточки на ≤920px. Требования, которые здесь и проверяются:
//   1. на узком экране видны карточки, таблицы нет;
//   2. на широком — наоборот;
//   3. скрытое представление не дублируется для скринридера (display: none
//      выводит поддерево и из дерева доступности, поэтому по доступному имени
//      документ находится ровно один раз);
//   4. состояние файла на карточке названо словами, а не одним тире;
//   5. фильтр типа на узком экране — select в той же GET-форме, состояние
//      живёт в адресе и переживает перезагрузку.

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 720 };

test("на узком экране каталог — карточки, на широком — таблица", async ({
  page,
}) => {
  await page.setViewportSize(MOBILE);
  await page.goto("/ru/documents");

  const table = page.locator("table.table");
  const cards = page.getByRole("list", { name: "Документы" });

  await expect(cards).toBeVisible();
  await expect(table).toBeHidden();

  await page.setViewportSize(DESKTOP);
  await expect(table).toBeVisible();
  await expect(cards).toBeHidden();
});

test("скрытое представление не дублирует документ для скринридера", async ({
  page,
}) => {
  await page.setViewportSize(MOBILE);
  await page.goto("/ru/documents");

  // Название документа присутствует в разметке дважды (таблица + карточки),
  // но скрытое через display:none поддерево выпадает из дерева доступности,
  // поэтому доступных вхождений ровно одно.
  const heading = page.getByText("Закон № 123", { exact: true });
  const visible = await heading.evaluateAll(
    (nodes) =>
      nodes.filter((n) => (n as HTMLElement).offsetParent !== null).length,
  );

  expect(visible).toBe(1);
});

test("на мобильном состояние файла показано словами, а не одним тире", async ({
  page,
}) => {
  await page.setViewportSize(MOBILE);
  await page.goto("/ru/documents");

  const cards = page.getByRole("list", { name: "Документы" });
  const card = cards.getByRole("listitem").first();

  // У материалов фикстуры файла нет (href: null). В таблице это было одно
  // тире в узком столбце — на карточке обязана быть внятная фраза.
  await expect(card).toContainText("Файл не опубликован");
  await expect(card.getByRole("link")).toHaveCount(0);

  // Полное название, а не обрезок: карточка не сжимает его в столбец.
  await expect(card).toContainText("Закон № 123");
});

test("мобильный фильтр типа — select в той же GET-форме, состояние в адресе", async ({
  page,
}) => {
  await page.setViewportSize(MOBILE);
  await page.goto("/ru/documents");

  // На узком экране ряд кнопок-типов скрыт: вместо него select в форме поиска.
  await expect(page.getByRole("group", { name: "Тип документа" })).toBeHidden();

  // getByRole("combobox"), а не getByLabel: то же доступное имя носит и
  // группа кнопок-типов на desktop, поиск по метке был бы неоднозначен.
  const select = page.getByRole("combobox", { name: "Тип документа" });
  await expect(select).toBeVisible();
  await select.selectOption("law");
  await page.getByRole("button", { name: "Найти" }).click();

  await expect(page).toHaveURL(/type=law/);
  // Состояние живёт в адресе, поэтому переживает перезагрузку и шаринг.
  await page.reload();
  await expect(page.getByRole("combobox", { name: "Тип документа" })).toHaveValue("law");
});
