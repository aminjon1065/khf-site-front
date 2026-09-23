import Link from "@/components/i18n/LocaleLink";
import CmsProse from "@/components/public/CmsProse";
import PageShell from "@/components/public/PageShell";
import { BreadcrumbJsonLd } from "@/components/public/JsonLd";
import { Breadcrumbs, ImageSlot, muted } from "@/components/public/ui";
import type { Metadata } from "next";
import { fetchLeadership, fetchTranslatedPage } from "@/lib/api";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes, type CanonicalCmsPageSlug } from "@/lib/routes";
import { buildMetadata, metaDescription } from "@/lib/seo";
import { getLeadership } from "./content";

// Заголовок, вводный текст и SEO — из CMS-страницы `leadership`; без неё (нет,
// не переведена, CMS молчит) — встроенная рамка из content.ts.
const SLUG = "leadership" satisfies CanonicalCmsPageSlug;

// ISR: состав руководства перечитывается из CMS не чаще раза в минуту (C-1a).
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { common, pages } = getDictionary(locale);
  const page = await fetchTranslatedPage(SLUG, locale);
  const seoDescription = page?.seo?.description?.trim();
  return buildMetadata({
    locale,
    title: page?.seo?.title?.trim() || pages.meta.leadership,
    description: seoDescription ? metaDescription(seoDescription) : undefined,
    path: routes.leadership,
    siteName: common.siteShort,
  });
}

export default async function LeadershipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = toLocale((await params).locale);
  const leadership = getLeadership(locale);
  const { pages } = getDictionary(locale);
  const { chairmanActions, deputiesTitle, footerNote } = leadership;

  const [roster, page] = await Promise.all([
    fetchLeadership(locale),
    fetchTranslatedPage(SLUG, locale),
  ]);
  const chairman = roster.find((l) => l.is_chairman) ?? null;
  const deputies = roster.filter((l) => !l.is_chairman);
  const title = page?.title?.trim() || leadership.title;

  return (
    <PageShell
      mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-8 max-[920px]:px-4"
    >
      <BreadcrumbJsonLd items={leadership.breadcrumbs} locale={locale} />
      <Breadcrumbs items={leadership.breadcrumbs} />

      <div className="border-b border-[var(--color-divider)] pb-[14px]">
        <h1 className="page-title page-title-caps">{title}</h1>
      </div>

      {/* Вводный текст раздела есть только в CMS; пустое тело CmsProse не
          рисует — тогда блока нет, как и раньше. */}
      {page && (
        <CmsProse
          body={page.body}
          variant="intro"
          className="mt-5 max-w-[68ch]"
        />
      )}

      {/* Председатель — одна широкая карточка. Может отсутствовать, пока в CMS
          не отмечен ни один председатель — раздел тогда просто не выводится. */}
      {chairman && (
        <section aria-label={pages.leadership.chairmanAria} className="mt-7">
          <article className="blueprint grid min-w-0 grid-cols-[minmax(0,340px)_minmax(0,1fr)] max-[920px]:grid-cols-1">
            <span className="block min-h-[340px]">
              <ImageSlot src={chairman.photo_url ?? undefined} duotone />
            </span>
            <span className="flex min-w-0 flex-col gap-2.5 px-7 py-[26px]">
              <span
                className="text-[11px] uppercase tracking-[.1em]"
                style={{ color: "var(--color-accent-700)" }}
              >
                {chairman.role}
              </span>
              <span className="text-[30px] font-semibold leading-[1.1] [font-family:var(--font-heading)]">
                {chairman.name}
              </span>
              {chairman.meta && (
                <span className="text-[13px]" style={{ color: muted(60) }}>
                  {chairman.meta}
                </span>
              )}
              {chairman.bio && (
                <span
                  className="max-w-[64ch] text-sm leading-[1.6]"
                  style={{ color: muted(75) }}
                >
                  {chairman.bio}
                </span>
              )}
              <span className="mt-auto flex flex-wrap gap-3 pt-3">
                {chairmanActions.map((a) => (
                  <Link
                    key={a.label}
                    href={a.href}
                    className={`btn btn-${a.variant} text-[13px]`}
                  >
                    {a.label}
                  </Link>
                ))}
              </span>
            </span>
          </article>
        </section>
      )}

      {/* Первый зам + замы */}
      <section aria-label={pages.leadership.deputiesAria} className="mt-8">
        <div className="mb-5 flex items-baseline gap-[14px] border-b border-[var(--color-divider)] pb-2.5">
          <h2 className="m-0 text-[23px] uppercase tracking-[.02em]">
            {deputiesTitle}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-[14px] max-[920px]:grid-cols-1">
          {deputies.map((l) => (
            <article
              key={l.id}
              className="blueprint flex min-w-0 flex-col"
            >
              <span className="block h-[240px]">
                <ImageSlot src={l.photo_url ?? undefined} duotone />
              </span>
              <span className="flex flex-col gap-1 px-4 pb-4 pt-[14px]">
                <span
                  className="text-[10.5px] uppercase tracking-[.1em]"
                  style={{ color: "var(--color-accent-700)" }}
                >
                  {l.role}
                </span>
                <span className="text-[18px] font-semibold leading-[1.2] [font-family:var(--font-heading)]">
                  {l.name}
                </span>
                {l.bio && (
                  <span
                    className="text-[12.5px] leading-[1.5]"
                    style={{ color: muted(62) }}
                  >
                    {l.bio}
                  </span>
                )}
              </span>
            </article>
          ))}
        </div>

        <p className="mt-[14px] text-[12.5px]" style={{ color: muted(55) }}>
          {footerNote.before}
          <Link
            href={footerNote.linkHref}
            style={{ color: "var(--color-accent-700)" }}
          >
            {footerNote.linkLabel}
          </Link>
          {footerNote.after}
        </p>
      </section>
    </PageShell>
  );
}
