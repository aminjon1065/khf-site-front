import { expect, test } from "@playwright/test";

// Смоук публичной оболочки: контракт локалей и редиректов (A-3) плюс то, что
// оболочка вообще собирается — картинки, шрифты, карусель, тема и мобильное
// меню. Не функциональный набор: задача — ловить молчаливую регрессию каркаса,
// предметные проверки живут в соседних спеках.
//
// Файл сведён из двух линий работ (smoke.spec.ts + smoke.optimize.spec.ts).
// Там, где обе стороны проверяли одно и то же, оставлена более строгая версия;
// там, где случаи разные (фолбэк по Accept-Language против cookie NEXT_LOCALE),
// сохранены оба.

const localeCases = [
  { path: "/ru", lang: "ru" },
  { path: "/tj", lang: "tg" },
  { path: "/en", lang: "en" },
] as const;

// В URL таджикский — tj, в <html lang> — tg. Расхождение осознанное.
for (const localeCase of localeCases) {
  test(`${localeCase.path} responds 200 with html lang=${localeCase.lang}`, async ({
    page,
  }) => {
    const response = await page.goto(localeCase.path);

    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", localeCase.lang);
    await expect(page.locator("main#main")).toBeVisible();
  });
}

test("an unprefixed path falls back to the default locale (ru)", async ({
  browser,
}) => {
  // Язык браузера намеренно не поддерживается порталом, иначе фолбэк
  // proxy.ts по Accept-Language мог бы выбрать tj/en и тест стал бы зависеть
  // от машины.
  const context = await browser.newContext({ locale: "fr-FR" });
  const page = await context.newPage();

  await page.goto("/news");
  await expect(page).toHaveURL(/\/ru\/news$/);

  await context.close();
});

test("an unprefixed path prefers the locale cookie over the fallback", async ({
  context,
  page,
}) => {
  await context.addCookies([
    { name: "NEXT_LOCALE", value: "tj", domain: "127.0.0.1", path: "/" },
  ]);

  await page.goto("/news");

  await expect(page).toHaveURL(/\/tj\/news$/);
});

// Переключатель локали — сегментированный контрол: сам radio визуально скрыт,
// кликать нужно по подписи, как это делает пользователь.
for (const { label, locale, lang } of [
  { label: "ТҶ", locale: "tj", lang: "tg" },
  { label: "EN", locale: "en", lang: "en" },
] as const) {
  test(`the language switcher keeps the current route (${label})`, async ({
    page,
  }) => {
    await page.goto("/ru/news");

    await page
      .locator("label")
      .filter({ hasText: new RegExp(`^${label}$`) })
      .click();

    await expect(page).toHaveURL(new RegExp(`/${locale}/news$`));
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
  });
}

test("header search navigates to the localized results route", async ({
  page,
}) => {
  await page.goto("/ru");

  const search = page.locator("header form[role=search]:visible");
  await search.getByRole("searchbox").fill("лавина");
  await search.getByRole("searchbox").press("Enter");

  await expect(page).toHaveURL(
    /\/ru\/search\?q=%D0%BB%D0%B0%D0%B2%D0%B8%D0%BD%D0%B0$/,
  );
});

test("a genuinely unmatched route returns 404", async ({ page }) => {
  // Маршрутный 404 (пути нет вообще). Разбор двух разных веток not-found и
  // их гарантий — в not-found.spec.ts, здесь только статус.
  const response = await page.goto("/ru/this-route-does-not-exist-e2e");
  expect(response?.status()).toBe(404);
});

test("missing CMS detail returns the localized 404 boundary", async ({
  page,
}) => {
  await page.goto("/ru/pages/does-not-exist");

  await expect(page.getByText("404", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
    "content",
    /noindex/,
  );
});

test("shell images use successful Next.js derivatives", async ({ page }) => {
  await page.goto("/ru");

  const images = page.locator("header img:visible");
  await expect(images).toHaveCount(3);

  for (let index = 0; index < 3; index += 1) {
    const image = images.nth(index);
    await expect
      .poll(() =>
        image.evaluate((element) => {
          const imageElement = element as HTMLImageElement;

          return (
            imageElement.complete &&
            imageElement.naturalWidth > 0 &&
            new URL(imageElement.currentSrc).pathname === "/_next/image"
          );
        }),
      )
      .toBe(true);
  }
});

test("CMS images are optimized from a derivative instead of the original", async ({
  page,
}) => {
  await page.goto("/ru");

  const image = page.getByAltText(
    "Учебная новость для автоматических проверок",
  );
  await expect(image).toBeVisible();

  await expect
    .poll(() =>
      image.evaluate((element) => {
        const currentSrc = (element as HTMLImageElement).currentSrc;

        return currentSrc ? new URL(currentSrc).searchParams.get("url") : null;
      }),
    )
    .toBe(
      `http://127.0.0.1:${process.env.CMS_MOCK_PORT ?? "38848"}/storage/news-lg.jpg`,
    );
  await expect
    .poll(() =>
      image.evaluate((element) => {
        const imageElement = element as HTMLImageElement;

        return imageElement.complete && imageElement.naturalWidth > 0;
      }),
    )
    .toBe(true);
});

test("locale shell loads no more than two critical fonts", async ({ page }) => {
  const fontResponses: { ok: boolean; url: string }[] = [];
  page.on("response", (response) => {
    if (response.request().resourceType() === "font") {
      fontResponses.push({ ok: response.ok(), url: response.url() });
    }
  });

  await page.goto("/tj");
  await page.evaluate(() => document.fonts.ready);

  const uniqueFontResponses = [
    ...new Map(
      fontResponses.map((response) => [response.url, response]),
    ).values(),
  ];

  expect(uniqueFontResponses).toHaveLength(2);
  expect(uniqueFontResponses.every((response) => response.ok)).toBe(true);
});

test("hero carousel keeps only the active slide in the DOM", async ({
  page,
}) => {
  await page.goto("/ru");

  const carousel = page.locator("[aria-roledescription]").first();
  const initialTitle = await carousel.locator("article h2").textContent();

  await expect(carousel.locator("article")).toHaveCount(1);
  await carousel.getByRole("button", { name: "Следующий слайд" }).click();
  await expect(carousel.locator("article")).toHaveCount(1);
  await expect(carousel.locator("article h2")).not.toHaveText(initialTitle!);
});

test("theme toggle persists the selected theme", async ({ page }) => {
  await page.goto("/ru");

  await page.locator("header button.toplink").click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(() => localStorage.getItem("kchs-theme"))).toBe(
    "dark",
  );

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("mobile menu opens, traps background scroll, and closes with Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ru");

  const trigger = page.locator(
    'header button[aria-controls="public-mobile-menu"]',
  );
  await trigger.click();

  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveAttribute("open", "");
  expect(
    await page
      .locator("body")
      .evaluate((body) => getComputedStyle(body).overflow),
  ).toBe("hidden");

  await page.keyboard.press("Escape");

  await expect(page.getByRole("dialog")).toBeHidden();
  expect(
    await page
      .locator("body")
      .evaluate((body) => getComputedStyle(body).overflow),
  ).not.toBe("hidden");
});
