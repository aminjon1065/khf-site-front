import { expect, test, type Page } from "@playwright/test";

// Главная следует разделу «Главная страница» CMS: верх (слайдер с карточкой
// Президента и «Оперативная сводка») — всегда первым, остальные секции — в
// порядке включённых блоков, под их заголовками, и не больше материалов, чем
// вмещает вёрстка. Раньше порядок был зашит, заголовки брались из словаря, а
// переключатель «Инструкции» ни на что не влиял. Блоки по локалям — `homeBlocks`
// в tests/fixtures/cms-server.mjs; без CMS — graceful-degradation.spec.ts.

test.use({ viewport: { width: 1280, height: 900 } });

/** Видимые заголовки секций (SectionHeader) в порядке документа. */
function sectionHeadings(page: Page): Promise<string[]> {
  return page.locator("main .section-head h2").allTextContents();
}

/** Доступные имена секций главной в порядке документа — из известного набора. */
async function sectionOrder(page: Page, known: string[]): Promise<string[]> {
  const labels = await page
    .locator("main section[aria-label]")
    .evaluateAll((sections) =>
      sections.map((section) => section.getAttribute("aria-label") ?? ""),
    );
  return labels.filter((label) => known.includes(label));
}

test("/ru: секции идут в порядке блоков CMS и подписаны их заголовками", async ({
  page,
}) => {
  await page.goto("/ru");

  expect(await sectionHeadings(page)).toEqual([
    "Действующие предупреждения",
    // Документы, объявления и проекты — одна секция на месте первого из трёх.
    "Нормативные документы",
    "Вакансии и тендеры",
    "Международные проекты",
    "Новости Комитета",
    "Памятки населению",
    // У блока карты заголовок не задан — словарный.
    "Обстановка по регионам",
  ]);

  expect(
    await sectionOrder(page, [
      "Главное",
      "Оперативная сводка",
      "Последние предупреждения",
      "Официальная информация",
      "Новости",
      "Быстрые действия",
      "Карта предупреждений",
      "Показатели Комитета",
    ]),
  ).toEqual([
    // Верх страницы от блоков не зависит.
    "Главное",
    "Оперативная сводка",
    "Последние предупреждения",
    "Официальная информация",
    "Новости",
    "Быстрые действия",
    "Карта предупреждений",
    // Заголовок блока показателей — доступное имя секции без видимого титула.
    "Показатели Комитета",
  ]);

  // Блок «Экстренные контакты» сайт не рисует.
  await expect(
    page.getByRole("heading", { name: "Экстренные контакты" }),
  ).toHaveCount(0);
});

test("/ru: секции не показывают больше, чем вмещает вёрстка", async ({
  page,
}) => {
  // Мок присылает 5 предупреждений, 7 новостей, 5 инструкций, по 7 документов
  // и объявлений и 4 проекта.
  await page.goto("/ru");
  const region = (name: string) =>
    page.getByRole("region", { name, exact: true });

  await expect(
    region("Последние предупреждения").locator('a[href^="/ru/alerts/"]'),
  ).toHaveCount(3);
  await expect(region("Новости").locator('a[href^="/ru/news/"]')).toHaveCount(
    5,
  );
  await expect(
    region("Быстрые действия").locator('a[href^="/ru/guides/"]'),
  ).toHaveCount(3);

  const official = region("Официальная информация");
  await expect(official.locator('a[href*="home="]')).toHaveCount(5);
  await expect(
    official.locator('a[href^="/ru/announcements/"]'),
  ).toHaveCount(5);
  await expect(official.locator('a[href^="/ru/projects/"]')).toHaveCount(3);
});

test("/tj: выключенные блоки не рисуются, пустой заголовок — словарный", async ({
  page,
}) => {
  await page.goto("/tj");

  expect(await sectionHeadings(page)).toEqual([
    "Вазъияти минтақаҳо",
    "Хабарҳо ва баёнияҳо",
    "Лоиҳаҳои байналмилалӣ",
    "Огоҳиҳои амалкунанда",
  ]);

  // Переключатель «Инструкции» выключен — плиток «Что делать» нет.
  await expect(
    page.getByRole("region", { name: "Амалҳои зуд", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator('main a[href^="/tj/guides/"]')).toHaveCount(0);

  // Документы и объявления выключены: CMS их прислала, но сайт не показывает.
  const official = page.getByRole("region", {
    name: "Иттилооти расмӣ",
    exact: true,
  });
  await expect(official.locator('a[href*="home="]')).toHaveCount(0);
  await expect(
    official.locator('a[href^="/tj/announcements/"]'),
  ).toHaveCount(0);
  await expect(official.locator('a[href^="/tj/projects/"]')).toHaveCount(3);
});

test("/en: раскладка по умолчанию — как в сидере CMS", async ({ page }) => {
  await page.goto("/en");

  expect(await sectionHeadings(page)).toEqual([
    "Active warnings",
    "Latest news",
    "Public safety guides",
    "Official documents",
    "Announcements",
    "Projects",
    "Regional situation",
  ]);
});

test("/ru: сводка говорит, на какой момент известна обстановка", async ({
  page,
}) => {
  await page.goto("/ru");

  const summary = page.getByRole("region", { name: "Оперативная сводка" });
  const time = summary.locator("time");

  // Время сверки из CMS (alerts.updated_at), в поясе Душанбе; дата — потому
  // что сведения не сегодняшние.
  await expect(time).toHaveAttribute("datetime", "2026-07-27T11:58:00+05:00");
  await expect(summary).toContainText("Обстановка на 27 июля, 11:58 (UTC+5)");
});
