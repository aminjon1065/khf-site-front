import type { Metadata } from "next";
import Link from "@/components/i18n/LocaleLink";
import PageShell from "@/components/public/PageShell";
import { muted } from "@/components/public/ui";
import { fetchSearch } from "@/lib/api";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo";

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
  const q = firstString((await searchParams).q).trim();
  const { common, pages } = getDictionary(locale);
  const s = pages.search;

  const result = await fetchSearch({ q, locale });
  const items = result.data;

  return (
    <PageShell
      active=""
      locale={locale}
      mainClassName="mx-auto w-full max-w-[900px] px-6 pt-8 max-[920px]:px-4"
    >
      <h1 className="m-0 mb-4 text-[36px] uppercase tracking-[.02em]">{s.title}</h1>

      {/* GET-форма без JS: сабмит перезагружает /{locale}/search?q=… */}
      <form role="search" method="get" className="flex items-center gap-2">
        <input
          className="input min-h-[42px] flex-1 text-[15px]"
          type="search"
          name="q"
          defaultValue={q}
          placeholder={common.header.searchPlaceholder}
          aria-label={common.header.searchPlaceholder}
          autoFocus
        />
        <button type="submit" className="btn btn-primary min-h-[42px] px-5">
          {s.submit}
        </button>
      </form>

      {q.length < 2 ? (
        <p className="mt-8 text-[14px]" style={{ color: muted(60) }}>
          {s.promptShort}
        </p>
      ) : items.length === 0 ? (
        <p className="mt-8 text-[14px]" style={{ color: muted(60) }}>
          {s.emptyPrefix} «{q}».
        </p>
      ) : (
        <>
          <p className="mb-2 mt-6 text-xs" style={{ color: muted(55) }}>
            {s.resultsPrefix} «{q}» · {result.meta.total}
          </p>
          <div role="list">
            {items.map((it) => (
              <Link
                key={`${it.type}:${it.path}`}
                href={it.path}
                role="listitem"
                className="row-link block border-b border-[var(--color-divider)] py-4"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="flex flex-wrap items-center gap-2.5">
                  <span className="tag tag-neutral flex-none">
                    {s.typeLabels[it.type]}
                  </span>
                  {it.published_at && (
                    <span className="text-[11.5px]" style={{ color: muted(50) }}>
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
            ))}
          </div>
        </>
      )}
    </PageShell>
  );
}
