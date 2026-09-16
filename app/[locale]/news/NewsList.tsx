import type { ReactNode } from "react";
import { Search } from "lucide-react";
import Link from "@/components/i18n/LocaleLink";
import { muted } from "@/components/public/ui";
import type { ApiCategory, ApiNewsItem } from "@/lib/api";
import { withLocale, type Locale } from "@/lib/i18n/config";
import { routes } from "@/lib/routes";
import { getNews } from "./content";

/**
 * Список новостей текущей страницы. Категории — серверный фильтр (B-2):
 * кнопки — обычные `<Link>` на `?category=slug`, поиск — GET-форма с `q`.
 * Оба фильтра работают без JS, переживают reload/шаринг ссылкой и применяются
 * CMS до пагинации.
 *
 * На узком экране ряд кнопок-категорий заменяется нативным `<select>` в той же
 * GET-форме: пять-шесть чипов в несколько строк до результата читаются плохо,
 * а select занимает одну строку и виден без раскрытия (выбранное значение).
 * Отправка — та же кнопка формы, состояние живёт в адресе.
 */
export default function NewsList({
  aside,
  posts,
  categories,
  activeCategory,
  query,
  content,
  locale,
  total,
  unavailable,
}: {
  aside: ReactNode;
  posts: ApiNewsItem[];
  categories: ApiCategory[];
  activeCategory?: string;
  query?: string;
  content: ReturnType<typeof getNews>;
  locale: Locale;
  /** Общее число результатов фильтра (meta.total CMS). */
  total: number;
  /** CMS не ответила: пустой список — не «ничего не найдено». */
  unavailable?: boolean;
}) {
  const { filter, feed, empty } = content;
  const hasFilters = Boolean(activeCategory || query);

  // Текущий адрес с фильтрами — для ссылки «обновить» в состоянии недоступности
  // (обычный <a>: нужен полный переход, а не мягкая навигация на тот же маршрут).
  const currentHref = withLocale(
    locale,
    `/news?${[
      activeCategory ? `category=${encodeURIComponent(activeCategory)}` : "",
      query ? `q=${encodeURIComponent(query)}` : "",
    ]
      .filter(Boolean)
      .join("&")}`,
  );

  return (
    <>
      {/* Панель фильтров: категории — ссылки (desktop), поиск — GET-форма;
          оба серверные. Число результатов показывается при активном фильтре:
          подтверждает, что отбор применился, а не «пусто». */}
      <div className="flex flex-wrap items-center gap-[14px] border-b border-[var(--color-divider)] py-4">
        <div
          role="group"
          aria-label={filter.groupAria}
          className="flex flex-wrap gap-1.5 max-[560px]:hidden"
        >
          <Link
            href={withLocale(
              locale,
              query
                ? `${routes.news}?q=${encodeURIComponent(query)}`
                : routes.news,
            )}
            aria-current={!activeCategory ? "true" : undefined}
            className="btn px-[14px] py-1.5 text-[13px] no-underline hover:border-[var(--color-accent)]"
            style={
              !activeCategory
                ? {
                    background: "var(--color-accent-solid)",
                    color: "var(--color-bg)",
                    borderColor: "var(--color-accent-solid)",
                  }
                : { color: "inherit" }
            }
          >
            {filter.allCategory}
          </Link>
          {categories.map((c) => {
            const active = c.slug === activeCategory;
            return (
              <Link
                key={c.slug}
                href={withLocale(
                  locale,
                  `${routes.news}?category=${encodeURIComponent(c.slug)}${query ? `&q=${encodeURIComponent(query)}` : ""}`,
                )}
                aria-current={active ? "true" : undefined}
                className="btn px-[14px] py-1.5 text-[13px] no-underline hover:border-[var(--color-accent)]"
                style={
                  active
                    ? {
                        background: "var(--color-accent-solid)",
                        color: "var(--color-bg)",
                        borderColor: "var(--color-accent-solid)",
                      }
                    : { color: "inherit" }
                }
              >
                {c.name}
              </Link>
            );
          })}
        </div>
        <span className="flex-1 max-[560px]:hidden" />
        {hasFilters && !unavailable && (
          <span
            className="text-xs [font-variant-numeric:tabular-nums] max-[560px]:hidden"
            style={{ color: muted(55) }}
          >
            {filter.resultsPrefix}: {total}
          </span>
        )}
        {/* На узком экране форма переносится: select категории занимает
            отдельную строку во всю ширину, поиск и кнопка — следующую.
            Втроём в одну строку они не помещались, и поле ввода сжималось
            до 22px — печатать в нём было невозможно. */}
        <form method="get" className="flex flex-1 gap-2 max-[560px]:w-full max-[560px]:flex-none max-[560px]:flex-wrap">
          {/* Мобильный фильтр категории — select в этой же форме. Значение
              отправляется вместе с q одной кнопкой; на desktop select скрыт
              и играет роль прежнего скрытого поля category (скрытые поля
              формы, в отличие от disabled, отправляются).
              key: defaultValue у неуправляемого поля применяется только при
              монтировании, а при клиентском переходе React переиспользует тот
              же DOM-узел — select оставался со значением прошлого адреса и
              отправка поиска сбрасывала выбранную категорию. */}
          <select
            key={activeCategory ?? "all"}
            name="category"
            defaultValue={activeCategory ?? ""}
            aria-label={filter.categorySelect}
            className="input min-h-11 text-[13px] hidden max-[560px]:block max-[560px]:w-full"
          >
            <option value="">{filter.allCategory}</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            className="input min-h-11 w-[240px] text-[13px] max-[560px]:min-w-0 max-[560px]:w-auto max-[560px]:flex-1"
            key={query ?? ""}
            type="search"
            name="q"
            defaultValue={query ?? ""}
            placeholder={filter.searchPlaceholder}
            aria-label={filter.searchAria}
          />
          <button type="submit" className="btn btn-primary min-h-11">
            {filter.submit}
          </button>
        </form>
      </div>
      {/* Мобильная строка состояния фильтра: активная категория и число
          результатов видны без раскрытия select. */}
      {hasFilters && !unavailable && (
        <p
          className="m-0 flex flex-wrap items-center gap-2 border-b border-[var(--color-divider)] py-2 text-xs hidden max-[560px]:flex"
          style={{ color: muted(55) }}
        >
          {filter.resultsPrefix}: {total}
          <Link
            href={withLocale(locale, routes.news)}
            className="text-xs"
            style={{ color: "var(--color-accent-700)" }}
          >
            {empty.reset}
          </Link>
        </p>
      )}

      {unavailable ? (
        <div className="px-6 py-16 text-center">
          <Search
            size={34}
            strokeWidth={1.5}
            aria-hidden="true"
            className="mx-auto mb-3"
            style={{ color: muted(40) }}
          />
          <p className="m-0 mb-1.5 text-[19px] font-semibold [font-family:var(--font-heading)]">
            {empty.unavailableTitle}
          </p>
          <p className="m-0 mb-4 text-[13.5px]" style={{ color: muted(60) }}>
            {empty.unavailableText}
          </p>
          {/* Полный переход на тот же адрес: мягкая навигация на идентичный
              маршрут не перезапросила бы серверные данные. */}
          <a href={currentHref} className="btn btn-secondary no-underline">
            {filter.reload}
          </a>
        </div>
      ) : posts.length > 0 ? (
        <div className="mt-2 grid grid-cols-[minmax(0,2.2fr)_minmax(260px,1fr)] items-start gap-8 max-[920px]:grid-cols-1">
          <div role="feed" aria-label={feed.aria} className="min-w-0">
            {posts.map((p) => (
              <article
                key={p.slug}
                className="grid grid-cols-[110px_minmax(0,1fr)] gap-[18px] border-b border-[var(--color-divider)] py-5 max-[560px]:grid-cols-1 max-[560px]:gap-1.5"
              >
                <div
                  className="text-xs leading-[1.5]"
                  style={{ color: muted(55) }}
                >
                  {p.date}
                  <span
                    className="mt-1 block text-[10.5px] uppercase tracking-[.06em]"
                    style={{ color: "var(--color-accent-700)" }}
                  >
                    {p.category}
                  </span>
                </div>
                <div className="min-w-0">
                  <h2 className="m-0 mb-1.5 text-[21px] leading-[1.2]">
                    <Link
                      href={withLocale(locale, routes.article(p.slug))}
                      className="row-link"
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {p.title}
                    </Link>
                  </h2>
                  <p
                    className="m-0 text-[13.5px] leading-[1.55]"
                    style={{ color: muted(65) }}
                  >
                    {p.excerpt}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {aside}
        </div>
      ) : (
        <div className="px-6 py-16 text-center">
          <Search
            size={34}
            strokeWidth={1.5}
            aria-hidden="true"
            className="mx-auto mb-3"
            style={{ color: muted(40) }}
          />
          <p className="m-0 mb-1.5 text-[19px] font-semibold [font-family:var(--font-heading)]">
            {empty.title}
          </p>
          <p className="m-0 mb-4 text-[13.5px]" style={{ color: muted(60) }}>
            {empty.text}
          </p>
          <Link
            href={withLocale(locale, routes.news)}
            className="btn btn-secondary no-underline"
          >
            {empty.reset}
          </Link>
        </div>
      )}
    </>
  );
}
