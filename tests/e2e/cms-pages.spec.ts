import { expect, test } from "@playwright/test";

// CMS-страницы about/leadership/structure/symbols в собственных разделах
// сайта. Данные — tests/fixtures/cms-server.mjs (cmsPages): там же описано,
// какие переводы есть, какие CMS отдаёт русским fallback'ом, а каких нет.
//
// Правило: правка заголовка/текста/SEO страницы в CMS меняет раздел; нет
// страницы или перевода, молчит CMS — раздел тихо показывает встроенный
// текст (content.ts), а не пустоту и не русский текст под видом перевода.

const CANONICAL = {
  about: "/about",
  leadership: "/leadership",
  structure: "/structure",
  symbols: "/symbols",
} as const;

test.describe("canonical routes render the CMS page", () => {
  test("/ru/about shows the CMS page with breadcrumbs and its own SEO", async ({
    page,
  }) => {
    const response = await page.goto("/ru/about");
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("О Комитете");
    await expect(
      page.getByText("центральный орган государственного управления", { exact: false }),
    ).toBeVisible();
    await expect(page.getByText("Обновлено: 27 июля 2026")).toBeVisible();

    const crumbs = page.getByRole("navigation", { name: "Хлебные крошки" });
    await expect(crumbs.getByRole("link", { name: "Главная" })).toBeVisible();
    await expect(crumbs).toContainText("О нас");
    await expect(crumbs.locator('[aria-current="page"]')).toHaveText("О Комитете");

    // Перевод есть — заметки о переводе нет, страница индексируется.
    await expect(page.getByText("Перевод на этот язык пока не опубликован")).toHaveCount(0);
    await expect(page).toHaveTitle("О Комитете — КЧС РТ");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "Официальная информация о Комитете и его задачах.",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/ru\/about$/,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  });

  test("/ru/leadership takes its heading, intro and SEO from the CMS page", async ({
    page,
  }) => {
    await page.goto("/ru/leadership");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Руководство КЧС и ГО",
    );
    const intro = page.locator(".article-prose-intro");
    await expect(intro).toContainText("актуальный состав руководства Комитета");
    // Подзаголовок внутри лида — h2, до собственных секций страницы.
    await expect(intro.getByRole("heading", { level: 2 })).toHaveText("Приём граждан");
    // Лид стоит над карточкой председателя; состав руководства не тронут.
    const chairman = page.getByRole("region", { name: "Председатель" });
    await expect(chairman.getByText("Рустам Назарзода")).toBeVisible();
    const introBox = await intro.boundingBox();
    const chairmanBox = await chairman.boundingBox();
    expect(introBox!.y + introBox!.height).toBeLessThanOrEqual(chairmanBox!.y);

    await expect(page).toHaveTitle("Руководство Комитета — КЧС РТ");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "Состав руководства и направления ответственности.",
    );
  });

  test("/ru/structure puts the CMS text into the intro slot and keeps the rest", async ({
    page,
  }) => {
    await page.goto("/ru/structure");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Структура КЧС и ГО");
    await expect(
      page.getByText("В структуру Комитета входят центральный аппарат", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByText("образуют единую государственную систему", { exact: false }),
    ).toHaveCount(0);

    // Цифры, подразделения и направления — прежние.
    await expect(page.getByText("1994", { exact: true })).toBeVisible();
    await expect(page.getByRole("region", { name: "Подразделения" })).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Направления деятельности" }),
    ).toBeVisible();
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "Организационная структура и подразделения Комитета.",
    );
  });

  test("/ru/symbols uses the CMS heading and lead but keeps the official symbols", async ({
    page,
  }) => {
    await page.goto("/ru/symbols");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Государственные символы Таджикистана",
    );
    const lead = page.locator(".article-prose-intro");
    await expect(lead).toContainText("символы суверенитета Республики Таджикистан");
    await expect(lead.getByRole("link", { name: "каталоге документов" })).toHaveAttribute(
      "href",
      "/ru/documents",
    );

    // Флаг, герб и гимн — официальные изображения и тексты, не из CMS.
    await expect(page.getByRole("region", { name: "Государственный Флаг" }).locator("img")).toBeVisible();
    await expect(page.getByRole("region", { name: "Государственный Герб" }).locator("img")).toBeVisible();
    await expect(page.getByRole("region", { name: "Государственный Гимн" })).toContainText(
      "«Суруди миллӣ»",
    );
    await expect(page.getByRole("region", { name: "Использование символов" })).toBeVisible();
  });

  test("a translated page is used in its own locale", async ({ page }) => {
    await page.goto("/en/leadership");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Leadership of the Committee",
    );
  });
});

test.describe("sections fall back to their built-in text", () => {
  test("an untranslated page (CMS answers with the Russian fallback)", async ({
    page,
  }) => {
    await page.goto("/tj/structure");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Сохтори Кумита");
    await expect(
      page.getByText("Аппарати марказӣ, хидматҳои махсус ва идораҳои минтақавӣ", {
        exact: false,
      }),
    ).toBeVisible();
    // Русский текст CMS не выдаётся за таджикский.
    await expect(page.getByText("В структуру Комитета входят", { exact: false })).toHaveCount(0);
    await expect(page.getByText("Структура КЧС и ГО")).toHaveCount(0);
  });

  test("a page the CMS does not have in this locale (404)", async ({ page }) => {
    const response = await page.goto("/en/symbols");
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "State symbols of the Republic of Tajikistan",
    );
    await expect(
      page.getByText("The State Flag, the State Emblem and the State Anthem are symbols", {
        exact: false,
      }),
    ).toBeVisible();
    await expect(page.locator(".article-prose-intro")).toHaveCount(0);
  });

  test("/en/about without a translation is labelled and not indexed", async ({
    page,
  }) => {
    // У /about встроенного текста нет — он ведёт себя как /pages/{slug}.
    await page.goto("/en/about");

    await expect(
      page.getByText("A translation into this language has not been published yet", {
        exact: false,
      }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Read in Russian" })).toHaveAttribute(
      "href",
      "/ru/about",
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });
});

test.describe("/pages/{slug} of these pages is a permanent redirect", () => {
  for (const locale of ["ru", "tj", "en"] as const) {
    for (const [slug, path] of Object.entries(CANONICAL)) {
      test(`/${locale}/pages/${slug} → /${locale}${path} (308)`, async ({
        request,
      }) => {
        const response = await request.get(`/${locale}/pages/${slug}`, {
          maxRedirects: 0,
        });

        expect(response.status()).toBe(308);
        expect(response.headers()["location"]).toBe(`/${locale}${path}`);
      });
    }
  }

  test("a browser following /ru/pages/leadership lands on the section", async ({
    page,
  }) => {
    await page.goto("/ru/pages/leadership");

    await expect(page).toHaveURL(/\/ru\/leadership$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Руководство КЧС и ГО",
    );
  });

  test("other CMS pages stay at /pages/{slug}", async ({ page }) => {
    const response = await page.goto("/ru/pages/privacy");

    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/ru\/pages\/privacy$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Защита персональных данных",
    );
    await expect(page.locator(".article-prose")).toContainText(
      "используются только для рассмотрения обращения",
    );
  });
});

test.describe("«About us» navigation", () => {
  test("the desktop «О нас» menu starts with «О Комитете»", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/ru/news");

    const nav = page.getByRole("navigation", { name: "Основная навигация" });
    await nav.locator("summary", { hasText: "О нас" }).click();

    const items = nav.getByRole("menu").first().getByRole("menuitem");
    await expect(items).toHaveText([
      "О Комитете",
      "Руководство",
      "Структура",
      "Государственные символы",
    ]);
    await expect(items.first()).toHaveAttribute("href", "/ru/about");

    await items.first().click();
    await expect(page).toHaveURL(/\/ru\/about$/);
    // На /about раздел «О нас» подсвечен как текущий.
    await expect(nav.locator("summary", { hasText: "О нас" })).toHaveAttribute(
      "style",
      /--color-accent-700/,
    );
  });

  test("the mobile menu lists «О Комитете» first under «О нас»", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/tj");

    await page.locator('header button[aria-controls="public-mobile-menu"]').click();
    const links = page
      .getByRole("dialog")
      .getByRole("navigation", { name: "Навигатсияи мобилӣ" })
      .getByRole("link");

    // Первая ссылка — «Асосӣ» (главная), сразу за подписью «Дар бораи мо» —
    // «О Комитете» на таджикском.
    await expect(links.nth(1)).toHaveText("Дар бораи Кумита");
    await expect(links.nth(1)).toHaveAttribute("href", "/tj/about");
    await expect(links.nth(2)).toHaveAttribute("href", "/tj/leadership");
  });

  test("the HTML sitemap links to /about", async ({ page }) => {
    await page.goto("/en/sitemap");

    await expect(
      page.getByRole("link", { name: "About the Committee" }),
    ).toHaveAttribute("href", "/en/about");
  });
});
