import { test, expect } from "@playwright/test";

// Электронная приёмная: поведение формы обращений против CMS-mock.
// Требования из аудита: подтверждение регистрации с номером не обещает
// отправку копии письма (отправки в системе нет), серверные ошибки валидации
// приходят на языке выбранной локали портала (tj → tg в API), а не браузера.

const cases = [
  {
    locale: "ru",
    path: "/ru/contacts",
    fieldError: "Слишком короткий текст обращения.",
    successStrong: "Обращение отправлено.",
    copySentPromise: "Копия направлена на указанную почту",
    truthfulNote: "Сохраните номер",
  },
  {
    locale: "tj",
    path: "/tj/contacts",
    fieldError: "Матни муроҷиат хеле кӯтоҳ аст.",
    successStrong: "Муроҷиат фиристода шуд.",
    copySentPromise: "Нусха ба почтаи зикршуда фиристода шуд",
    truthfulNote: "Рақамро нигоҳ доред",
  },
  {
    locale: "en",
    path: "/en/contacts",
    fieldError: "The message is too short.",
    successStrong: "Appeal submitted.",
    copySentPromise: "A copy has been sent to the specified email",
    truthfulNote: "Keep this number",
  },
] as const;

for (const c of cases) {
  test(`422 errors on ${c.path} arrive in the chosen site language`, async ({ page }) => {
    await page.goto(c.path);

    await page.locator("#f-name").fill("Тест Тестов");
    await page.locator("#f-email").fill("valid@example.com");
    // Проходит клиентский minLength=10, но проваливает серверный порог (20).
    await page.locator("#f-text").fill("короткий текст");
    await page.locator('label:has(input[type="checkbox"])').click();
    await page.locator('form button[type="submit"]').click();

    await expect(page.locator("#err-message")).toHaveText(c.fieldError);
  });

  test(`success on ${c.path} shows a tracking number without promising an email copy`, async ({ page }) => {
    await page.goto(c.path);

    await page.locator("#f-name").fill("Тест Тестов");
    await page.locator("#f-email").fill("valid@example.com");
    await page.locator("#f-text").fill("Текст обращения достаточной длины для прохождения валидации.");
    await page.locator('label:has(input[type="checkbox"])').click();
    await page.locator('form button[type="submit"]').click();

    await expect(page.getByText(c.successStrong)).toBeVisible();
    // Номер приходит из ответа CMS, а не рисуется визуально.
    await expect(page.getByText(/КЧС-\d{4}-\d{5}/)).toBeVisible();
    // Обещания копии письма быть не должно: отправка в системе не реализована.
    await expect(page.getByText(c.copySentPromise)).toHaveCount(0);
    await expect(page.getByText(new RegExp(c.truthfulNote))).toBeVisible();
  });
}

test("consent is required before submission (ru)", async ({ page }) => {
  await page.goto("/ru/contacts");

  await page.locator("#f-name").fill("Тест Тестов");
  await page.locator("#f-email").fill("valid@example.com");
  await page.locator("#f-text").fill("Текст обращения достаточной длины для прохождения валидации.");
  await page.locator('form button[type="submit"]').click();

  await expect(page.getByRole("alert").first()).toBeVisible();
});
