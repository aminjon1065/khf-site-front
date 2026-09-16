import { test, expect } from "@playwright/test";

// «Поделиться» должно именно делиться.
//
// Обе кнопки портала (статья и предупреждение) раньше просто клали адрес в
// буфер обмена и писали «скопировано» — подпись обещала одно, кнопка делала
// другое. Теперь открывается системное окно выбора (Web Share), а копирование
// остаётся запасным путём там, где Web Share недоступен.
//
// Headless-Chromium не реализует navigator.share, поэтому обе ветки
// проверяются подстановкой: сначала со «своим» share, потом без него.

async function firstArticlePath(page: import("@playwright/test").Page) {
  await page.goto("/ru/news");
  const href = await page
    .locator('a[href^="/ru/news/"]')
    .first()
    .getAttribute("href");
  if (!href) throw new Error("no article link on /ru/news");
  return href;
}

test("статья: кнопка открывает системное окно «Поделиться», а не копирует", async ({
  page,
}) => {
  const path = await firstArticlePath(page);

  // Подставляем navigator.share ДО загрузки страницы: компонент читает его в
  // момент нажатия, но init-скрипт гарантирует наличие с первого рендера.
  await page.addInitScript(() => {
    (window as unknown as { __shared: unknown[] }).__shared = [];
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: (data: unknown) => {
        (window as unknown as { __shared: unknown[] }).__shared.push(data);
        return Promise.resolve();
      },
    });
  });

  await page.goto(path);
  await page.getByRole("button", { name: "Поделиться" }).click();

  const shared = await page.evaluate(
    () => (window as unknown as { __shared: { title?: string; url?: string }[] }).__shared,
  );

  expect(shared).toHaveLength(1);
  // Заголовок материала, а не «document.title» с суффиксом сайта.
  expect(shared[0].title).toBeTruthy();
  expect(shared[0].url).toContain("/ru/news/");
  // Подтверждения копирования быть не должно: мы поделились, а не скопировали.
  await expect(page.getByRole("button", { name: "Скопировано" })).toHaveCount(0);
});

test("статья: без Web Share остаётся копирование со своим подтверждением", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const path = await firstArticlePath(page);

  await page.addInitScript(() => {
    // Явно убираем API: в одних сборках Chromium его нет, в других есть.
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
  });

  await page.goto(path);
  await page.getByRole("button", { name: "Поделиться" }).click();

  await expect(page.getByRole("button", { name: "Скопировано" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "/ru/news/",
  );
});

test("отмена системного окна не выдаётся за успешное действие", async ({
  page,
}) => {
  const path = await firstArticlePath(page);

  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: () => Promise.reject(new DOMException("cancelled", "AbortError")),
    });
  });

  await page.goto(path);
  await page.getByRole("button", { name: "Поделиться" }).click();

  // Ни «скопировано», ни любого другого подтверждения: человек передумал.
  await expect(page.getByRole("button", { name: "Скопировано" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Поделиться" })).toBeVisible();
});
