import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import Link from "@/components/i18n/LocaleLink";
import { notFound } from "next/navigation";
import FetchErrorFallback from "@/components/public/FetchErrorFallback";
import PageShell from "@/components/public/PageShell";
import { BreadcrumbJsonLd } from "@/components/public/JsonLd";
import { Breadcrumbs, muted } from "@/components/public/ui";
import { fetchAnnouncement, fetchAnnouncements, fetchSlugs } from "@/lib/api";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getKindMeta, getStatusMeta } from "../content";
import { routes } from "@/lib/routes";
import { buildMetadata } from "@/lib/seo";
import { isSafeExternalUrl } from "@/lib/url-safety";

export const revalidate = 60;

type Params = { locale: string; slug: string };

export async function generateStaticParams({
  params: { locale },
}: {
  params: { locale: string };
}) {
  // Пустые slug'и отсеивает сам эндпоинт: адрес без сегмента всё равно не
  // разрешился бы в маршрут.
  const slugs = await fetchSlugs("announcement", toLocale(locale));
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const loc = toLocale(locale);
  const { common, pages } = getDictionary(loc);
  // A thrown (non-404) fetch failure degrades the same as "not found" here —
  // metadata has no meaningful title to offer either way. The page body's
  // own fetch (below) is what decides notFound() vs. the error boundary.
  const a = await fetchAnnouncement(slug, loc).catch(() => null);
  if (!a) {
    return { title: pages.meta.announcementFallback, robots: { index: false } };
  }
  return buildMetadata({
    locale: loc,
    title: a.title,
    description: a.desc,
    path: `/announcements/${slug}`,
    type: "article",
    siteName: common.siteShort,
  });
}

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = toLocale(rawLocale);
  const { pages } = getDictionary(locale);
  const d = pages.announcementDetail;
  // Non-404 fetch failures are an expected-error case (see
  // FetchErrorFallback) — handled inline, not left to throw.
  let announcement;
  try {
    announcement = await fetchAnnouncement(slug, locale);
  } catch {
    return (
      <PageShell>
        <FetchErrorFallback locale={locale} />
      </PageShell>
    );
  }

  if (!announcement) {
    notFound();
  }

  const kind = getKindMeta(locale)[announcement.kind];
  const status = announcement.open ? getStatusMeta(locale).open : getStatusMeta(locale).closed;
  const applyUrl = isSafeExternalUrl(announcement.application_url)
    ? announcement.application_url
    : null;

  const { data: allAnnouncements } = await fetchAnnouncements({ locale, perPage: 50 });
  const related = allAnnouncements.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <PageShell>
      <BreadcrumbJsonLd
        items={[
          { label: d.breadcrumbHome, href: routes.home },
          { label: d.breadcrumbAnnouncements, href: routes.announcements },
          { label: announcement.title },
        ]}
        locale={locale}
      />
      <Breadcrumbs
        items={[
          { label: d.breadcrumbHome, href: routes.home },
          { label: d.breadcrumbAnnouncements, href: routes.announcements },
          { label: announcement.title },
        ]}
      />

      {/* Шапка объявления */}
      <section
        aria-label={d.aria}
        className="blueprint mt-5 flex flex-col gap-3 px-[26px] py-6"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className={`tag ${kind.tagClass}`}>{announcement.kind_label}</span>
          <span className="tag font-semibold" style={{ background: status.bg, color: status.fg }}>
            {status.label}
          </span>
          {announcement.org && <span className="tag tag-neutral">{announcement.org}</span>}
        </div>
        <h1 className="m-0 text-[32px] leading-[1.12]">{announcement.title}</h1>
        <div className="grid grid-cols-2 gap-[14px] border-t border-[var(--color-divider)] pt-[14px] max-[560px]:grid-cols-1">
          {announcement.org && (
            <div>
              <h6 className="m-0 mb-1" style={{ color: muted(55) }}>
                {d.org}
              </h6>
              <span className="text-[13.5px]">{announcement.org}</span>
            </div>
          )}
          <div>
            <h6 className="m-0 mb-1" style={{ color: muted(55) }}>
              {d.deadline}
            </h6>
            <span
              className="text-[13.5px] font-medium"
              style={{ color: announcement.open ? "var(--hz-warning)" : undefined }}
            >
              {announcement.deadline}
            </span>
          </div>
        </div>
      </section>

      <div className="mt-7 grid grid-cols-[minmax(0,1.9fr)_minmax(260px,1fr)] items-start gap-9 max-[920px]:grid-cols-1">
        {/* Основная колонка */}
        <div className="min-w-0 max-w-[74ch]">
          {announcement.desc && (
            <p className="text-[15px] leading-[1.65]">{announcement.desc}</p>
          )}
        </div>

        {/* Сайдбар */}
        <aside className="flex flex-col gap-5">
          <div className="blueprint flex flex-col gap-2.5 p-[18px]">
            {applyUrl ? (
              <>
                <a
                  href={applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-block inline-flex items-center justify-center gap-2 no-underline"
                >
                  {d.apply}
                  <ExternalLink size={14} strokeWidth={1.5} aria-hidden="true" />
                </a>
                <span className="text-[12px]" style={{ color: muted(60) }}>
                  {d.applyExternal}
                </span>
              </>
            ) : (
              <>
                <h6 className="m-0" style={{ color: muted(55) }}>
                  {d.contacts}
                </h6>
                <span className="text-[13px] leading-[1.55]" style={{ color: muted(70) }}>
                  {d.noApplyUrl}
                </span>
                <Link href={routes.contacts} className="btn btn-secondary mt-1">
                  {d.contacts}
                </Link>
              </>
            )}
          </div>

          {related.length > 0 && (
            <div>
              <h6 className="m-0 mb-2.5" style={{ color: muted(55) }}>
                {d.otherAnnouncements}
              </h6>
              {related.map((a) =>
                a.slug ? (
                  <Link
                    key={a.slug}
                    href={routes.announcement(a.slug)}
                    className="row-link block border-b border-[var(--color-divider)] py-2.5"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <span className="flex items-center gap-2 text-[11px]" style={{ color: muted(55) }}>
                      {getKindMeta(locale)[a.kind].label} · {a.deadline}
                    </span>
                    <span className="mt-[3px] block text-[15px] font-semibold [font-family:var(--font-heading)]">
                      {a.title}
                    </span>
                  </Link>
                ) : null,
              )}
            </div>
          )}
        </aside>
      </div>
    </PageShell>
  );
}
