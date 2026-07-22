import type { Metadata } from "next";
import Link from "@/components/i18n/LocaleLink";
import { notFound } from "next/navigation";
import PageShell from "@/components/public/PageShell";
import { Breadcrumbs, muted } from "@/components/public/ui";
import TjRiskMap from "@/components/public/TjRiskMap";
import { fetchAlert, fetchAlerts } from "@/lib/api";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import {
  levelDotColor,
  levelStatusText,
  regionName,
  regionOrder,
} from "@/lib/levels";
import { routes } from "@/lib/routes";
import { buildMetadata } from "@/lib/seo";
import type { AlertLevel, RegionStatus } from "@/lib/types";
import ShareButton from "../ShareButton";

export const revalidate = 60;

type Params = { locale: string; slug: string };

export async function generateStaticParams({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const alerts = await fetchAlerts(toLocale(locale));
  // Отсекаем записи без slug: один битый slug не должен ронять весь маршрут.
  return alerts
    .filter((a): a is typeof a & { slug: string } => Boolean(a.slug))
    .map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const loc = toLocale(locale);
  const { common, pages } = getDictionary(loc);
  const a = await fetchAlert(slug, loc);
  if (!a) {
    return { title: pages.meta.alertFallback, robots: { index: false } };
  }
  return buildMetadata({
    locale: loc,
    title: a.title,
    description: a.summary,
    path: `/alerts/${slug}`,
    type: "article",
    publishedTime: a.datetime,
    siteName: common.siteShort,
  });
}

export default async function AlertDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = toLocale(rawLocale);
  const { pages } = getDictionary(locale);
  const alert = await fetchAlert(slug, locale);

  if (!alert) {
    notFound();
  }

  const level = alert.level as AlertLevel;
  const accent = levelDotColor[level];
  const steps = alert.instructions ?? [];
  const paragraphs = (alert.body ?? "")
    .split(/\r?\n{2,}|\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Карта зоны действия: регионы предупреждения — в цвете уровня, прочие — штатно.
  const zoneCodes = new Set(
    alert.territory_type === "country"
      ? regionOrder
      : (alert.regions ?? []).map((r) => r.code),
  );
  const zoneRegions: RegionStatus[] = regionOrder.map((k) => {
    const inZone = zoneCodes.has(k);
    const lvl: AlertLevel = inZone ? level : "none";
    return {
      key: k,
      name: regionName[k],
      level: lvl,
      count: inZone ? 1 : 0,
      statusText: levelStatusText[lvl],
    };
  });

  const related = (await fetchAlerts(locale))
    .filter((a) => a.slug !== slug)
    .slice(0, 3);

  return (
    <PageShell
      active="map"
      locale={locale}
      mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-6 max-[920px]:px-4"
    >
      <Breadcrumbs
        items={[
          { label: pages.alertDetail.breadcrumbHome, href: routes.home },
          { label: pages.alertDetail.breadcrumbAlerts, href: routes.alert },
          { label: alert.title },
        ]}
      />

      {/* Шапка предупреждения */}
      <section
        aria-label={pages.alertDetail.aria}
        className="blueprint mt-5 flex flex-col gap-[14px] px-[26px] py-6"
        style={{ borderTop: `4px solid ${accent}` }}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className="tag text-xs font-bold uppercase tracking-[.08em]"
            style={{ background: accent, color: "var(--color-bg)", padding: "5px 12px" }}
          >
            {alert.level_label}
          </span>
          <span
            className="tag font-semibold"
            style={{ background: "var(--hz-warning-bg)", color: "var(--hz-warning)" }}
          >
            {alert.status}
          </span>
          <span className="tag tag-neutral">{alert.hazard_label}</span>
          <span className="flex-1" />
          <ShareButton idle={pages.alertDetail.share} copied={pages.alertDetail.shared} />
        </div>

        <h1 className="m-0 text-[32px] leading-[1.12]">{alert.title}</h1>

        {alert.meta && alert.meta.length > 0 && (
          <div className="flex flex-wrap gap-6 text-[13px]" style={{ color: muted(62) }}>
            {alert.meta.map((m) => (
              <span key={m.label}>
                <strong style={{ color: "var(--color-text)" }}>{m.label}:</strong>{" "}
                {m.value}
              </span>
            ))}
          </div>
        )}
      </section>

      <div className="mt-7 grid grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)] items-start gap-7 max-[920px]:grid-cols-1">
        {/* Основная колонка */}
        <div className="min-w-0">
          {steps.length > 0 && (
            <section
              aria-label={pages.alertDetail.whatToDo}
              className="blueprint px-6 py-[22px]"
              style={{ background: "color-mix(in srgb,var(--hz-warning) 8%,transparent)" }}
            >
              <h2 className="mt-0 mb-[14px] text-[22px] uppercase tracking-[.02em]">
                {pages.alertDetail.whatToDo}
              </h2>
              <ol className="m-0 flex list-none flex-col gap-3 p-0">
                {steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-[14px]">
                    <span
                      className="min-w-[28px] text-xl font-semibold [font-family:var(--font-heading)]"
                      style={{ color: "var(--hz-warning)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[14.5px] leading-[1.5]">{step}</span>
                  </li>
                ))}
              </ol>
              <Link href={routes.guides} className="btn btn-secondary mt-4">
                {pages.alertDetail.guidesLink}
              </Link>
            </section>
          )}

          {paragraphs.length > 0 && (
            <section aria-label={pages.alertDetail.officialDescription} className="mt-7 max-w-[70ch]">
              <h2 className="text-[22px] uppercase tracking-[.02em]">
                {pages.alertDetail.officialInfo}
              </h2>
              {paragraphs.map((p, i) => (
                <p key={i} className="text-[15px] leading-[1.65]">
                  {p}
                </p>
              ))}
            </section>
          )}
        </div>

        {/* Боковая колонка */}
        <aside className="flex min-w-0 flex-col gap-5">
          <div className="blueprint p-3">
            <h6 className="mx-1.5 mt-1 mb-2" style={{ color: muted(55) }}>
              {pages.alertDetail.zone}
            </h6>
            <TjRiskMap regions={zoneRegions} height={300} showLabels={false} />
          </div>

          <div className="blueprint flex flex-col gap-2 p-[18px]">
            <h6 className="m-0" style={{ color: muted(55) }}>
              {pages.alertDetail.emergencyHelp}
            </h6>
            <a
              href="tel:112"
              className="text-[26px] font-semibold no-underline [font-family:var(--font-heading)]"
              style={{ color: "var(--hz-critical)" }}
            >
              112
            </a>
            {alert.contacts && (
              <span className="text-[12.5px]" style={{ color: muted(62) }}>
                {alert.contacts}
              </span>
            )}
          </div>

          {related.length > 0 && (
            <div>
              <h6 className="m-0 mb-2.5" style={{ color: muted(55) }}>
                {pages.alertDetail.related}
              </h6>
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/alerts/${r.slug}`}
                  className="row-link block border-b border-[var(--color-divider)] py-2.5"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <span className="flex items-center gap-2 text-[11px]">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: levelDotColor[r.level as AlertLevel] }}
                    />
                    <span style={{ color: muted(55) }}>
                      {r.hazard_label} · {r.status}
                    </span>
                  </span>
                  <span className="mt-[3px] block text-[15px] font-semibold [font-family:var(--font-heading)]">
                    {r.title}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>
    </PageShell>
  );
}
