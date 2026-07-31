import { afterEach, expect, it, vi } from "vitest";

vi.mock("react", () => ({
  cache: <Arguments extends unknown[], Result>(
    loader: (...args: Arguments) => Result,
  ) => {
    const results = new Map<string, Result>();

    return (...args: Arguments): Result => {
      const key = JSON.stringify(args);
      if (!results.has(key)) {
        results.set(key, loader(...args));
      }

      return results.get(key) as Result;
    };
  },
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

it("wraps detail reads in request memoization keyed by slug and locale", async () => {
  const fetchMock = vi.fn(async () =>
    Response.json({
      data: {
        slug: "shared-detail",
        title: "Shared detail",
      },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);
  const { fetchNewsItem } = await import("@/lib/api");

  await Promise.all([
    fetchNewsItem("shared-detail", "ru"),
    fetchNewsItem("shared-detail", "ru"),
  ]);
  await fetchNewsItem("shared-detail", "en");

  expect(fetchMock).toHaveBeenCalledTimes(2);
});
