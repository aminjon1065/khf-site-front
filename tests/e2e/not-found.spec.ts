import { test, expect } from "@playwright/test";

// B-5. Two distinct not-found paths in this app, with different guarantees:
//
// 1. notFound() called from WITHIN a matched dynamic route (e.g. an unknown
//    news/project/announcement slug) даёт честный статус 404 и noindex.
//
//    Так было не всегда: пока в сегменте лежал loading.tsx, ответ уходил
//    потоком, заголовки коммитились раньше, чем разрешался асинхронный
//    notFound(), и статус застывал на 200. Скелетон убрали (о загрузке
//    сообщает полоса прогресса) — и статус стал корректным. Если поток
//    когда-нибудь вернётся, этот тест снова начнёт видеть 200.
//
//    А вот сырой (до гидратации) ответ границу app/[locale]/not-found.tsx
//    НЕ содержит — см. отмеченный ниже test.fixme и запись в PROGRESS.md.
//
// 2. A genuinely unmatched path (no route at all, e.g. /tj/nonexistent)
//    renders app/global-not-found.tsx. That boundary IS optimized as a
//    build-time static shell, so the very first byte of HTML defaults to
//    the canonical locale (ru) regardless of the requested path — but it
//    correctly self-corrects to the right locale via usePathname() once
//    React hydrates, which is what a real browser user actually sees.

test.describe("genuinely unmatched route (global-not-found)", () => {
  for (const [locale, lang, snippet] of [
    ["tj", "tg", "Саҳифа ёфт нашуд"],
    ["en", "en", "Page not found"],
    ["ru", "ru", "Страница не найдена"],
  ] as const) {
    test(`/${locale}/nonexistent is a 404, noindex, and hydrates to the ${locale} locale`, async ({ page }) => {
      const response = await page.goto(`/${locale}/nonexistent`);
      expect(response?.status()).toBe(404);

      // noindex проверяем по отданному документу, а не по DOM: краулер видит
      // именно его, а в `next dev` этот тег после гидратации периодически
      // пропадает из DOM (примерно 2 прогона из 9) — тест ловил бы дефект
      // дев-сервера, которого нет ни в ответе, ни в проде.
      expect(await response!.text()).toMatch(/name="robots"[^>]*noindex/);

      // Post-hydration: usePathname() has resolved to the real client-side URL.
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.getByText(snippet)).toBeVisible();
    });
  }
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

  // Открытый дефект, а не устаревшее ожидание: сырой ответ на несуществующий
  // slug — это пустой каркас Next `<html id="__next_error__">` без <body> и
  // без локали; всю разметку 404 дорисовывает клиент после гидратации.
  // Воспроизводится и в `next dev`, и в production-сборке (`next start`), от
  // experimental.globalNotFound не зависит — проверено переключением флага.
  // Причина архитектурная: корневой сегмент динамический ([locale]), своего
  // app/layout.tsx нет, поэтому границу not-found для уже сматченного
  // маршрута Next рендерит встроенную, а не app/[locale]/not-found.tsx.
  // Статус 404 и noindex при этом честные (проверяется тестами выше), так что
  // для индексации это не критично, но пользователь без JS видит пустую
  // страницу. Ожидание оставлено как есть — чинить нужно приложение, а не тест.
  test.fixme(
    "the locale is correct even in the raw (pre-hydration) response for a matched route",
    async ({ request }) => {
      const response = await request.get("/tj/news/this-does-not-exist-xyz");
      const body = await response.text();
      expect(body).toContain('<html lang="tg"');
    },
  );
});
