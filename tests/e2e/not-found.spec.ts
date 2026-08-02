import { test, expect } from "@playwright/test";

// B-5. Two distinct not-found paths in this app, with different guarantees:
//
// 1. A genuinely unmatched path (no route at all, e.g. /tj/nonexistent)
//    renders app/global-not-found.tsx. Она серверная и берёт язык из
//    заголовка `x-kchs-pathname`, который выставляет proxy.ts, поэтому
//    локализована уже в исходном HTML — до всякой гидратации. Проверяется
//    именно ответ, а не DOM: то же самое видят краулер и читатель без JS.
//
// 2. notFound() called from WITHIN a matched dynamic route (e.g. an unknown
//    news/project/announcement slug) даёт честный статус 404 и noindex, а
//    локализованную страницу дорисовывает клиент после гидратации.
//
//    Честный статус был не всегда: пока в сегменте лежал loading.tsx, ответ
//    уходил потоком, заголовки коммитились раньше, чем разрешался асинхронный
//    notFound(), и статус застывал на 200. Скелетон убрали (о загрузке
//    сообщает полоса прогресса) — и статус стал корректным. Если поток
//    когда-нибудь вернётся, этот тест снова начнёт видеть 200.
//
//    А вот сырой (до гидратации) ответ разметки 404 НЕ содержит — см.
//    отмеченный ниже test.fixme и запись в PROGRESS.md.

test.describe("genuinely unmatched route (global-not-found)", () => {
  for (const [locale, lang, snippet] of [
    ["tj", "tg", "Саҳифа ёфт нашуд"],
    ["en", "en", "Page not found"],
    ["ru", "ru", "Страница не найдена"],
  ] as const) {
    test(`/${locale}/nonexistent — 404, noindex и ${locale}-локаль в самом ответе`, async ({
      page,
    }) => {
      const response = await page.goto(`/${locale}/nonexistent`);
      expect(response?.status()).toBe(404);

      // noindex и язык проверяем по отданному документу, а не по DOM: краулер
      // видит именно его, а в `next dev` тег robots после гидратации
      // периодически пропадает из DOM (примерно 2 прогона из 9) — тест ловил
      // бы дефект дев-сервера, которого нет ни в ответе, ни в проде.
      const body = await response!.text();
      expect(body).toMatch(/name="robots"[^>]*noindex/);
      expect(body).toContain(`<html lang="${lang}"`);
      expect(body).toContain(snippet);

      // И то же самое после гидратации — клиент не должен «поправить» язык
      // на другой.
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.getByText(snippet)).toBeVisible();
    });
  }

  test("вложенный несуществующий путь тоже локализован в ответе", async ({
    request,
  }) => {
    const response = await request.get("/tj/deep/unknown/path");
    expect(response.status()).toBe(404);
    expect(await response.text()).toContain('<html lang="tg"');
  });
});

test.describe("unknown slug on a matched dynamic route", () => {
  for (const path of [
    "/ru/projects/this-does-not-exist-xyz",
    "/ru/announcements/this-does-not-exist-xyz",
    "/tj/news/this-does-not-exist-xyz",
  ]) {
    test(`${path} does not 500 and shows the not-found UI`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);

      expect(await response!.text()).toMatch(/name="robots"[^>]*noindex/);
    });
  }

  test("после гидратации это локализованная страница портала, а не английская заглушка Next", async ({
    page,
  }) => {
    await page.goto("/tj/news/this-does-not-exist-xyz");

    await expect(page.locator("html")).toHaveAttribute("lang", "tg");
    await expect(page.getByText("Саҳифа ёфт нашуд")).toBeVisible();
    await expect(page.getByText("This page could not be found")).toHaveCount(0);
  });

  // Открытый дефект, а не устаревшее ожидание: сырой ответ на несуществующий
  // slug — это каркас Next `<html id="__next_error__">` без разметки 404; всю
  // страницу дорисовывает клиент после гидратации. Пользователь без JS видит
  // пустую страницу (статус 404 и noindex при этом честные — см. тесты выше).
  //
  // Причина не в структуре приложения, а в самом Next 16, и она измерена, а не
  // предположена: при динамическом рендере ветка notFound() всегда уходит в
  // `getErrorRSCPayload` (node_modules/next/dist/esm/server/app-render/
  // app-render.js, вызов около строки 1944), который отдаёт именно этот
  // каркас; поиск подходящей not-found-границы
  // (`findPrerenderHTTPErrorBoundaryTree`) есть только на ветке пререндера и
  // включается лишь при `experimental.cacheComponents`. Проверено шестью
  // сборками: вложенный not-found.tsx в сегменте, корневой app/not-found.tsx,
  // выключенный globalNotFound, layout без собственного notFound() —
  // результат одинаковый. Включать cacheComponents ради этого нельзя: он
  // меняет семантику кэширования всего приложения (fetch перестаёт
  // кэшироваться по умолчанию), а на ней держатся ISR и revalidateTag.
  test.fixme(
    "the locale is correct even in the raw (pre-hydration) response for a matched route",
    async ({ request }) => {
      const response = await request.get("/tj/news/this-does-not-exist-xyz");
      const body = await response.text();
      expect(body).toContain('<html lang="tg"');
    },
  );
});
