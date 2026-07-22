import type { Metadata } from "next";
import { LOCALES, htmlLang, type Locale } from "@/lib/i18n/config";

// Единый билдер метаданных: canonical + hreflang-альтернаты (/ru /tj→tg /en +
// x-default) + OpenGraph/Twitter. Возвращает ОТНОСИТЕЛЬНЫЕ пути — они
// резолвятся в абсолютные через metadataBase (задаётся в app/[locale]/layout.tsx).

/** Публичный адрес сайта (для metadataBase). */
export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
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
 * canonical + languages для hreflang. Ключи — стандартные коды языка
 * (таджикская ветка /tj публикуется как hreflang `tg`), плюс x-default → ru.
 */
export function buildAlternates(
  path: string,
  locale: Locale,
): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    languages[htmlLang(l)] = localePath(l, path); // ru / tg / en
  }
  languages["x-default"] = localePath("ru", path);
  return { canonical: localePath(locale, path), languages };
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
  } = args;

  const hasImages = Array.isArray(images) && images.length > 0;

  return {
    title,
    description,
    alternates: buildAlternates(path, locale),
    openGraph: {
      type,
      title,
      description,
      url: localePath(locale, path),
      siteName,
      locale: OG_LOCALE[locale],
      ...(hasImages ? { images } : {}),
      ...(type === "article"
        ? {
            publishedTime: publishedTime ?? undefined,
            modifiedTime: modifiedTime ?? undefined,
          }
        : {}),
    },
    twitter: {
      card: hasImages ? "summary_large_image" : "summary",
      title,
      description,
      ...(hasImages ? { images } : {}),
    },
  };
}
