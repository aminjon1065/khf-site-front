import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SitemapEntry } from "@/lib/api";

// sitemap.xml. Материалы приходят из CMS одним списком (`/sitemap`): языки,
// где материал опубликован, и дата последнего изменения — её страница
// заявляет сама. /pages/{about|…} — 308-редирект, ему не место в карте;
// /about — CMS-раздел без встроенного текста, поэтому объявляется только в
// опубликованных локалях; /leadership, /structure, /symbols и так есть среди
// статических разделов.

const cms = vi.hoisted(() => ({
  entries: [] as SitemapEntry[] | null,
}));

vi.mock("@/lib/api", () => ({
  fetchSitemapEntries: vi.fn(async () => cms.entries),
}));

const PAGE_DATE = "2026-09-20T10:00:00+05:00";
const NEWS_DATE = "2026-09-24T09:30:00+05:00";

function page(slug: string, locales: SitemapEntry["locales"]): SitemapEntry {
  return { type: "pages", slug, locales, modified_at: PAGE_DATE };
}

describe("sitemap.xml", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://khf.test");
    cms.entries = [
      page("about", ["tg", "ru"]),
      page("leadership", ["tg", "ru", "en"]),
      page("structure", ["ru"]),
      page("symbols", ["ru"]),
      page("privacy", ["ru"]),
      {
        type: "news",
        slug: "ucheniya",
        locales: ["tg", "ru"],
        modified_at: NEWS_DATE,
      },
      { type: "instructions", slug: "sel", locales: ["ru"], modified_at: null },
    ];
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  async function urls() {
    const { default: sitemap } = await import("@/app/sitemap");
    return sitemap();
  }

  it("lists CMS pages under their own sections, never as /pages/{slug} redirects", async () => {
    const entries = await urls();
    const all = entries.map((entry) => entry.url);

    for (const slug of ["about", "leadership", "structure", "symbols"]) {
      expect(all.some((url) => url.includes(`/pages/${slug}`))).toBe(false);
    }
    // Обычная CMS-страница остаётся по /pages/{slug}.
    expect(all).toContain("https://khf.test/ru/pages/privacy");
  });

  it("declares /about only in locales where the page is published", async () => {
    const entries = await urls();
    const about = entries.filter((entry) => entry.url.endsWith("/about"));

    expect(about.map((entry) => entry.url)).toEqual([
      "https://khf.test/ru/about",
      "https://khf.test/tj/about",
    ]);
    expect(about[0].alternates?.languages).toEqual({
      ru: "https://khf.test/ru/about",
      tg: "https://khf.test/tj/about",
    });
  });

  it("keeps a single entry per locale for sections that exist in every locale", async () => {
    const all = (await urls()).map((entry) => entry.url);

    for (const locale of ["ru", "tj", "en"]) {
      for (const path of ["/leadership", "/structure", "/symbols"]) {
        expect(
          all.filter((url) => url === `https://khf.test/${locale}${path}`),
        ).toHaveLength(1);
      }
    }
  });

  it("dates each material with the moment it last changed, in every language it has", async () => {
    const news = (await urls()).filter((entry) =>
      entry.url.endsWith("/news/ucheniya"),
    );

    expect(news.map((entry) => [entry.url, entry.lastModified])).toEqual([
      ["https://khf.test/ru/news/ucheniya", NEWS_DATE],
      ["https://khf.test/tj/news/ucheniya", NEWS_DATE],
    ]);
    expect(news[0].alternates?.languages).toEqual({
      ru: "https://khf.test/ru/news/ucheniya",
      tg: "https://khf.test/tj/news/ucheniya",
    });
  });

  it("leaves the date out where nobody knows it", async () => {
    const entries = await urls();
    const guide = entries.find((entry) =>
      entry.url.endsWith("/ru/guides/sel"),
    );
    const newsSection = entries.find(
      (entry) => entry.url === "https://khf.test/ru/news",
    );

    expect(guide).toBeDefined();
    expect(guide).not.toHaveProperty("lastModified");
    // A section page has no date of its own to state.
    expect(newsSection).not.toHaveProperty("lastModified");
  });

  it("keeps the last good list while the CMS does not answer", async () => {
    await urls();
    cms.entries = null;

    const all = (await urls()).map((entry) => entry.url);

    expect(all).toContain("https://khf.test/ru/news/ucheniya");
    expect(all).toContain("https://khf.test/ru/news");
  });
});
