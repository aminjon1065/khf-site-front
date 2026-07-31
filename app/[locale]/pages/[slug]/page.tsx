import Link from "@/components/i18n/LocaleLink";
import { notFound } from "next/navigation";
import FetchErrorFallback from "@/components/public/FetchErrorFallback";
import PageShell from "@/components/public/PageShell";
import { muted } from "@/components/public/ui";
import { fetchPage, fetchPages } from "@/lib/api";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateStaticParams({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const pages = await fetchPages(toLocale(locale));
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const loc = toLocale(locale);
  const { common, pages } = getDictionary(loc);
  // A thrown (non-404) fetch failure degrades the same as "not found" here —
  // metadata has no meaningful title to offer either way. The page body's
  // own fetch (below) is what decides notFound() vs. the error boundary.
  const page = await fetchPage(slug, loc).catch(() => null);
  if (!page) {
    return { title: pages.meta.pageFallback, robots: { index: false } };
  }
  return buildMetadata({
    locale: loc,
    title: page.seo?.title ?? page.title,
    description: page.seo?.description,
    path: `/pages/${slug}`,
    type: "article",
    modifiedTime: page.updated_at,
    siteName: common.siteShort,
  });
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = toLocale(rawLocale);
  // Non-404 fetch failures are an expected-error case (see
  // FetchErrorFallback) — handled inline, not left to throw.
  let page;
  try {
    page = await fetchPage(slug, locale);
  } catch {
    return (
      <PageShell
        mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-6 max-[920px]:px-4"
      >
        <FetchErrorFallback locale={locale} />
      </PageShell>
    );
  }

  if (!page) {
    notFound();
  }

  const { common, pages } = getDictionary(locale);

  // Тело страницы — санитайзенный HTML из Tiptap-редактора CMS (профиль mews/
  // purifier). Новые страницы = HTML → выводим как есть; у старых простой текст —
  // разбиваем на абзацы (fallback). Санитайзинг выполнен на стороне CMS при записи.
  const bodyHtml = page.body ?? "";
  const bodyIsHtml = /<[a-z][\s\S]*>/i.test(bodyHtml);
  const paragraphs = bodyHtml
    .split(/\n{2,}|\r?\n/)
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <PageShell
      mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-6 max-[920px]:px-4"
    >
      <nav className="text-[12.5px]" style={{ color: muted(55) }} aria-label={pages.contentPage.breadcrumbAria}>
        <Link href="/" style={{ color: "var(--color-accent-700)" }}>
          {common.breadcrumbHome}
        </Link>
        {" · "}
        <span>{page.title}</span>
      </nav>

      <article className="mt-5 max-w-[72ch]">
        <h1 className="m-0 text-[32px] leading-[1.14] max-[560px]:text-[26px]">
          {page.title}
        </h1>
        {page.updated && (
          <p
            className="mb-6 mt-2 border-b border-[var(--color-divider)] pb-3 text-[12.5px]"
            style={{ color: muted(55) }}
          >
            {pages.contentPage.updated} {page.updated}
          </p>
        )}

        {bodyIsHtml ? (
          <div
            className="article-prose"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        ) : paragraphs.length > 0 ? (
          paragraphs.map((text, i) => (
            <p key={i} className="mb-4 text-[15px] leading-[1.7]">
              {text}
            </p>
          ))
        ) : (
          <p className="text-[15px] leading-[1.7]" style={{ color: muted(60) }}>
            {pages.contentPage.placeholder}
          </p>
        )}
      </article>
    </PageShell>
  );
}
