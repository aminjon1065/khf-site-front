import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// E-1: axe-скан контрольных страниц. Файл сведён из двух линий работ
// (a11y.spec.ts + accessibility.spec.ts): обе сканировали одно и то же разными
// планками, поэтому планка сохранена у каждого маршрута своя, а не приведена
// к общей — понижать уже достигнутый уровень нельзя, а поднимать чужой «на
// глаз» значит выдать непроверенное покрытие за проверенное.
//
// `wcag2a`/`wcag2aa`/`wcag21a`/`wcag21aa` — стандартный «разумный» набор тегов
// axe. Правила `best-practice` намеренно не включены: это вкусовые
// рекомендации, а не реальные нарушения доступности.
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

type Bar = "none" | "blocking";

async function scan(
  page: import("@playwright/test").Page,
  url: string,
  bar: Bar,
) {
  await page.goto(url);

  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const violations =
    bar === "none"
      ? results.violations
      : results.violations.filter(
          (violation) =>
            violation.impact === "serious" || violation.impact === "critical",
        );
  const summary = violations.map(
    (violation) =>
      `[${violation.impact}] ${violation.id}: ${violation.help} (${violation.nodes.length} node(s))`,
  );

  expect(summary, summary.join("\n")).toEqual([]);
}

// Страницы, на которые нацелены бюджеты Lighthouse из PROJECT_PLAN.md.
// Планка жёсткая: ни одного нарушения любой значимости.
for (const route of ["/ru", "/ru/news", "/ru/map"] as const) {
  test(`${route} has no axe violations at all`, async ({ page }) => {
    await scan(page, route, "none");
  });
}

test("a news article has no axe violations at all", async ({ page }) => {
  // Slug берём из списка, а не зашиваем: страница должна оставаться чистой
  // для любого материала, а не только для фикстурного.
  await page.goto("/ru/news");
  const href = await page
    .locator("main a[href*='/news/']")
    .first()
    .getAttribute("href");

  await scan(page, href!, "none");
});

// Нерусские локали — та же жёсткая планка, что и у /ru. Раньше здесь
// допускались нарушения ниже serious: разной планкой легко не заметить, что
// проблема живёт только в одной локали (так на /tj и /en долго оставались
// русские подписи уровней опасности).
for (const route of ["/tj", "/en"] as const) {
  test(`${route} has no axe violations at all`, async ({ page }) => {
    await scan(page, route, "none");
  });
}

// Детальные страницы. Сканировалась только новость, а <h6> ради размера и
// прочие разрывы иерархии накопились именно здесь. Slug берём из списка:
// страница должна быть чистой для любого материала, а не для фикстурного.
for (const [name, listRoute, linkSelector] of [
  ["guide", "/ru/guides", "main a[href*='/guides/']"],
  ["project", "/ru/projects", "main a[href*='/projects/']"],
  ["announcement", "/ru/announcements", "main a[href*='/announcements/']"],
] as const) {
  test(`a ${name} detail page has no axe violations at all`, async ({
    page,
  }) => {
    await page.goto(listRoute);
    const href = await page.locator(linkSelector).first().getAttribute("href");

    test.skip(!href, `нет ни одного материала в ${listRoute}`);
    await scan(page, href!, "none");
  });
}

// Остальные публичные страницы. Их не сканировал никто, и именно там
// накопились нарушения: заголовки с пропущенным уровнем (<h6> ради размера
// после <h1>) на четырёх страницах и ссылка в тексте, отличимая только цветом,
// — на двух. Планка жёсткая: страница, которую не проверяют, ровно так и
// зарастает.
for (const route of [
  "/ru/projects",
  "/ru/documents",
  "/ru/guides",
  "/ru/announcements",
  "/ru/alerts",
  "/ru/contacts",
  "/ru/sos",
  "/ru/leadership",
  "/ru/structure",
  "/ru/symbols",
  "/ru/sitemap",
  "/ru/search",
] as const) {
  test(`${route} has no axe violations at all`, async ({ page }) => {
    await scan(page, route, "none");
  });
}
