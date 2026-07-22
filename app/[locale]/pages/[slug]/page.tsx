import Link from "@/components/i18n/LocaleLink";
import { notFound } from "next/navigation";
import PageShell from "@/components/public/PageShell";
import { muted } from "@/components/public/ui";
import { fetchPage, fetchPages } from "@/lib/api";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

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
  const pages = getDictionary(toLocale(locale)).pages;
  const page = await fetchPage(slug, toLocale(locale));

  return { title: page?.title ?? pages.meta.pageFallback };
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = toLocale(rawLocale);
  const page = await fetchPage(slug, locale);

  if (!page) {
    notFound();
  }

  const { common, pages } = getDictionary(locale);

  const paragraphs = (page.body ?? "")
    .split(/\n{2,}|\r?\n/)
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <PageShell
      locale={locale}
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

        {paragraphs.length > 0 ? (
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
