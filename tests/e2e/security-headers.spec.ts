import { expect, test, type APIRequestContext } from "@playwright/test";

const SECURITY_HEADERS = [
  "content-security-policy",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
  "cross-origin-opener-policy",
] as const;

test("public pages expose the security header contract", async ({
  request,
}) => {
  const response = await request.get("/ru");

  expect(response.headers()["content-security-policy"]).toContain(
    "default-src 'self'",
  );
  expect(response.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["referrer-policy"]).toBe(
    "strict-origin-when-cross-origin",
  );
  expect(response.headers()["permissions-policy"]).toContain("camera=()");
  expect(response.headers()["cross-origin-opener-policy"]).toBe("same-origin");
});

// Заголовки задаются правилом `source: "/:path*"`, но правило — это намерение,
// а не доказательство: ответы 404, статика и служебные файлы проходят другими
// путями Next и легко выпадают из-под общего правила при любой правке.
test("контракт распространяется на 404, служебные файлы и статику, а не только на страницы", async ({
  request,
}) => {
  const paths = ["/ru/nonexistent-xyz", "/robots.txt", "/sitemap.xml"];

  for (const path of paths) {
    const headers = (await request.get(path)).headers();
    for (const header of SECURITY_HEADERS) {
      expect(headers[header], `${path} → ${header}`).toBeTruthy();
    }
  }
});

async function firstStaticAsset(
  request: APIRequestContext,
  extension: "js" | "css",
): Promise<string> {
  const html = await (await request.get("/ru")).text();
  const match = html.match(
    new RegExp(`/_next/static/[\\w/.-]+\\.${extension}`),
  );
  expect(match, `в разметке нет ссылки на .${extension}`).toBeTruthy();
  return match![0];
}

test("хешированная статика отдаётся сжатой и с immutable-кэшем", async ({
  request,
}) => {
  for (const extension of ["js", "css"] as const) {
    const path = await firstStaticAsset(request, extension);
    const response = await request.get(path, {
      headers: { "accept-encoding": "gzip" },
    });
    const headers = response.headers();

    expect(headers["cache-control"], path).toContain("immutable");
    expect(headers["cache-control"], path).toContain("max-age=31536000");
    expect(headers["content-encoding"], path).toBe("gzip");
  }
});

test("HTML сжимается, и сжатие не зависит от порядка в Accept-Encoding", async ({
  request,
}) => {
  for (const encoding of ["gzip", "br, gzip", "gzip, deflate"]) {
    const response = await request.get("/ru", {
      headers: { "accept-encoding": encoding },
    });

    expect(response.headers()["content-encoding"], encoding).toBe("gzip");
    // Без Vary промежуточный кэш может отдать сжатый ответ клиенту, который
    // сжатия не просил.
    expect(response.headers()["vary"], encoding).toContain("Accept-Encoding");
  }
});
