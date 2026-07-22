import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { LOCALES, DEFAULT_LOCALE, htmlLang } from "@/lib/i18n/config";
import {
  fetchNews,
  fetchProjects,
  fetchAlerts,
  fetchInstructions,
  fetchPages,
} from "@/lib/api";

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
    const [news, projects, alerts, instructions, pages] = await Promise.all([
      fetchNews({ perPage: 100, locale: DEFAULT_LOCALE }),
      fetchProjects(DEFAULT_LOCALE),
      fetchAlerts(DEFAULT_LOCALE),
      fetchInstructions(DEFAULT_LOCALE),
      fetchPages(DEFAULT_LOCALE),
    ]);

    // Инструкции живут под /guides, страницы — под /pages (см. app/[locale]/…).
    const dynamic: { type: string; slugs: string[] }[] = [
      { type: "news", slugs: news.data.map((n) => n.slug) },
      { type: "projects", slugs: projects.map((p) => p.slug) },
      { type: "alerts", slugs: alerts.map((a) => a.slug) },
      { type: "guides", slugs: instructions.map((i) => i.slug) },
      { type: "pages", slugs: pages.map((p) => p.slug) },
    ];

    for (const { type, slugs } of dynamic) {
      for (const slug of slugs) {
        if (!slug) continue;
        const path = `/${type}/${slug}`;
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
