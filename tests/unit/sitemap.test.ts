import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Locale } from "@/lib/i18n/config";

// sitemap.xml и CMS-страницы с собственными разделами. /pages/{about|…} —
// 308-редирект, ему не место в карте сайта; /about — CMS-раздел без
// встроенного текста, поэтому объявляется только в опубликованных локалях;
// /leadership, /structure, /symbols и так есть среди статических разделов.

const slugs = vi.hoisted(() => ({
  page: {} as Record<string, string[]>,
}));

vi.mock("next/cache", () => ({
  // Вне рантайма Next кэша нет — функция просто вызывается.
  unstable_cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}));

vi.mock("@/lib/api", () => ({
  fetchSlugs: vi.fn(async (type: string, locale: Locale) =>
    type === "page" ? (slugs.page[locale] ?? []) : [],
  ),
}));

describe("sitemap.xml and CMS pages", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://khf.test");
    slugs.page = {
      ru: ["about", "leadership", "structure", "symbols", "privacy"],
      tj: ["about", "leadership"],
      en: ["leadership"],
    };
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
});
