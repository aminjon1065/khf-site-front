import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchAnnouncements,
  fetchDocuments,
  fetchNews,
  fetchNewsItem,
} from "@/lib/api";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("lib/api", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("fetchNews / buildUrl", () => {
    it("converts the tj URL locale to the tg API locale in the query string", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({
          data: [],
          meta: { total: 0, per_page: 20, current_page: 1, last_page: 1 },
        }),
      );

      await fetchNews({ locale: "tj" });

      const requestedUrl = new URL(fetchMock.mock.calls[0][0] as string);
      expect(requestedUrl.searchParams.get("locale")).toBe("tg");
      expect(requestedUrl.pathname.endsWith("/news")).toBe(true);
    });

    it("omits undefined and empty-string params instead of sending them blank", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({
          data: [],
          meta: { total: 0, per_page: 20, current_page: 1, last_page: 1 },
        }),
      );

      await fetchNews({ locale: "ru", category: "", q: undefined, page: 2 });

      const requestedUrl = new URL(fetchMock.mock.calls[0][0] as string);
      expect(requestedUrl.searchParams.has("category")).toBe(false);
      expect(requestedUrl.searchParams.has("q")).toBe(false);
      expect(requestedUrl.searchParams.get("page")).toBe("2");
    });

    it("maps perPage to the per_page query parameter", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({
          data: [],
          meta: { total: 0, per_page: 12, current_page: 1, last_page: 1 },
        }),
      );

      await fetchNews({ perPage: 12 });

      const requestedUrl = new URL(fetchMock.mock.calls[0][0] as string);
      expect(requestedUrl.searchParams.get("per_page")).toBe("12");
    });

    it("degrades to an empty paginated result on a 5xx response instead of throwing", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ message: "Server error" }, 500),
      );

      const result = await fetchNews();

      expect(result).toEqual({
        data: [],
        meta: { total: 0, per_page: 0, current_page: 1, last_page: 1 },
      });
    });

    it("degrades to an empty paginated result when the network request itself fails", async () => {
      fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));

      const result = await fetchNews();

      expect(result.data).toEqual([]);
    });
  });

  describe("fetchNewsItem", () => {
    it("returns null on a 404 (unpublished or missing slug)", async () => {
      fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));

      const result = await fetchNewsItem("missing-slug");

      expect(result).toBeNull();
    });

    it("throws on a 5xx response instead of caching a false not-found", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ message: "Server error" }, 500),
      );

      await expect(fetchNewsItem("some-slug")).rejects.toThrow();
    });

    it("throws when the network request itself fails", async () => {
      fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));

      await expect(fetchNewsItem("some-slug")).rejects.toThrow();
    });

    it("returns the item's data on success", async () => {
      const item = {
        slug: "some-slug",
        title: "Заголовок",
        category: "Новости",
        date: "16 июля 2026",
      };
      fetchMock.mockResolvedValueOnce(jsonResponse({ data: item }));

      const result = await fetchNewsItem("some-slug");

      expect(result).toEqual(item);
    });
  });

  describe("server-side catalogue filters", () => {
    it("passes document type and search before pagination", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({
          data: [],
          meta: { total: 0, per_page: 20, current_page: 2, last_page: 2 },
        }),
      );

      await fetchDocuments({
        locale: "tj",
        type: "law",
        q: "123",
        page: 2,
        perPage: 20,
      });

      const requestedUrl = new URL(fetchMock.mock.calls[0][0] as string);
      expect(requestedUrl.searchParams.get("locale")).toBe("tg");
      expect(requestedUrl.searchParams.get("type")).toBe("law");
      expect(requestedUrl.searchParams.get("q")).toBe("123");
      expect(requestedUrl.searchParams.get("page")).toBe("2");
    });

    it("passes announcement kind before pagination", async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({
          data: [],
          meta: { total: 0, per_page: 20, current_page: 1, last_page: 1 },
        }),
      );

      await fetchAnnouncements({
        locale: "en",
        kind: "tender",
        page: 1,
      });

      const requestedUrl = new URL(fetchMock.mock.calls[0][0] as string);
      expect(requestedUrl.searchParams.get("kind")).toBe("tender");
    });
  });
});
