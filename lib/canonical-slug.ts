import { permanentRedirect } from "next/navigation";
import { withLocale, type Locale } from "@/lib/i18n/config";

// Адрес материала в CMS можно сменить. Прежний адрес CMS не забывает: запрос
// `/news/{старый}` она отвечает 301 на `/news/{текущий}`, а `fetch` следует
// за редиректом и отдаёт материал с текущим `slug`. Если страницу открыли по
// прежнему адресу, посетителя (и поисковик) нужно отправить 308-м на
// канонический: у материала один URL, а ссылки, которыми уже поделились, не
// ведут на 404.

/** Совпадает ли slug из адреса страницы с текущим slug материала. */
export function isSameSlug(requested: string, current: string): boolean {
  if (requested === current) {
    return true;
  }

  try {
    return decodeURIComponent(requested) === current;
  } catch {
    return false;
  }
}

/**
 * 308 на канонический адрес, если материал пришёл под другим slug'ом.
 * `path` строит путь раздела без локали (`routes.article` и т. п.).
 */
export function redirectToCurrentSlug(
  requested: string,
  current: string | null | undefined,
  locale: Locale,
  path: (slug: string) => string,
): void {
  if (!current || isSameSlug(requested, current)) {
    return;
  }

  permanentRedirect(withLocale(locale, path(current)));
}
