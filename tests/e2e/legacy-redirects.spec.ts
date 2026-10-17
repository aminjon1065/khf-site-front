import { test, expect } from "@playwright/test";

// Ссылки на прежние сайты (khf.tj/node/…, kchs.tj/node/… → /ru/node/…)
// живут в документах и поиске: сайт ведёт их к материалу постоянной
// переадресацией, а неизвестный старый адрес — на обычную «не найдено».

test("старый адрес khf.tj ведёт к таджикской версии материала", async ({
  request,
}) => {
  const response = await request.get("/node/6112", { maxRedirects: 0 });

  expect(response.status()).toBe(301);
  // Next отдаёт Location относительным путём.
  expect(new URL(response.headers()["location"], "http://site").pathname).toBe(
    "/tj/news/test-news",
  );
});

test("старый адрес kchs.tj, пришедший под /ru, ведёт к русской версии", async ({
  request,
}) => {
  const response = await request.get("/ru/node/4163", { maxRedirects: 0 });

  expect(response.status()).toBe(301);
  // Next отдаёт Location относительным путём.
  expect(new URL(response.headers()["location"], "http://site").pathname).toBe(
    "/ru/news/test-news",
  );
});

test("неизвестный старый адрес — обычная страница «не найдено»", async ({
  page,
}) => {
  const response = await page.goto("/ru/node/1");

  expect(response?.status()).toBe(404);
});
