import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";
import { siteUrl } from "@/lib/seo";
import { LOCALES, htmlLang, type Locale } from "@/lib/i18n/config";
import { fetchSlugs, type SlugContentType } from "@/lib/api";
import { cmsCacheTags } from "@/lib/cache-tags";

// Статические разделы портала — по одному URL на локаль. Поиск (`/search`) намеренно
// исключён: он noindex и не должен попадать в карту сайта.
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

/**
 * Последняя успешная выдача slug'ов. Живёт в процессе сервера: когда CMS
 * временно молчит, карта сайта не усохла бы до статических разделов, а
 * повторила последний удачный вариант. Память процесса — осознанный размен
 * в рамках текущей модели кэширования (без внешнего хранилища): первый
 * успешный прогон после старта восстанавливает актуальность.
 */
let lastGoodRoutes: { segment: string; byLocale: Record<Locale, string[]> }[] | null =
  null;

/**
 * Slug'и по типам ДЛЯ КАЖДОЙ локали отдельно. Ответ `/slugs/{type}` — это
 * «slug'и, доступные в запрошенной локали» (контракт API), то есть прямой
 * сигнал о том, где перевод реально опубликован. Раньше список брали один
 * раз (ru) и разворачивали на все три языка — /en-адрес русского fallback'а
 * попадал в карту с hreflang "en", которого не существует.
 */
const fetchDynamicRoutes = unstable_cache(
  async (): Promise<{
    routes: { segment: string; byLocale: Record<Locale, string[]> }[];
    failed: boolean;
  }> => {
    const responses = await Promise.all(
      SITEMAP_SECTIONS.flatMap((section) =>
        LOCALES.map((locale) => fetchSlugs(section.type, locale)),
      ),
    );

    const routes = SITEMAP_SECTIONS.map((section, sectionIndex) => {
      const byLocale = {} as Record<Locale, string[]>;
      LOCALES.forEach((locale, localeIndex) => {
        // null — сбой: локали нет в последнем успешном варианте ниже.
        byLocale[locale] =
          responses[sectionIndex * LOCALES.length + localeIndex] ?? [];
      });
      return { segment: section.segment, byLocale };
    });

    // fetchSlugs возвращает null (а не []) только при отказе CMS.
    const failed = responses.some((r) => r === null);
    if (failed) {
      console.error(
        "sitemap: часть списков slug'ов не получена (CMS не ответила)",
      );
    }
    return { routes, failed };
  },
  ["cms-sitemap-dynamic-routes"],
  { revalidate: 60, tags: [cmsCacheTags.sitemap] },
);

/**
 * hreflang-альтернаты для пути без локали: ключи — канонические коды языка
 * (таджикская ветка /tj публикуется как `tg`), значения — абсолютные URL.
 * Только для локалей, где материал действительно опубликован, — взаимность
 * ссылок гарантирована тем же списком.
 */
function languagesFor(
  base: string,
  path: string,
  locales: readonly Locale[],
): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[htmlLang(locale)] = `${base}/${locale}${path}`;
  }
  return languages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const entries: MetadataRoute.Sitemap = [];

  // 1. Статические маршруты: интерфейс переведён во все локали — честно
  //    объявляем все три ветки.
  for (const locale of LOCALES) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${base}/${locale}${path}`,
        alternates: { languages: languagesFor(base, path, LOCALES) },
      });
    }
  }

  // 2. Детальные маршруты из CMS — на локаль свой список slug'ов. Сбой API
  //    не должен урезать карту: предпочитаем последний успешный вариант,
  //    а при его отсутствии оставляем статические разделы.
  try {
    const { routes, failed } = await fetchDynamicRoutes();

    // При сбое молча сохраняем lastGoodRoutes (или его отсутствие), не
    // подменяя контент пустотой: материалы не могли исчезнуть за минуту.
    if (!failed) {
      lastGoodRoutes = routes;
    }

    for (const { segment, byLocale } of lastGoodRoutes ?? []) {
      // Слаг, доступный хотя бы в одной локали. В каждую локаль — только
      // свои переводы; альтернаты — только реально существующие пары.
      const slugSet = new Set(
        LOCALES.flatMap((locale) => byLocale[locale]),
      );
      for (const slug of slugSet) {
        if (!slug) continue;
        const path = `/${segment}/${slug}`;
        const present = LOCALES.filter((locale) =>
          byLocale[locale].includes(slug),
        );
        for (const locale of present) {
          entries.push({
            url: `${base}/${locale}${path}`,
            alternates: { languages: languagesFor(base, path, present) },
          });
        }
      }
    }
  } catch (error) {
    console.error("sitemap dynamic routes failed:", error);
  }

  return entries;
}
