// Единый источник правды по локалям публичного портала.
//
// В URL и интерфейсе таджикский обозначается как `tj` (так исторически в макетах
// и ccTLD страны — .tj). Бек/CMS и стандарт ISO 639-1 используют `tg`, поэтому на
// границе API выполняется маппинг `tj → tg` (см. toApiLocale). Атрибут <html lang>
// тоже канонический — `tg` (для скринридеров и SEO).

/** Локали интерфейса и маршрутов (то, что видно в URL: /ru, /tj, /en). */
export const LOCALES = ["ru", "tj", "en"] as const;

export type Locale = (typeof LOCALES)[number];

/** Канонический язык портала — русский. */
export const DEFAULT_LOCALE: Locale = "ru";

/** Локаль контента, как её ждёт публичный API CMS (ISO: таджикский — `tg`). */
export type ApiLocale = "ru" | "tg" | "en";

/** Cookie, в которую сохраняется выбор языка (читается прокси при заходе на `/`). */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Проверка, что строка — поддерживаемая локаль (сужает тип). */
export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Приводит значение из params к валидной локали (иначе — дефолт). */
export function toLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** UI/URL-локаль → локаль API CMS. Таджикский `tj` отправляется как `tg`. */
export function toApiLocale(locale: Locale): ApiLocale {
  return locale === "tj" ? "tg" : locale;
}

/** Значение атрибута <html lang> (канонический код языка). */
export function htmlLang(locale: Locale): string {
  return locale === "tj" ? "tg" : locale;
}

/** Короткая подпись для переключателя языка в шапке. */
export const LOCALE_LABELS: Record<Locale, string> = {
  ru: "РУ",
  tj: "ТҶ",
  en: "EN",
};

/** Первый сегмент пути — локаль. Возвращает DEFAULT_LOCALE, если её там нет. */
export function localeFromPathname(pathname: string): Locale {
  const first = pathname.split("/")[1];
  return isLocale(first) ? first : DEFAULT_LOCALE;
}

/**
 * Префиксует внутренний путь текущей локалью. Внешние ссылки (http, tel, mailto,
 * якоря, протокол-относительные) и уже локализованные пути возвращаются как есть.
 */
export function withLocale(locale: Locale, href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) {
    return href;
  }

  const first = href.split("/")[1];
  if (isLocale(first)) {
    return href;
  }

  return href === "/" ? `/${locale}` : `/${locale}${href}`;
}

/** Убирает префикс локали из пути (для переключателя языка). Всегда с ведущим `/`. */
export function stripLocale(pathname: string): string {
  const segments = pathname.split("/");
  if (isLocale(segments[1])) {
    const rest = "/" + segments.slice(2).join("/");
    return rest === "/" ? "/" : rest.replace(/\/$/, "");
  }
  return pathname;
}
