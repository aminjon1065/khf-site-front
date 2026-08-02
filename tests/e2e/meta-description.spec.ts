import { expect, test } from "@playwright/test";

// Описание страницы — это то, что видит человек в выдаче поисковика. Двенадцать
// из пятнадцати публичных страниц его не имели вовсе: `buildMetadata`
// вызывался без `description`, и никто этого не замечал, потому что Lighthouse
// гонялся только по трём контрольным адресам.
//
// Тексты берутся из уже переведённого содержимого самих страниц (лид,
// подзаголовок), поэтому проверка сравнивает не с эталоном, а с фактом: есть
// непустое описание разумной длины.
const INDEXABLE = [
  "/ru",
  "/ru/news",
  "/ru/projects",
  "/ru/documents",
  "/ru/guides",
  "/ru/announcements",
  "/ru/contacts",
  "/ru/map",
  "/ru/sos",
  "/ru/structure",
  "/ru/symbols",
  "/ru/sitemap",
];

// Страницы без описания — с причиной, а не по умолчанию:
//   /ru/search    — noindex (результаты поиска не индексируются);
//   /ru/alerts, /ru/leadership — для них нет переведённого текста, из которого
//   можно взять описание, а сочинять его на трёх языках должен редактор, а не
//   разработчик. Записано долгом в PROGRESS.md.
const KNOWN_WITHOUT = ["/ru/alerts", "/ru/leadership"];

for (const route of INDEXABLE) {
  test(`${route} отдаёт непустое описание для выдачи`, async ({ request }) => {
    const html = await (await request.get(route)).text();
    const match = html.match(
      /<meta name="description" content="([^"]*)"/,
    );

    expect(match, `на ${route} нет meta description`).toBeTruthy();

    const description = match![1].trim();

    expect(description.length).toBeGreaterThan(20);
    // 160 символов плюс многоточие от обрезки по границе слова.
    expect(description.length).toBeLessThanOrEqual(161);
  });
}

test("страница поиска не индексируется, поэтому описание ей не нужно", async ({
  request,
}) => {
  const html = await (await request.get("/ru/search")).text();

  expect(html).toMatch(/name="robots"[^>]*noindex/);
});

for (const route of KNOWN_WITHOUT) {
  test(`${route} — известный долг по описанию, а не забытая страница`, async ({
    request,
  }) => {
    const html = await (await request.get(route)).text();

    // Тест намеренно фиксирует текущее состояние: когда редактор напишет текст
    // и его подставят, тест упадёт — и его перенесут в список выше.
    expect(html).not.toContain('<meta name="description"');
    expect(html).not.toMatch(/name="robots"[^>]*noindex/);
  });
}
