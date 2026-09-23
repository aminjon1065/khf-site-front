import type { Metadata } from "next";
import { LOCALES, htmlLang, type Locale } from "@/lib/i18n/config";

// Единый билдер метаданных: canonical + hreflang-альтернаты (/ru /tj→tg /en +
// x-default) + OpenGraph/Twitter. Возвращает ОТНОСИТЕЛЬНЫЕ пути — они
// резолвятся в абсолютные через metadataBase (задаётся в app/[locale]/layout.tsx).

/** Ключи query-параметров, разрешённые в canonical/alternates. */
export type CanonicalQuery = Record<string, string | number | undefined>;

/**
 * Публичный адрес сайта (для metadataBase, sitemap, robots).
 *
 * Локальная разработка использует localhost по умолчанию. Для production
 * адрес обязан быть задан и быть публичным HTTPS-origin: canonical, og:url,
 * JSON-LD и sitemap с localhost адресом — это сломанные сигналы для роботов.
 * Валидацию на сборке выполняет validateSiteUrl (scripts/build.mjs), здесь —
 * только чтение, чтобы dev-режим не падал.
 */
export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** Локальный/технический origin (localhost, *.local, без https)? */
function isLocalOrigin(rawUrl: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return true;
  }
  if (parsed.protocol !== "https:") {
    return true;
  }
  return (
    parsed.hostname === "localhost" ||
    parsed.hostname.endsWith(".local") ||
    parsed.hostname.endsWith(".test") ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname === "0.0.0.0"
  );
}

/**
 * Проверка site URL для production-сборки.
 *
 * Понятная ошибка вместо молчаливого localhost в canonical/og:url/sitemap:
 * сборка падает сразу, с указанием, какую переменную задать. Побег для
 * локальных preview-сборок — SITE_URL_ALLOW_LOCAL=1 (см. scripts/build.mjs).
 */
export function validateSiteUrl(
  rawUrl: string,
  { allowLocal = false }: { allowLocal?: boolean } = {},
): { ok: true } | { ok: false; reason: string } {
  if (allowLocal || process.env.NODE_ENV !== "production") {
    return { ok: true };
  }
  if (!rawUrl) {
    return {
      ok: false,
      reason:
        "NEXT_PUBLIC_SITE_URL не задан: production-сборка не может публиковать canonical/og:url/sitemap с localhost",
    };
  }
  if (isLocalOrigin(rawUrl)) {
    return {
      ok: false,
      reason: `NEXT_PUBLIC_SITE_URL="${rawUrl}" — не публичный HTTPS-origin; для production укажите адрес сайта (https://khf.tj)`,
    };
  }
  return { ok: true };
}

/** Код og:locale по локали портала. */
const OG_LOCALE: Record<Locale, string> = {
  ru: "ru_RU",
  tj: "tg_TJ",
  en: "en_US",
};

/** Путь `/{locale}{path}`; path без локали, '/' → корень локали. */
function localePath(locale: Locale, path: string): string {
  const p = path === "/" ? "" : path;
  return `/${locale}${p}`;
}

/**
 * Строка query-параметров canonical/alternates. Порядок стабильный
 * (вставка по ключам объекта), пустые значения отбрасываются; `page` (если
 * >1) добавляется последним — адрес вида `/ru/news?category=x&page=2`.
 */
function canonicalSuffix(query: CanonicalQuery, page: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

/**
 * canonical + languages для hreflang. Ключи — стандартные коды языка
 * (таджикская ветка /tj публикуется как hreflang `tg`), плюс x-default → ru.
 *
 * `query` — индексируемые параметры грани каталога (`category`, `type`):
 * они остаются в canonical и во всех альтернатах, чтобы перевод той же
 * грани не претендовал на каноничность базовой страницы. Свободный поиск
 * (`q`) сюда не передаётся никогда — он noindex (см. generateMetadata
 * списков) и в canonical не попадает.
 *
 * `availableLocales` — локали, в которых перевод ДЕЙСТВИТЕЛЬНО опубликован
 * (по списку slug'ов CMS для каждой локали). Без него механически
 * объявляются все три языка — и /en-адрес русского fallback'а получает
 * hreflang "en", которого на самом деле нет. x-default ведёт на русский,
 * если он есть, иначе — на первый доступный.
 *
 * `rel=prev/next` сюда осознанно не добавлены: Google официально не использует
 * их как сигнал с 2019 года, а у `Metadata.alternates` в Next.js нет для них
 * отдельного поля (только canonical/languages/media/types) — оставлять как
 * пустой формальный жест смысла не было.
 */
export function buildAlternates(
  path: string,
  locale: Locale,
  page = 1,
  query: CanonicalQuery = {},
  availableLocales?: readonly Locale[],
): NonNullable<Metadata["alternates"]> {
  const suffix = canonicalSuffix(query, page);
  const present = availableLocales ?? LOCALES;
  const languages: Record<string, string> = {};
  for (const l of present) {
    languages[htmlLang(l)] = `${localePath(l, path)}${suffix}`; // ru / tg / en
  }
  const fallback = present.includes("ru") ? "ru" : present[0];
  if (fallback) {
    languages["x-default"] = `${localePath(fallback, path)}${suffix}`;
  }
  return { canonical: `${localePath(locale, path)}${suffix}`, languages };
}

/**
 * Описание страницы для `<meta name="description">`. Берётся из уже
 * переведенного текста самой страницы (лид, подзаголовок), а не пишется
 * заново: так описание не расходится с содержимым и не требует отдельного
 * перевода. Длина обрезается по границе слова — поисковики показывают около
 * 160 символов, а обрыв на середине слова читается как ошибка.
 */
export function metaDescription(text: string, limit = 160): string {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (normalized.length <= limit) {
    return normalized;
  }

  const cut = normalized.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");

  return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s.,;:—-]+$/, "")}…`;
}

/** SEO-поля настроек CMS (`/settings` → `seo`) для языка страницы. */
export interface SiteSeoSettings {
  meta_title?: string | null;
  meta_description?: string | null;
}

function filled(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Title и description сайта по умолчанию — у главной и у страниц, которые не
 * задают своих. Берутся из SEO-настроек CMS (`seo.meta_title`,
 * `seo.meta_description`), если редактор их заполнил, иначе — встроенные
 * строки словаря. Описание из CMS обрезается тем же `metaDescription`, что и
 * описания страниц: длину поля в CMS никто не ограничивает.
 */
export function siteMetaDefaults(
  seo: SiteSeoSettings | null | undefined,
  fallback: { title: string; description: string },
): { title: string; description: string } {
  const title = filled(seo?.meta_title);
  const description = filled(seo?.meta_description);

  return {
    title: title || fallback.title,
    description: description
      ? metaDescription(description)
      : fallback.description,
  };
}

/** Дефолтная OG-карточка портала для страниц без собственной обложки. */
export function defaultOgImage(locale: Locale, alt = "khf.tj"): {
  url: string;
  width: number;
  height: number;
  alt: string;
} {
  return {
    url: `/og/og-${locale}.png`,
    width: 1200,
    height: 630,
    alt,
  };
}

export interface BuildMetadataArgs {
  locale: Locale;
  title: string;
  description?: string;
  /** Путь без префикса локали, напр. "/news/slug" или "/". */
  path: string;
  /** Абсолютные URL изображений (обложки из медиатеки CMS уже абсолютны). */
  images?: string[];
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
  siteName?: string;
  /** Номер страницы пагинированного списка (>1 меняет canonical/hreflang). */
  page?: number;
  /**
   * Индексируемые query-параметры граней каталога (category/type) — попадают
   * в canonical и альтернаты. Поисковые параметры (q) не передавать: они
   * обрабатываются noindex-политикой вызывающей страницы.
   */
  query?: CanonicalQuery;
  /** Локали с реально опубликованным переводом (фильтр hreflang). */
  availableLocales?: readonly Locale[];
}

/** Полный набор метаданных страницы (title/description/alternates/OG/Twitter). */
export function buildMetadata(args: BuildMetadataArgs): Metadata {
  const {
    locale,
    title,
    description,
    path,
    images,
    type = "website",
    publishedTime,
    modifiedTime,
    siteName,
    page = 1,
    query = {},
    availableLocales,
  } = args;

  // Реальная обложка материала приоритетна; без неё — общая карточка
  // портала (локализованная), а не пустой og:image.
  const ogImages: NonNullable<Metadata["openGraph"]>["images"] = images?.length
    ? images.map((url) => ({ url }))
    : [defaultOgImage(locale, siteName ?? "khf.tj")];
  const suffix = canonicalSuffix(query, page);

  return {
    title,
    description,
    alternates: buildAlternates(path, locale, page, query, availableLocales),
    openGraph: {
      type,
      title,
      description,
      url: `${localePath(locale, path)}${suffix}`,
      siteName,
      locale: OG_LOCALE[locale],
      images: ogImages,
      ...(type === "article"
        ? {
            publishedTime: publishedTime ?? undefined,
            modifiedTime: modifiedTime ?? undefined,
          }
        : {}),
    },
    twitter: {
      card: ogImages.length > 0 ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImages,
    },
  };
}
