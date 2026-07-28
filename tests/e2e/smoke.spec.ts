import { expect, test } from "@playwright/test";

const localeCases = [
  { path: "/ru", lang: "ru" },
  { path: "/tj", lang: "tg" },
  { path: "/en", lang: "en" },
] as const;

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

for (const localeCase of localeCases) {
  test(`${localeCase.path} renders with html lang=${localeCase.lang}`, async ({
    page,
  }) => {
    const response = await page.goto(localeCase.path);

    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", localeCase.lang);
    await expect(page.locator("main#main")).toBeVisible();
  });
}

test("unlocalized paths redirect using the locale cookie", async ({
  context,
  page,
}) => {
  await context.addCookies([
    {
      name: "NEXT_LOCALE",
      value: "tj",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);

  await page.goto("/news");

  await expect(page).toHaveURL(/\/tj\/news$/);
});

test("language switch keeps the current route", async ({ page }) => {
  await page.goto("/ru/news");

  await page.locator("label").filter({ hasText: /^EN$/ }).click();

  await expect(page).toHaveURL(/\/en\/news$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
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
