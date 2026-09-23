import { test, expect } from "@playwright/test";

// B-6: what every public route does when the CMS API is unreachable. Runs
// ONLY against the "backend-down" project (see playwright.config.ts) — a
// real Next server started with API_URL pointed at a port nothing listens
// on, so every lib/api.ts fetch genuinely fails end-to-end. This can't be
// done with page.route(): these are Server Component fetches that run on
// the Next server process, never touching the browser's network stack, so
// browser-level request mocking has nothing to intercept.
//
// Acceptance bar (PROJECT_PLAN.md, B-6): no unhandled exception anywhere,
// and no page left with an empty <main> and no explanation.

test.describe("list pages show a human empty state, not a blank page", () => {
  // Тексты именно «временно недоступно», а не «ничего не найдено»: при
  // молчащем бэкенде список пуст не потому, что материалов нет. Это разные
  // сообщения и разные следующие действия для посетителя (см. FetchList.
  // unavailable в lib/api.ts).
  const cases: Array<[url: string, text: string]> = [
    ["/ru/news", "Новости временно недоступны"],
    ["/ru/documents", "Каталог временно недоступен"],
    ["/ru/guides", "Список инструкций временно недоступен"],
    ["/ru/projects", "Список проектов временно недоступен"],
    ["/ru/announcements", "Объявления временно недоступны"],
    // Молчание бэкенда — не подтверждённое отсутствие угроз: страницы обстановки
    // обязаны сообщать о недоступности данных, а не изображать «штатную» тишину.
    ["/ru/alerts", "Данные об обстановке сейчас недоступны"],
    ["/ru/map", "Данные об обстановке сейчас недоступны"],
    ["/tj/alerts", "Иттилооти вазъият ҳоло дастрас нест"],
    ["/en/alerts", "Situation data is currently unavailable"],
  ];

  for (const [url, text] of cases) {
    test(`${url} shows an explanation instead of nothing`, async ({ page }) => {
      const response = await page.goto(url);
      expect(response?.status()).toBeLessThan(500);
      await expect(page.getByText(text)).toBeVisible();
    });
  }
});

test("home page still renders header/nav/footer when every CMS section is empty", async ({ page }) => {
  const response = await page.goto("/ru");
  expect(response?.status()).toBeLessThan(500);

  await expect(page.locator("main")).not.toBeEmpty();
  // Nav links are the static fallback (PublicHeader falls back to a
  // hardcoded array when fetchMenu() comes back empty) — not CMS content.
  await expect(page.getByRole("navigation").getByRole("link", { name: "Новости" })).toBeVisible();
  await expect(page.getByRole("contentinfo").or(page.locator("footer"))).toBeVisible();
});

test("home page does not claim calm conditions when the CMS is unreachable", async ({ page }) => {
  // Худшая ошибка портала ЧС: выдать молчание бэкенда за подтверждённое
  // спокойствие. Раньше `fetchHome` при любом сбое возвращал пустую главную
  // со `state: "calm"`, и страница печатала зелёное «Чрезвычайных
  // предупреждений нет. Обстановка на территории республики штатная.»
  await page.goto("/ru");

  await expect(
    page.getByText("Чрезвычайных предупреждений нет"),
  ).toHaveCount(0);
  await expect(
    page.getByText("Данные об обстановке сейчас недоступны."),
  ).toBeVisible();
});

test("operational summary does not report calm conditions during a CMS outage", async ({
  page,
}) => {
  // Регрессия ровно на разобранный в аудите случай: верхний AlertBanner уже
  // учитывал недоступность, а блок «Оперативная сводка» смотрел только на
  // alerts.count и при нуле печатал «Активных предупреждений нет» — то есть
  // на одной странице соседствовали «данные недоступны» и «предупреждений
  // нет». Пустой ответ обязан объясняться состоянием данных.
  await page.goto("/ru");

  const summary = page.getByRole("region", { name: "Оперативная сводка" });
  await expect(summary).toBeVisible();
  await expect(summary).toContainText(
    "Данные об обстановке временно недоступны",
  );
  await expect(summary).not.toContainText("Активных предупреждений нет");
  await expect(summary).not.toContainText("Обстановка штатная");
  // И ни одной выдуманной цифры охвата.
  await expect(summary).not.toContainText("Регионов под наблюдением");
});
test("home keeps its fallback layout when /home is unreachable", async ({
  page,
}) => {
  // Без ответа CMS нет и блоков главной, но резервная раскладка прежняя: под
  // сводкой — только навигационные плитки «Что делать» (карта, телефоны,
  // приёмная). Секций с данными CMS нет — и пустых landmark-обёрток тоже.
  await page.goto("/ru");

  const quick = page.getByRole("region", {
    name: "Быстрые действия",
    exact: true,
  });
  await expect(quick).toBeVisible();
  await expect(quick.locator('a[href="/ru/map"]')).toBeVisible();
  await expect(quick.locator('a[href="/ru/contacts"]')).toBeVisible();

  for (const name of [
    "Официальная информация",
    "Новости",
    "Последние предупреждения",
    "Карта предупреждений",
  ]) {
    await expect(page.getByRole("region", { name, exact: true })).toHaveCount(
      0,
    );
  }
});

test("home page invents neither news nor instruction links when the CMS is unreachable", async ({ page }) => {
  // Слайдер и плитки «Что делать в ЧС» брали контент из словаря, когда CMS
  // отдавала мало данных: три выдуманные новости и шесть адресов инструкций,
  // которых в CMS нет. Ни одной ссылки на материал быть не должно.
  await page.goto("/ru");

  await expect(page.locator('a[href*="/news/"]')).toHaveCount(0);
  await expect(page.locator('a[href*="/guides/"]')).toHaveCount(0);
});

test("/ru/contacts keeps its built-in contact cards when the CMS is unreachable", async ({
  page,
}) => {
  // Телефон доверия, адрес и e-mail берутся из настроек CMS; без неё страница
  // контактов обязана остаться с встроенными, а не с пустыми карточками.
  const response = await page.goto("/ru/contacts");
  expect(response?.status()).toBe(200);

  const cards = page.getByRole("region", { name: "Экстренная помощь" });
  await expect(
    cards.getByRole("link", { name: "+992 (37) 221-59-00", exact: true }),
  ).toHaveAttribute("href", "tel:+992372215900");
  await expect(cards).toContainText("734018, г. Душанбе, ул. Лохути, 26");
  await expect(
    cards.getByRole("link", { name: "info@khf.tj", exact: true }),
  ).toHaveAttribute("href", "mailto:info@khf.tj");
});

test("site title and description fall back to the built-in ones without the CMS", async ({
  page,
}) => {
  await page.goto("/ru");

  await expect(page).toHaveTitle("КЧС и ГО Республики Таджикистан");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Комитет по чрезвычайным ситуациям и гражданской обороне при Правительстве Республики Таджикистан",
  );
});

test("a detail page shows a friendly message, not a crash, when its fetch fails", async ({ page }) => {
  const response = await page.goto("/ru/news/any-slug-at-all");
  expect(response?.status()).toBeGreaterThanOrEqual(200);

  // FetchErrorFallback, rendered inline by the page itself — NOT
  // app/[locale]/error.tsx. A throw from this page's data fetch was found
  // (during this very audit) to reach the client as a raw, unstyled
  // "Internal Server Error" under `next start`, bypassing the custom error
  // boundary entirely — the fetch failure is caught explicitly instead.
  await expect(page.getByRole("heading", { name: "Что-то пошло не так" })).toBeVisible();
  await expect(
    page.getByText("Произошла ошибка при загрузке страницы. Попробуйте обновить."),
  ).toBeVisible();
});

test("fully static pages are unaffected by a CMS outage", async ({ page }) => {
  const response = await page.goto("/ru/symbols");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: "Государственные символы Республики Таджикистан" }),
  ).toBeVisible();
});

// Заголовок и вводный текст этих разделов — из CMS-страниц, но без CMS они
// обязаны остаться целыми: встроенный текст content.ts, без ошибки и пустот.
test.describe("«About us» sections fall back to their built-in text", () => {
  const cases: Array<[url: string, heading: string, text?: string]> = [
    ["/ru/leadership", "Руководство Комитета"],
    [
      "/ru/structure",
      "Структура Комитета",
      "образуют единую государственную систему",
    ],
    [
      "/ru/symbols",
      "Государственные символы Республики Таджикистан",
      "символы суверенитета Республики Таджикистан",
    ],
    ["/en/structure", "Committee structure", "form the unified state system"],
  ];

  for (const [url, heading, text] of cases) {
    test(`${url} keeps its own heading${text ? " and intro" : ""}`, async ({
      page,
    }) => {
      const response = await page.goto(url);
      expect(response?.status()).toBe(200);

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
      if (text) {
        await expect(page.getByText(text, { exact: false })).toBeVisible();
      }
      await expect(page.locator(".article-prose-intro")).toHaveCount(0);
    });
  }
});

test("/ru/about explains a CMS outage instead of showing an empty page", async ({
  page,
}) => {
  // У «О Комитете» встроенного текста нет — как и /pages/{slug}, раздел
  // показывает FetchErrorFallback, а не 404 и не пустоту.
  const response = await page.goto("/ru/about");
  expect(response?.status()).toBeLessThan(500);

  await expect(page.getByRole("heading", { name: "Что-то пошло не так" })).toBeVisible();
});
