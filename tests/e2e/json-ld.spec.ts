import { test, expect, type Page } from "@playwright/test";

// E-3: structured data, scoped per PROJECT_PLAN.md E-3 — GovernmentOrganization
// (global), NewsArticle (news detail), BreadcrumbList (every page with visual
// breadcrumbs). Regression guard against a broken/empty settings fetch
// silently producing no script tag (JsonLd.tsx returns null on that), and
// against any future edit producing malformed JSON.
//
// Проверяется не наличие блока, а его пригодность: пустая строка в
// обязательном поле или относительный URL — валидный JSON и невалидная
// разметка для поисковика, то есть ровно та регрессия, которую тест «блок
// есть» пропускает.
type Block = Record<string, unknown>;

async function jsonLdBlocks(page: Page): Promise<Block[]> {
  const raw = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  return raw.map((text) => JSON.parse(text) as Block);
}

function blockOfType(blocks: Block[], type: string): Block {
  const found = blocks.find((block) => block["@type"] === type);
  expect(found, `нет блока ${type}`).toBeTruthy();
  return found!;
}

/** Непустая строка — обязательное текстовое поле схемы. */
function expectFilledString(block: Block, field: string) {
  expect(typeof block[field], `${block["@type"]}.${field}`).toBe("string");
  expect((block[field] as string).trim(), `${block["@type"]}.${field}`).not.toBe(
    "",
  );
}

/** Абсолютный URL: относительный адрес поисковик не разрешит. */
function expectAbsoluteUrl(block: Block, field: string) {
  expectFilledString(block, field);
  expect(block[field] as string, `${block["@type"]}.${field}`).toMatch(
    /^https?:\/\//,
  );
}

test("home page has a valid GovernmentOrganization block", async ({ page }) => {
  await page.goto("/ru");
  const org = blockOfType(await jsonLdBlocks(page), "GovernmentOrganization");

  expect(org["@context"]).toBe("https://schema.org");
  expectFilledString(org, "name");
  expectAbsoluteUrl(org, "url");
  expectAbsoluteUrl(org, "logo");
});

test("a news article has NewsArticle and BreadcrumbList blocks alongside GovernmentOrganization", async ({
  page,
}) => {
  // A hard navigation (goto), not a click-through: JSON-LD exists for
  // crawlers, which request each URL directly rather than executing a
  // client-side SPA transition - that's the render path worth asserting on.
  await page.goto("/ru/news");
  const href = await page
    .locator("main a[href*='/news/']")
    .first()
    .getAttribute("href");
  await page.goto(href!);

  const blocks = await jsonLdBlocks(page);
  const types = blocks.map((block) => block["@type"]);
  expect(types).toEqual(
    expect.arrayContaining([
      "GovernmentOrganization",
      "NewsArticle",
      "BreadcrumbList",
    ]),
  );

  const article = blockOfType(blocks, "NewsArticle");
  expectFilledString(article, "headline");
  expectAbsoluteUrl(article, "mainEntityOfPage");
  expect(article.inLanguage).toBe("ru");
  // Google сообщает об отсутствующем author предупреждением rich results.
  // Автор и издатель у официального портала — сам Комитет: персональные
  // данные редактора публичный DTO не отдаёт принципиально.
  for (const field of ["author", "publisher"] as const) {
    const organization = article[field] as Block | undefined;
    expect(organization, `NewsArticle.${field}`).toBeTruthy();
    expect(organization!["@type"]).toBe("GovernmentOrganization");
    expectFilledString(organization!, "name");
    expectAbsoluteUrl(organization!, "logo");
  }

  const breadcrumbs = blockOfType(blocks, "BreadcrumbList");
  const items = breadcrumbs.itemListElement as {
    position: number;
    name: string;
    item?: string;
  }[];
  expect(items.length).toBeGreaterThanOrEqual(2);
  // Позиции — сплошная нумерация с единицы; иначе цепочка не собирается.
  expect(items.map((it) => it.position)).toEqual(
    items.map((_, index) => index + 1),
  );
  for (const item of items) {
    expect(item.name.trim()).not.toBe("");
  }
  for (const item of items.slice(0, -1)) {
    expect(item.item).toMatch(/^https?:\/\//);
  }
  // Last item (current page) must not link to itself.
  expect(items[items.length - 1].item).toBeUndefined();
});

test("alerts list page has a BreadcrumbList block", async ({ page }) => {
  await page.goto("/ru/alerts");
  const blocks = await jsonLdBlocks(page);
  const types = blocks.map((block) => block["@type"]);
  expect(types).toContain("BreadcrumbList");
});

test("язык блока следует локали страницы, а не остаётся русским", async ({
  page,
}) => {
  await page.goto("/tj/news");
  const href = await page
    .locator("main a[href*='/news/']")
    .first()
    .getAttribute("href");
  await page.goto(href!);

  const article = blockOfType(await jsonLdBlocks(page), "NewsArticle");
  // Портальный `tj` публикуется под стандартным кодом языка `tg` — тем же,
  // что в <html lang> и hreflang.
  expect(article.inLanguage).toBe("tg");
  expect(article.mainEntityOfPage as string).toContain("/tj/news/");
});
