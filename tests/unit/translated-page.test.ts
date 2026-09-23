import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchTranslatedPage } from "@/lib/api";

// Разделы /leadership, /structure и /symbols берут заголовок и текст из
// CMS-страницы, но только настоящей: опубликованной и переведённой на язык
// запроса. Во всех остальных случаях — null и встроенный текст раздела, без
// ошибки и без пустого блока.

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const page = {
  slug: "leadership",
  title: "Руководство КЧС и ГО",
  body: "<p>Вводный текст</p>",
  updated: "27 июля 2026",
  updated_at: "2026-07-27T12:00:00+05:00",
  seo: { title: "Руководство Комитета", description: "Состав руководства." },
};

/** Мок CMS по пути запроса: страница и список переведённых slug'ов. */
function cms({
  detail = () => jsonResponse({ data: page }),
  slugs = () => jsonResponse({ data: ["leadership"], meta: { total: 1 } }),
}: {
  detail?: () => Response | Promise<Response>;
  slugs?: () => Response | Promise<Response>;
} = {}) {
  return vi.fn(async (input: string) => {
    const { pathname } = new URL(input);
    if (pathname.endsWith("/slugs/pages")) {
      return slugs();
    }
    if (pathname.endsWith("/pages/leadership")) {
      return detail();
    }
    return jsonResponse({ message: "Not found" }, 404);
  });
}

describe("fetchTranslatedPage", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns a published page translated into the requested locale", async () => {
    const fetchMock = cms();
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchTranslatedPage("leadership", "tj")).resolves.toEqual(page);

    // Тот же fetchPage, что и у /pages/{slug}: локаль tj уходит в API как tg,
    // а запросы несут теги вебхука cms:pages:* — раздел обновляется вместе
    // со страницей в CMS.
    const [detailCall, slugsCall] = fetchMock.mock.calls as unknown as [
      [string, RequestInit & { next: { tags: string[] } }],
      [string, RequestInit & { next: { tags: string[] } }],
    ];
    expect(new URL(detailCall[0]).searchParams.get("locale")).toBe("tg");
    expect(detailCall[1].next.tags).toEqual([
      "cms:pages:tj",
      "cms:pages:leadership:tj",
    ]);
    expect(slugsCall[1].next.tags).toEqual(["cms:pages:tj"]);
  });

  it("is null when the CMS has no such page (404)", async () => {
    vi.stubGlobal(
      "fetch",
      cms({ detail: () => jsonResponse({ message: "Not found" }, 404) }),
    );

    await expect(fetchTranslatedPage("leadership", "ru")).resolves.toBeNull();
  });

  it("is null when the CMS answers with another locale's fallback", async () => {
    // Страница пришла, но slug'а нет в списке переводов этой локали:
    // русский текст на /en не должен выдавать себя за перевод.
    vi.stubGlobal(
      "fetch",
      cms({ slugs: () => jsonResponse({ data: ["about"], meta: { total: 1 } }) }),
    );

    await expect(fetchTranslatedPage("leadership", "en")).resolves.toBeNull();
  });

  it("is null, not an exception, when the CMS fails", async () => {
    vi.stubGlobal(
      "fetch",
      cms({ detail: () => jsonResponse({ message: "oops" }, 503) }),
    );
    await expect(fetchTranslatedPage("leadership", "ru")).resolves.toBeNull();

    vi.stubGlobal(
      "fetch",
      cms({
        detail: () => {
          throw new TypeError("fetch failed");
        },
      }),
    );
    await expect(fetchTranslatedPage("leadership", "ru")).resolves.toBeNull();
  });

  it("keeps the page when only the translation list is unavailable", async () => {
    // Та же политика, что у availableLocalesFor: молчание списка slug'ов не
    // делает опубликованную страницу непереведённой.
    vi.stubGlobal(
      "fetch",
      cms({ slugs: () => jsonResponse({ message: "oops" }, 503) }),
    );

    await expect(fetchTranslatedPage("leadership", "ru")).resolves.toEqual(page);
  });
});
