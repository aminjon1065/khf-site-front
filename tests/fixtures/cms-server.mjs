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
const linkedNewsSlugs = new Set([
  "almaty-forum",
  "alpinists-rescue",
  "civil-defense-month",
  "gbao-training",
  "new-equipment",
  "undrr-programme",
  "zamin-2026",
]);

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
        blocks: [{ type: "latest_news", title: "Новости", config: { limit: 5 } }],
        alerts: { state: "calm", count: 0, regions: [], items: [] },
        news: [newsItem],
        instructions: [],
        documents: [],
        announcements: [],
        projects: [],
      },
    });
    return;
  }

  if (path === "/settings") {
    json(response, { data: null });
    return;
  }

  if (path === "/menu") {
    json(response, { data: { main: [], footer: [] } });
    return;
  }

  if (path === "/news") {
    json(response, {
      data: [newsItem],
      meta: { ...emptyPagination, total: 1, last_page: 1 },
    });
    return;
  }

  if (path === `/news/${newsItem.slug}`) {
    json(response, { data: newsItem });
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

  if (path === "/alerts/active") {
    json(response, { data: { state: "calm", count: 0, regions: [] } });
    return;
  }

  if (path === "/regions/directory") {
    json(response, { data: [] });
    return;
  }

  const emptyCollections = new Set([
    "/alerts",
    "/announcements",
    "/documents",
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

server.listen(port, host, () => {
  console.log(`CMS mock ready at http://${host}:${port}/api/v1`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
