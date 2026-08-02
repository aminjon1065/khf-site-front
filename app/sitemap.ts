import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";
import { siteUrl } from "@/lib/seo";
import { LOCALES, DEFAULT_LOCALE, htmlLang } from "@/lib/i18n/config";
import { fetchSlugs, type SlugContentType } from "@/lib/api";
import { cmsCacheTags } from "@/lib/cache-tags";

// Статические разделы портала — по одному URL на локаль. Поиск (`/search`) намеренно
// исключён: он под disallow в robots.txt и не должен попадать в карту сайта.
const STATIC_PATHS = [
  "",
  "/news",
  "/guides",
  "/map",
  "/documents",
  "/contacts",
  "/projects",
  "/announcements",
  "/alerts",
  "/leadership",
  "/structure",
  "/symbols",
  "/sos",
  "/sitemap",
] as const;

// Тип контента в CMS → сегмент маршрута портала (инструкции живут под /guides).
const SITEMAP_SECTIONS: { type: SlugContentType; segment: string }[] = [
  { type: "news", segment: "news" },
  { type: "project", segment: "projects" },
  { type: "alert", segment: "alerts" },
  { type: "instruction", segment: "guides" },
  { type: "page", segment: "pages" },
  { type: "announcement", segment: "announcements" },
];

const fetchDynamicRoutes = unstable_cache(
  async (): Promise<{ segment: string; slugs: string[] }[]> => {
    const slugs = await Promise.all(
      SITEMAP_SECTIONS.map((section) =>
        fetchSlugs(section.type, DEFAULT_LOCALE),
      ),
    );

    return SITEMAP_SECTIONS.map((section, index) => ({
      segment: section.segment,
      slugs: slugs[index],
    }));
  },
  ["cms-sitemap-dynamic-routes"],
  { revalidate: 60, tags: [cmsCacheTags.sitemap] },
);

/**
 * hreflang-альтернаты для пути без локали: ключи — канонические коды языка
 * (таджикская ветка /tj публикуется как `tg`), значения — абсолютные URL /ru,/tj,/en.
 */
function languagesFor(base: string, path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[htmlLang(locale)] = `${base}/${locale}${path}`;
  }
  return languages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const entries: MetadataRoute.Sitemap = [];

  // 1. Статические маршруты × локали.
  for (const locale of LOCALES) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${base}/${locale}${path}`,
        alternates: { languages: languagesFor(base, path) },
      });
    }
  }

  // 2. Детальные маршруты из CMS. Slug'и локале-стабильны, поэтому забираем каждый
  //    тип один раз (дефолтная локаль) и разворачиваем по всем локалям. Сбой API не
  //    должен ронять карту сайта — тогда вернём хотя бы статические маршруты.
  try {
    // Инструкции живут под /guides, страницы — под /pages (см. app/[locale]/…).
    const dynamic = await fetchDynamicRoutes();

    for (const { segment, slugs } of dynamic) {
      for (const slug of slugs) {
        if (!slug) continue;
        const path = `/${segment}/${slug}`;
        for (const locale of LOCALES) {
          entries.push({
            url: `${base}/${locale}${path}`,
            alternates: { languages: languagesFor(base, path) },
          });
        }
      }
    }
  } catch (error) {
    console.error("sitemap dynamic routes failed:", error);
  }

  return entries;
}
