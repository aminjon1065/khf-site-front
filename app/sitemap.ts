import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { LOCALES, htmlLang, toApiLocale, type Locale } from "@/lib/i18n/config";
import { fetchSitemapEntries, type SitemapEntry } from "@/lib/api";
import { routes } from "@/lib/routes";

// Статические разделы портала — по одному URL на локаль. Поиск (`/search`) намеренно
// исключён: он noindex и не должен попадать в карту сайта.
//
// /leadership, /structure и /symbols — здесь, хотя их текст редактируется в
// CMS: без перевода страницы раздел показывает встроенный текст, то есть он
// существует во всех локалях. /about — нет: у него нет встроенного текста,
// и в карту он попадает из CMS (routes.page), только в опубликованных локалях.
const STATIC_PATHS: readonly string[] = [
  "",
  routes.news,
  routes.guides,
  routes.map,
  routes.documents,
  routes.contacts,
  routes.projects,
  routes.announcements,
  routes.alert,
  routes.leadership,
  routes.structure,
  routes.symbols,
  routes.sos,
  routes.sitemap,
];

const STATIC_PATH_SET = new Set(STATIC_PATHS);

// Тип контента в CMS → сегмент маршрута портала (инструкции живут под /guides).
const SEGMENT_BY_TYPE: Record<SitemapEntry["type"], string> = {
  news: "news",
  projects: "projects",
  alerts: "alerts",
  instructions: "guides",
  pages: "pages",
  announcements: "announcements",
};

/**
 * Последняя успешная выдача CMS. Живёт в процессе сервера: когда CMS
 * временно молчит, карта сайта не усохла бы до статических разделов, а
 * повторила последний удачный вариант. Память процесса — осознанный размен
 * в рамках текущей модели кэширования (без внешнего хранилища): первый
 * успешный прогон после старта восстанавливает актуальность.
 */
let lastGoodEntries: SitemapEntry[] | null = null;

/**
 * Путь материала без локали. У CMS-страниц он идёт через routes.page:
 * about/leadership/structure/symbols живут в собственных разделах, а
 * `/pages/{slug}` для них — лишь 308-редирект, которому в карте сайта не место.
 */
function detailPath(segment: string, slug: string): string {
  return segment === "pages" ? routes.page(slug) : `/${segment}/${slug}`;
}

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

  // 2. Материалы из CMS одним запросом (`/sitemap`): у каждого — языки,
  //    где он опубликован, и дата последнего изменения. Сбой API не должен
  //    урезать карту: предпочитаем последний успешный вариант, а при его
  //    отсутствии оставляем статические разделы.
  const fresh = await fetchSitemapEntries();

  if (fresh !== null) {
    lastGoodEntries = fresh;
  } else {
    console.error(
      "sitemap: CMS не ответила, карта собрана из последнего удачного списка",
    );
  }

  for (const entry of lastGoodEntries ?? []) {
    const segment = SEGMENT_BY_TYPE[entry.type];
    if (!segment || !entry.slug) continue;

    const path = detailPath(segment, entry.slug);
    // Раздел уже объявлен выше во всех локалях — второй записи не нужно.
    if (STATIC_PATH_SET.has(path)) continue;

    // В каждую локаль — только свои переводы; альтернаты — только реально
    // существующие пары.
    const present = LOCALES.filter((locale) =>
      entry.locales.includes(toApiLocale(locale)),
    );
    for (const locale of present) {
      entries.push({
        url: `${base}/${locale}${path}`,
        // Дата, которую заявляет сама страница: последняя правка текста,
        // а без правок — публикация. Её нет — нет и <lastmod>.
        ...(entry.modified_at ? { lastModified: entry.modified_at } : {}),
        alternates: { languages: languagesFor(base, path, present) },
      });
    }
  }

  return entries;
}
