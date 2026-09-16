import Link from "next/link";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

/**
 * Честная заметка о том, что перевод материала на язык страницы не опубликован,
 * и показан доступный вариант.
 *
 * Зачем: CMS отдаёт контент на любой запрошенной локали, подставляя русский
 * fallback, когда перевода нет. Молча выдавать этот fallback за английскую или
 * таджикскую публикацию нельзя — ни человеку, ни поисковику (страница в этом
 * случае помечается noindex, а hreflang объявляет только реальные переводы,
 * см. buildAlternates(..., availableLocales)).
 *
 * Компонент серверный: данные о наличии переводов страница уже получила для
 * метаданных, ничего интерактивного здесь нет.
 */
export default function TranslationNotice({
  locale,
  available,
  path,
}: {
  /** Локаль открытой страницы. */
  locale: Locale;
  /** Локали с реально опубликованным переводом (lib/api: availableLocalesFor). */
  available: readonly Locale[];
  /** Путь материала без префикса локали, например `/news/slug`. */
  path: string;
}) {
  if (available.includes(locale) || available.length === 0) {
    return null;
  }

  // Русский приоритетнее как язык оригинала публикаций Комитета; если и его
  // нет — первый доступный в каноническом порядке локалей.
  const fallback =
    (available.includes("ru") ? "ru" : available.find((l) => LOCALES.includes(l))) ??
    null;
  if (!fallback) {
    return null;
  }

  const { pages } = getDictionary(locale);

  return (
    <p
      className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-l-[3px] px-4 py-3 text-[13.5px] leading-[1.5]"
      style={{
        borderColor: "var(--hz-warning)",
        background: "var(--hz-warning-bg)",
      }}
    >
      {pages.newsDetail.translationNotice}{" "}
      <Link
        href={`/${fallback}${path}`}
        className="font-medium"
        style={{ color: "var(--color-accent-700)" }}
      >
        {pages.newsDetail.readIn} {pages.languageNames[fallback]}
      </Link>
    </p>
  );
}
