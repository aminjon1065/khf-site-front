import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildRevalidationTags,
  type CmsRevalidationPayload,
} from "@/lib/cache-tags";

const revalidateTagMock = vi.fn();
vi.mock("next/cache", () => ({
  revalidateTag: (...args: unknown[]) => revalidateTagMock(...args),
}));

import { POST } from "@/app/api/revalidate/route";

// Сведено из двух линий работ (revalidate-route.test.ts + .optimize.test.ts).
// Проверки авторизации взяты из первой (там разобраны все три случая, включая
// токен другой длины), контрактные — из второй (422 и запрет на сплошной тег
// `cms`). Локалей в payload две: односложный случай не поймал бы потерю
// второй локали.
//
// Гранулярный контракт вебхука (O-009): CMS присылает тип, id, slug, локали,
// событие и готовый список тегов — не единственный `{"tag":"cms"}`, как раньше.
const PAYLOAD: CmsRevalidationPayload = {
  type: "news",
  id: 42,
  slug: "storm",
  locales: ["ru", "tj"],
  event: "published",
  tags: buildRevalidationTags("news", "storm", ["ru", "tj"]),
};

function request(authorization?: string, body: unknown = PAYLOAD): Request {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (authorization !== undefined) {
    headers.authorization = authorization;
  }
  return new Request("http://localhost/api/revalidate", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    revalidateTagMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 503 and does not revalidate when REVALIDATION_SECRET is not configured", async () => {
    vi.stubEnv("REVALIDATION_SECRET", "");

    const res = await POST(request("Bearer anything"));

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ revalidated: false, error: "revalidation_not_configured" });
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it("returns 401 and does not revalidate when the Bearer token is missing", async () => {
    vi.stubEnv("REVALIDATION_SECRET", "top-secret");

    const res = await POST(request());

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ revalidated: false, error: "unauthorized" });
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it("returns 401 and does not revalidate when the Bearer token is wrong", async () => {
    vi.stubEnv("REVALIDATION_SECRET", "top-secret");

    const res = await POST(request("Bearer wrong-secret"));

    expect(res.status).toBe(401);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it("returns 401 for a token of a different length than the configured secret", async () => {
    // Regression guard for the constant-time comparison: timingSafeEqual
    // throws on mismatched buffer lengths if not guarded, which would leak
    // a 500 instead of a clean 401.
    vi.stubEnv("REVALIDATION_SECRET", "top-secret");

    const res = await POST(request("Bearer short"));

    expect(res.status).toBe(401);
  });

  it("revalidates the payload tags immediately (not stale-while-revalidate)", async () => {
    // E-4: a webhook from the CMS needs the very next visit to see fresh
    // content, not the old cached page — { expire: 0 }, not "max".
    vi.stubEnv("REVALIDATION_SECRET", "top-secret");

    const res = await POST(request("Bearer top-secret"));

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      revalidated: true,
      tags: PAYLOAD.tags,
    });
    // Сравнение всего списка вызовов, а не each-проверка: так видно и лишний
    // вызов, которого в payload не было.
    expect(revalidateTagMock.mock.calls).toEqual(
      PAYLOAD.tags.map((tag) => [tag, { expire: 0 }]),
    );
    // Сплошной тег `cms` — это ровно то, от чего уходили в O-009: он
    // регенерирует весь сайт на любую правку.
    expect(revalidateTagMock).not.toHaveBeenCalledWith("cms", { expire: 0 });
  });

  it("returns 422 and does not revalidate when tags contradict the payload metadata", async () => {
    // Иначе вебхук стал бы способом сбросить произвольный тег по чужому
    // списку: теги должны выводиться из type/slug/locales, а не приниматься
    // на веру.
    vi.stubEnv("REVALIDATION_SECRET", "top-secret");

    const res = await POST(
      request("Bearer top-secret", { ...PAYLOAD, tags: ["cms:shell:ru"] }),
    );

    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({
      revalidated: false,
      error: "invalid_contract",
    });
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });
});
