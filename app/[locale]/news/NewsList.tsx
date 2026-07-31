import type { ReactNode } from "react";
import { Search } from "lucide-react";
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
 */
export default function NewsList({
  aside,
  posts,
  categories,
  activeCategory,
  query,
  content,
  locale,
}: {
  aside: ReactNode;
  posts: ApiNewsItem[];
  categories: ApiCategory[];
  activeCategory?: string;
  query?: string;
  content: ReturnType<typeof getNews>;
  locale: Locale;
}) {
  const { filter, feed, empty } = content;

  return (
    <>
      {/* Панель фильтров: категории (ссылки, серверный фильтр) + поиск (клиентский) */}
      <div className="flex flex-wrap items-center gap-[14px] border-b border-[var(--color-divider)] py-4">
        <div
          role="group"
          aria-label={filter.groupAria}
          className="flex flex-wrap gap-1.5"
        >
          <a
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
          </a>
          {categories.map((c) => {
            const active = c.slug === activeCategory;
            return (
              <a
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
              </a>
            );
          })}
        </div>
        <span className="flex-1" />
        <form method="get" className="flex gap-2 max-[560px]:w-full">
          {activeCategory && (
            <input type="hidden" name="category" value={activeCategory} />
          )}
          <input
            className="input min-h-11 w-[240px] text-[13px] max-[560px]:min-w-0 max-[560px]:flex-1"
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

      {posts.length > 0 ? (
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
                    <a
                      href={withLocale(locale, routes.article(p.slug))}
                      className="row-link"
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {p.title}
                    </a>
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
          <a
            href={withLocale(locale, routes.news)}
            className="btn btn-secondary no-underline"
          >
            {empty.reset}
          </a>
        </div>
      )}
    </>
  );
}
