import { afterEach, describe, expect, it, vi } from "vitest";
import { buildUrl, fetchNews, fetchNewsItem } from "@/lib/api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CMS API policy", () => {
  it("maps tj to tg and removes empty query parameters", () => {
    const url = new URL(
      buildUrl("/news", {
        locale: "tj",
        q: "",
        page: 2,
        category: undefined,
      }),
    );

    expect(url.pathname).toBe("/api/v1/news");
    expect(url.searchParams.get("locale")).toBe("tg");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.has("q")).toBe(false);
    expect(url.searchParams.has("category")).toBe(false);
  });

  it("returns an empty paginated result for list failures", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 500 })),
    );

    await expect(fetchNews({ locale: "ru" })).resolves.toEqual({
      data: [],
      meta: { total: 0, per_page: 0, current_page: 1, last_page: 1 },
    });
  });

  it("tags list and detail fetches independently by locale and slug", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          data: [],
          meta: { total: 0, per_page: 0, current_page: 1, last_page: 1 },
        }),
      )
      .mockResolvedValueOnce(Response.json({ data: { slug: "storm" } }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchNews({ locale: "tj" });
    await fetchNewsItem("storm", "en");

    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      next: { tags: ["cms:news:tj"] },
    });
    expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({
      next: {
        tags: ["cms:news:en", "cms:news:storm:en"],
      },
    });
  });

  it("returns null only for detail 404 responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 404 })),
    );

    await expect(fetchNewsItem("missing", "ru")).resolves.toBeNull();
  });

  it("rethrows detail server failures so ISR can retain stale content", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 500 })),
    );

    await expect(fetchNewsItem("test-news", "ru")).rejects.toThrow("API 500");
  });
});
