import { createServer } from "node:http";
import { readFileSync } from "node:fs";

const host = process.env.CMS_MOCK_HOST ?? "127.0.0.1";
const port = Number(process.env.CMS_MOCK_PORT ?? 38848);
const derivativeUrl = `http://${host}:${port}/storage/news-lg.jpg`;
const derivativeImage = readFileSync(
  new URL("../../public/assets/president.jpg", import.meta.url),
);

const newsItem = {
  slug: "test-news",
  title: "Учебная новость для автоматических проверок",
  excerpt: "Стабильный материал из изолированного CMS mock.",
  body: "Первый абзац тестовой новости.\n\nВторой абзац тестовой новости.",
  category: "Новости",
  date: "27.07.2026",
  datetime: "2026-07-27T12:00:00+05:00",
  image: null,
  image_srcset: null,
  image_data: {
    version: 2,
    id: 1,
    uuid: "00000000-0000-4000-8000-000000000001",
    alt: "Учебная новость для автоматических проверок",
    caption: null,
    width: 1800,
    height: 1200,
    aspect_ratio: 1.5,
    bytes: 320000,
    mime_type: "image/jpeg",
    checksum: "a".repeat(64),
    focal_point: { x: 0.5, y: 0.4 },
    status: "ready",
    placeholder: null,
    sources: {
      avif: [],
      webp: [],
      fallback: [
        { url: derivativeUrl, width: 1600, height: 1067, bytes: 120000 },
      ],
    },
  },
  views: 1,
  seo: {
    title: "Учебная новость",
    description: "Материал для smoke и Lighthouse CI.",
  },
};
// Рубрика второй новости совпадает со slug'ом из CategorySeeder — на неё
// опирается news-category-filter.spec.ts. Заголовок намеренно не содержит
// слова «автоматических», иначе поиск в server-filters.spec.ts нашёл бы две
// записи вместо одной.
const cooperationNewsItem = {
  ...newsItem,
  slug: "test-cooperation",
  title: "Совместная программа с партнёрами по региону",
  excerpt: "Вторая запись изолированного CMS mock — рубрика «Сотрудничество».",
  body: "Абзац о совместной программе.",
  category: "Сотрудничество",
  seo: {
    title: "Совместная программа",
    description: "Материал для проверки серверного фильтра рубрик.",
  },
};

// Внутреннее поле стенда: в публичном DTO новости отдают только человекочитаемую
// `category`, а фильтрация идёт по slug'у — как в CMS, где `?category=` бьётся
// по таблице категорий, а не по подписи карточки.
const newsCategorySlugs = new Map([
  [newsItem.slug, "spasatelnye-operatsii"],
  [cooperationNewsItem.slug, "sotrudnichestvo"],
]);
const allNewsItems = [newsItem, cooperationNewsItem];

// Совпадает с CategorySeeder: чипы фильтра на /news строятся из этого списка.
const categories = [
  { slug: "spasatelnye-operatsii", name: "Спасательные операции", type: "news" },
  { slug: "grazhdanskaya-oborona", name: "Гражданская оборона", type: "news" },
  { slug: "sotrudnichestvo", name: "Сотрудничество", type: "news" },
  { slug: "obuchenie", name: "Обучение", type: "news" },
  { slug: "tehnika", name: "Техника", type: "news" },
  { slug: "otchyoty", name: "Отчёты", type: "news" },
];

const linkedNewsSlugs = new Set([
  "almaty-forum",
  "alpinists-rescue",
  "civil-defense-month",
  "gbao-training",
  "new-equipment",
  "undrr-programme",
  "zamin-2026",
]);
const announcements = [
  {
    slug: "vacancy-test",
    kind: "vacancy",
    kind_label: "Вакансия",
    title: "Тестовая вакансия",
    org: "КЧС",
    desc: "Описание вакансии",
    deadline: "бессрочно",
    deadline_at: null,
    deadline_state: "unlimited",
    open: true,
    application_url: null,
  },
  {
    slug: "tender-test",
    kind: "tender",
    kind_label: "Тендер",
    title: "Тестовый тендер",
    org: "КЧС",
    desc: "Описание тендера",
    deadline: "до 31.12.2026",
    deadline_at: "2026-12-31",
    deadline_state: "open",
    open: true,
    application_url: null,
  },
];
const documents = [
  {
    id: 1,
    type: "Закон",
    type_value: "law",
    title: "Закон № 123",
    number: "123",
    section: null,
    date: "01.01.2026",
    date_iso: "2026-01-01",
    lang: "РУ",
    size: null,
    href: null,
    files: [],
  },
  {
    id: 2,
    type: "Отчёт",
    type_value: "report",
    title: "Годовой отчёт",
    number: "A-42",
    section: null,
    date: "02.01.2026",
    date_iso: "2026-01-02",
    lang: "РУ",
    size: null,
    href: null,
    files: [],
  },
];
const region = {
  key: "dushanbe",
  name: "Душанбе",
  level: "warning",
  count: 1,
  statusText: "Предупреждение",
};
const alertItem = {
  slug: "test-alert",
  level: "warning",
  level_label: "Предупреждение",
  severity: "Средняя",
  status: "Активно",
  status_code: "active",
  is_active: true,
  hazard: "weather",
  hazard_label: "Непогода",
  title: "Тестовое предупреждение",
  summary: "Стабильное предупреждение из изолированного CMS mock.",
  region: "Душанбе",
  region_codes: ["dushanbe"],
  datetime: "27.07.2026 12:00",
  starts_at: "27.07.2026 12:00",
  ends_at: null,
  published_at: "27.07.2026 12:00",
  starts_at_iso: "2026-07-27T12:00:00+05:00",
  ends_at_iso: null,
  body: "Официальное описание тестового предупреждения.",
  instructions: ["Следите за официальными сообщениями."],
  contacts: "112",
  source: "КЧС",
  territory_type: "regions",
  regions: [{ code: "dushanbe", name: "Душанбе" }],
  meta: [{ label: "Период", value: "27 июля" }],
};
const settings = {
  org: {
    name: "Комитет по чрезвычайным ситуациям и гражданской обороне",
    short_name: "КЧС",
    about: "Официальный сайт Комитета.",
    address: "Душанбе, Таджикистан",
    email: "info@example.test",
    emergency_number: "112",
    trust_phone: "+992 00 000 00 00",
  },
  contacts: {
    press_email: "press@example.test",
    press_phone: "+992 00 000 00 01",
    duty_phone: "112",
  },
  social: {},
  emergency_services: [{ num: "112", label: "Единая служба" }],
  // Значения плашек на /structure берутся из настроек — совпадают с SettingSeeder.
  structure: { founded_year: "1994", units_count: "68" },
  copyright: "КЧС",
  seo: {
    meta_title: "КЧС Таджикистана",
    meta_description: "Официальный сайт.",
  },
};
// Ростер повторяет LeaderSeeder (один председатель + три заместителя):
// leadership.spec.ts проверяет разметку «герой + сетка», а она различается
// только при наличии обеих групп. Фотографий нет намеренно — так же, как в
// сидере, чтобы отрабатывал фолбэк ImageSlot на логотип комитета.
const leadership = [
  {
    id: 1,
    role: "Председатель Комитета",
    name: "Рустам Назарзода",
    meta: "Генерал-лейтенант · руководит Комитетом с 2016 года",
    bio: "Осуществляет общее руководство Комитетом, координацию сил и средств единой государственной системы предупреждения и ликвидации чрезвычайных ситуаций, представляет Комитет в Правительстве Республики Таджикистан и международных организациях.",
    is_chairman: true,
    photo_url: null,
  },
  {
    id: 2,
    role: "Первый заместитель председателя",
    name: "Первый заместитель",
    meta: null,
    bio: "Оперативное реагирование, Центр управления в кризисных ситуациях и служба спасения 112.",
    is_chairman: false,
    photo_url: null,
  },
  {
    id: 3,
    role: "Заместитель председателя",
    name: "Заместитель по гражданской обороне",
    meta: null,
    bio: "Гражданская оборона, подготовка населения, эвакуационные мероприятия и защитные сооружения.",
    is_chairman: false,
    photo_url: null,
  },
  {
    id: 4,
    role: "Заместитель председателя",
    name: "Заместитель по предупреждению ЧС",
    meta: null,
    bio: "Прогнозирование рисков, государственный надзор и международное сотрудничество.",
    is_chairman: false,
    photo_url: null,
  },
];
// Повторяет StructureUnitSeeder: structure.spec.ts проверяет, что на странице
// оказались все шесть подразделений, а не только первое.
const structureUnits = [
  {
    num: "01",
    name: "Центр управления в кризисных ситуациях",
    desc: "Круглосуточный мониторинг обстановки, приём вызовов 112, координация реагирования",
  },
  {
    num: "02",
    name: "Служба спасения",
    desc: "Аэромобильный отряд, кинологические расчёты, водолазная и горная службы",
  },
  {
    num: "03",
    name: "Управление гражданской обороны",
    desc: "Планы ГО, эвакуационные мероприятия, защитные сооружения",
  },
  {
    num: "04",
    name: "Управление предупреждения ЧС",
    desc: "Прогнозирование рисков, селе- и лавиноопасные участки, надзор",
  },
  {
    num: "05",
    name: "Учебный центр",
    desc: "Подготовка спасателей и обучение населения действиям при ЧС",
  },
  {
    num: "06",
    name: "Управление международного сотрудничества",
    desc: "Программы с УСРБ ООН, ИНСАРАГ, партнёрами по региону",
  },
];

const emptyPagination = {
  total: 0,
  per_page: 20,
  current_page: 1,
  last_page: 1,
};

function json(response, body, status = 200) {
  response.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

const server = createServer((request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Headers": "content-type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Origin": "*",
    });
    response.end();
    return;
  }

  const requestUrl = new URL(request.url ?? "/", `http://${host}:${port}`);
  const path = requestUrl.pathname.replace(/^\/api\/v1/, "");

  if (request.method === "POST" && path === "/vitals") {
    json(response, { accepted: true }, 202);
    return;
  }

  if (request.method !== "GET") {
    json(response, { message: "Method not allowed" }, 405);
    return;
  }

  if (path === "/storage/news-lg.jpg") {
    response.writeHead(200, {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": derivativeImage.length,
      "Content-Type": "image/jpeg",
    });
    response.end(derivativeImage);
    return;
  }

  if (path === "/ready") {
    json(response, {
      status: "ready",
      checks: {
        database: true,
        storage: true,
        scheduler: true,
        queue_connection: "sync",
      },
      scheduler_last_run: "2026-07-27T12:00:00+05:00",
      timestamp: "2026-07-27T12:00:00+05:00",
    });
    return;
  }

  if (path === "/health") {
    json(response, {
      status: "ok",
      service: "khf-cms-api-test",
      version: "v1",
      checks: { database: true },
      timestamp: "2026-07-27T12:00:00+05:00",
    });
    return;
  }

  if (path === "/home") {
    json(response, {
      data: {
        blocks: [
          { type: "latest_news", title: "Новости", config: { limit: 5 } },
          { type: "regions_map", title: "Обстановка", config: {} },
          { type: "active_alerts", title: "Предупреждения", config: {} },
        ],
        alerts: {
          state: "warning",
          count: 1,
          regions: [region],
          items: [alertItem],
        },
        news: [newsItem],
        instructions: [],
        documents: [],
        announcements: [],
        projects: [],
        emergency_contacts: {},
      },
    });
    return;
  }

  if (path === "/settings") {
    json(response, { data: settings });
    return;
  }

  if (path === "/menu") {
    json(response, { data: { main: [], footer: [] } });
    return;
  }

  if (path === "/news") {
    const q = requestUrl.searchParams.get("q")?.toLowerCase();
    const category = requestUrl.searchParams.get("category");
    const data = allNewsItems.filter(
      (item) =>
        (!category || newsCategorySlugs.get(item.slug) === category) &&
        (!q ||
          `${item.title} ${item.excerpt}`.toLowerCase().includes(q)),
    );
    json(response, {
      data,
      meta: { ...emptyPagination, total: data.length, last_page: 1 },
    });
    return;
  }

  const mockNewsItem = allNewsItems.find(
    (item) => path === `/news/${item.slug}`,
  );
  if (mockNewsItem) {
    json(response, { data: mockNewsItem });
    return;
  }

  const linkedNewsSlug = path.match(/^\/news\/([^/]+)$/)?.[1];
  if (linkedNewsSlug && linkedNewsSlugs.has(linkedNewsSlug)) {
    json(response, { data: { ...newsItem, slug: linkedNewsSlug } });
    return;
  }

  if (path === "/search") {
    json(response, { data: [], meta: emptyPagination });
    return;
  }

  if (path === "/categories") {
    json(response, { data: categories });
    return;
  }

  if (path === "/alerts/active") {
    json(response, {
      data: { state: "warning", count: 1, regions: [region] },
    });
    return;
  }

  if (path === "/alerts") {
    json(response, {
      data: [alertItem],
      meta: { ...emptyPagination, total: 1, last_page: 1 },
    });
    return;
  }

  if (path === `/alerts/${alertItem.slug}`) {
    json(response, { data: alertItem });
    return;
  }

  if (path === "/regions/directory") {
    json(response, { data: [] });
    return;
  }

  if (path === "/leadership") {
    json(response, {
      data: leadership,
      meta: { ...emptyPagination, total: leadership.length, last_page: 1 },
    });
    return;
  }

  if (path === "/structure") {
    json(response, {
      data: structureUnits,
      meta: { ...emptyPagination, total: structureUnits.length, last_page: 1 },
    });
    return;
  }

  if (path === "/announcements") {
    const kind = requestUrl.searchParams.get("kind");
    const data = kind
      ? announcements.filter((announcement) => announcement.kind === kind)
      : announcements;
    json(response, {
      data,
      meta: { ...emptyPagination, total: data.length, last_page: 1 },
    });
    return;
  }

  const announcementSlug = path.match(/^\/announcements\/([^/]+)$/)?.[1];
  const announcement = announcements.find(
    (item) => item.slug === announcementSlug,
  );
  if (announcement) {
    json(response, { data: announcement });
    return;
  }

  if (path === "/documents") {
    const type = requestUrl.searchParams.get("type");
    const q = requestUrl.searchParams.get("q")?.toLowerCase();
    const data = documents.filter(
      (document) =>
        (!type || document.type_value === type) &&
        (!q ||
          `${document.title} ${document.number ?? ""}`
            .toLowerCase()
            .includes(q)),
    );
    json(response, {
      data,
      meta: { ...emptyPagination, total: data.length, last_page: 1 },
    });
    return;
  }

  const emptyCollections = new Set([
    "/instructions",
    "/pages",
    "/projects",
    "/regions",
  ]);

  if (emptyCollections.has(path)) {
    json(response, { data: [], meta: emptyPagination });
    return;
  }

  json(response, { message: "Not found" }, 404);
});

// Node по умолчанию закрывает простаивающее keep-alive соединение через 5 с, а
// undici (fetch в Next) держит своё до 4 с и переиспользует сокет. Когда
// таймеры сходятся, запрос уходит в уже закрываемый сокет и серверный fetch
// падает с «TypeError: fetch failed» — страница при этом рендерится пустой, и
// тест падает на ровном месте. Держим соединение заведомо дольше клиента,
// чтобы первым его закрывал всегда клиент.
server.keepAliveTimeout = 65_000;
server.headersTimeout = 70_000;

server.listen(port, host, () => {
  console.log(`CMS mock ready at http://${host}:${port}/api/v1`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
