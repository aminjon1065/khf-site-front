import type { Metadata } from "next";
import Link from "@/components/i18n/LocaleLink";
import PageShell from "@/components/public/PageShell";
import Pagination from "@/components/public/Pagination";
import { muted } from "@/components/public/ui";
import { fetchSearch } from "@/lib/api";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo";

const PER_PAGE = 20;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { common, pages } = getDictionary(locale);
  return {
    ...buildMetadata({
      locale,
      title: pages.search.title,
      path: "/search",
      siteName: common.siteShort,
    }),
    // Страницы результатов поиска не индексируем.
    robots: { index: false, follow: true },
  };
}

function firstString(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = toLocale((await params).locale);
  const resolvedSearchParams = await searchParams;
  const q = firstString(resolvedSearchParams.q).trim();
  const page = Math.max(1, Number(firstString(resolvedSearchParams.page)) || 1);
  const { common, pages } = getDictionary(locale);
  const s = pages.search;

  const result = await fetchSearch({ q, locale, page, perPage: PER_PAGE });
  const items = result.data;

  return (
    <PageShell mainClassName="mx-auto w-full max-w-[900px] px-6 pt-8 max-[920px]:px-4">
      <h1 className="page-title page-title-caps mb-4">{s.title}</h1>

      {/* GET-форма без JS: сабмит перезагружает /{locale}/search?q=… */}
      <form role="search" method="get" className="flex items-center gap-2">
        <input
          className="input min-h-11 flex-1 text-[15px]"
          key={q}
          type="search"
          name="q"
          defaultValue={q}
          placeholder={common.header.searchPlaceholder}
          aria-label={common.header.searchPlaceholder}
          autoFocus
        />
        <button type="submit" className="btn btn-primary min-h-11 px-5">
          {s.submit}
        </button>
      </form>

      {q.length < 2 ? (
        <p className="mt-8 text-[14px]" style={{ color: muted(60) }}>
          {s.promptShort}
        </p>
      ) : result.unavailable ? (
        /* Сбой API — не «ничего не найдено»: запрос остаётся в поле выше,
           следующее действие — повторить (ссылка на тот же адрес — обычный
           переход, перезапускает серверный рендер и повторяет запрос). */
        <div className="mt-8 border-b border-[var(--color-divider)] pb-8">
          <p
            className="m-0 mb-1.5 text-[19px] font-semibold [font-family:var(--font-heading)]"
          >
            {s.unavailableTitle}
          </p>
          <p className="m-0 mb-4 text-[14px]" style={{ color: muted(65) }}>
            {s.unavailableText}
          </p>
          <Link
            href={`/search?q=${encodeURIComponent(q)}`}
            className="btn btn-secondary no-underline"
          >
            {s.retry}
          </Link>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8 pb-8">
          <p className="m-0 text-[14px]" style={{ color: muted(60) }}>
            {s.emptyPrefix} «{q}».
          </p>
          {/* Следующий шаг вместо тупика: посмотреть раздел напрямую. */}
          <Link
            href="/sitemap"
            className="mt-2 inline-block text-[13px]"
            style={{ color: "var(--color-accent-700)" }}
          >
            {s.sitemapNav}
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-2 mt-6 text-xs" style={{ color: muted(55) }}>
            {s.resultsPrefix} «{q}» · {result.meta.total}
          </p>
          {/* role="listitem" стоял на самой ссылке и перекрывал её неявную роль
              link: для скринридера вся выдача переставала быть ссылками и
              пропадала из списка ссылок страницы. Роль несёт обёртка. */}
          <ul className="m-0 list-none p-0" role="list">
            {items.map((it) => (
              <li key={`${it.type}:${it.path}`}>
                <Link
                  href={it.path}
                  className="row-link block border-b border-[var(--color-divider)] py-4"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <span className="flex flex-wrap items-center gap-2.5">
                    <span className="tag tag-neutral flex-none">
                      {s.typeLabels[it.type]}
                    </span>
                    {it.published_at && (
                      <span
                        className="text-[11.5px]"
                        style={{ color: muted(50) }}
                      >
                        {it.published_at.slice(0, 10)}
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-[17px] font-semibold leading-[1.25] [font-family:var(--font-heading)]">
                    {it.title}
                  </span>
                  {it.excerpt && (
                    <span
                      className="mt-0.5 block text-[13.5px] leading-[1.5]"
                      style={{ color: muted(65) }}
                    >
                      {it.excerpt}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          <Pagination
            locale={locale}
            currentPage={result.meta.current_page}
            lastPage={result.meta.last_page}
            basePath="/search"
            query={{ q }}
          />
        </>
      )}
    </PageShell>
  );
}
