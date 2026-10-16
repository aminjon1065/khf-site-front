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
    truthfulNote: "Сохраните номер и код",
  },
  {
    locale: "tj",
    path: "/tj/contacts",
    fieldError: "Матни муроҷиат хеле кӯтоҳ аст.",
    successStrong: "Муроҷиат фиристода шуд.",
    copySentPromise: "Нусха ба почтаи зикршуда фиристода шуд",
    truthfulNote: "Рақам ва рамзро нигоҳ доред",
  },
  {
    locale: "en",
    path: "/en/contacts",
    fieldError: "The message is too short.",
    successStrong: "Appeal submitted.",
    copySentPromise: "A copy has been sent to the specified email",
    truthfulNote: "Keep the number and the code",
  },
] as const;

// Селекторы кнопки отправки сужены до #reception-form: форма приёмной —
// не единственная форма в документе: в шапке есть модальное окно поиска, а
// рядом — форма проверки статуса, у каждой своя кнопка submit.
for (const c of cases) {
  test(`422 errors on ${c.path} arrive in the chosen site language`, async ({ page }) => {
    await page.goto(c.path);

    await page.locator("#f-name").fill("Тест Тестов");
    await page.locator("#f-email").fill("valid@example.com");
    // Проходит клиентский minLength=10, но проваливает серверный порог (20).
    await page.locator("#f-text").fill("короткий текст");
    await page.locator('label:has(input[type="checkbox"])').click();
    await page.locator('#reception-form button[type="submit"]').click();

    await expect(page.locator("#err-message")).toHaveText(c.fieldError);
  });

  test(`success on ${c.path} shows a tracking number without promising an email copy`, async ({ page }) => {
    await page.goto(c.path);

    await page.locator("#f-name").fill("Тест Тестов");
    await page.locator("#f-email").fill("valid@example.com");
    await page.locator("#f-text").fill("Текст обращения достаточной длины для прохождения валидации.");
    await page.locator('label:has(input[type="checkbox"])').click();
    await page.locator('#reception-form button[type="submit"]').click();

    await expect(page.getByText(c.successStrong)).toBeVisible();
    // Номер приходит из ответа CMS, а не рисуется визуально.
    await expect(page.getByText(/КЧС-\d{4}-\d{5}/)).toBeVisible();
    // Обещания копии письма быть не должно: отправка в системе не реализована.
    await expect(page.getByText(c.copySentPromise)).toHaveCount(0);
    await expect(page.getByText(new RegExp(c.truthfulNote))).toBeVisible();
    // Код проверки — рядом с номером: без него статус не открыть.
    await expect(page.getByText("ABCD-EFGH")).toBeVisible();
  });
}

test("consent is required before submission (ru)", async ({ page }) => {
  await page.goto("/ru/contacts");

  await page.locator("#f-name").fill("Тест Тестов");
  await page.locator("#f-email").fill("valid@example.com");
  await page.locator("#f-text").fill("Текст обращения достаточной длины для прохождения валидации.");
  await page.locator('#reception-form button[type="submit"]').click();

  await expect(page.getByRole("alert").first()).toBeVisible();
});

test("a phone number is enough, and the region goes to the CMS by its code (ru)", async ({
  page,
}) => {
  await page.goto("/ru/contacts");

  await page.locator("#f-name").fill("Тест Тестов");
  // По id: «Регион» и «Телефон» — ещё и подписи в таблице управлений.
  await page.locator("#f-phone").fill("+992 93 123 45 67");
  await page.locator("#f-region").selectOption({ label: "Хатлонская область" });
  await page.locator("#f-text").fill("Текст обращения достаточной длины для прохождения валидации.");
  await page.locator('label:has(input[type="checkbox"])').click();

  const request = page.waitForRequest(
    (r) => r.url().endsWith("/submissions") && r.method() === "POST",
  );
  await page.locator('#reception-form button[type="submit"]').click();

  expect((await request).postDataJSON()).toMatchObject({
    phone: "+992 93 123 45 67",
    email: "",
    region: "khatlon",
  });
  await expect(page.getByText("Обращение отправлено.")).toBeVisible();
});

test("without a phone and an email the form asks for one of them (tj)", async ({
  page,
}) => {
  await page.goto("/tj/contacts");

  await page.locator("#f-name").fill("Тест Тестов");
  await page.locator("#f-text").fill("Текст обращения достаточной длины для прохождения валидации.");
  await page.locator('label:has(input[type="checkbox"])').click();
  await page.locator('#reception-form button[type="submit"]').click();

  await expect(page.locator("#err-phone")).toHaveText(
    "Телефон ё почтаи электрониро нишон диҳед.",
  );
  // Курсор — у первого поля, где нужно исправить.
  await expect(page.locator("#f-phone")).toBeFocused();
});

test("the status of an appeal opens by its number and check code (ru)", async ({ page }) => {
  await page.goto("/ru/contacts");

  // As a citizen types it: without the prefix, lower case, no dash.
  await page.locator("#s-number").fill("2026 42");
  await page.locator("#s-code").fill("abcd efgh");
  await page.getByRole("button", { name: "Проверить", exact: true }).click();

  const result = page.getByRole("status").filter({ hasText: "КЧС-2026-00042" });
  await expect(result).toContainText("Статус: На рассмотрении");
  await expect(result).toContainText("Обращение рассматривают.");
  await expect(result).toBeFocused();
});

test("a wrong check code does not open the status (tj)", async ({ page }) => {
  await page.goto("/tj/contacts");

  await page.locator("#s-number").fill("КЧС-2026-00042");
  await page.locator("#s-code").fill("AAAA-AAAA");
  await page.getByRole("button", { name: "Санҷидан", exact: true }).click();

  await expect(page.locator("#status").getByRole("alert")).toHaveText(
    "Муроҷиат ёфт нашуд. Рақам ва рамзи санҷишро тафтиш кунед.",
  );
});
