import Link from "@/components/i18n/LocaleLink";
import PageShell from "@/components/public/PageShell";
import { Breadcrumbs, muted } from "@/components/public/ui";
import TjRiskMap from "@/components/public/TjRiskMap";
import { fetchAlerts, fetchAlertsActive } from "@/lib/api";
import { toLocale } from "@/lib/i18n/config";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { levelDotColor } from "@/lib/levels";
import { buildMetadata } from "@/lib/seo";
import { routes } from "@/lib/routes";
import type { AlertLevel, RegionStatus } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { common, pages } = getDictionary(locale);
  return buildMetadata({ locale, title: pages.meta.alerts, path: "/alerts", siteName: common.siteShort });
}

export const revalidate = 60;

export default async function AlertsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = toLocale((await params).locale);
  const { pages } = getDictionary(locale);
  const stateChrome = {
    calm: { border: "var(--hz-success)", ...pages.alertsList.state.calm },
    warning: { border: "var(--hz-warning)", ...pages.alertsList.state.warning },
    critical: { border: "var(--hz-critical)", ...pages.alertsList.state.critical },
  };
  const [alerts, active] = await Promise.all([
    fetchAlerts(locale),
    fetchAlertsActive(locale),
  ]);

  const regions: RegionStatus[] = active.regions.map((r) => ({
    key: r.key as RegionStatus["key"],
    name: r.name,
    level: r.level,
    count: r.count,
    statusText: r.statusText,
  }));

  const chrome = stateChrome[active.state];

  return (
    <PageShell
      active="map"
      locale={locale}
      mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-6 max-[920px]:px-4"
    >
      <Breadcrumbs
        items={[
          { label: pages.alertDetail.breadcrumbHome, href: routes.home },
          { label: pages.alertsList.breadcrumb },
        ]}
      />

      {/* Сводка обстановки */}
      <section
        aria-label={pages.alertsList.situationAria}
        className="blueprint mt-5 flex flex-col gap-2 px-[26px] py-5"
        style={{ borderTop: `4px solid ${chrome.border}` }}
      >
        <div className="flex items-baseline gap-3">
          <h1 className="m-0 text-[32px] leading-[1.12]">{pages.alertsList.heading}</h1>
          <span className="text-xs" style={{ color: muted(50) }}>
            {active.count > 0
              ? `${active.count} ${pages.alertsList.activeCountSuffix}`
              : pages.alertsList.noneActive}
          </span>
        </div>
        <p
          className="m-0 max-w-[70ch] text-[14px] leading-[1.55]"
          style={{ color: muted(70) }}
        >
          <strong style={{ color: "var(--color-text)" }}>{chrome.label}.</strong>{" "}
          {chrome.text}
        </p>
      </section>

      <div className="mt-7 grid grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)] items-start gap-7 max-[920px]:grid-cols-1">
        {/* Список активных предупреждений */}
        <div className="min-w-0" role="feed" aria-label={pages.alertsList.listAria}>
          {alerts.length > 0 ? (
            alerts.map((a) => (
              <article
                key={a.slug}
                className="flex flex-col gap-2 border-b border-[var(--color-divider)] py-5"
                style={{ borderLeft: `3px solid ${levelDotColor[a.level as AlertLevel]}`, paddingLeft: 16 }}
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className="tag text-xs font-semibold uppercase tracking-[.06em]"
                    style={{
                      background: levelDotColor[a.level as AlertLevel],
                      color: "var(--color-bg)",
                    }}
                  >
                    {a.level_label}
                  </span>
                  <span
                    className="tag font-semibold"
                    style={{
                      background: "var(--hz-warning-bg)",
                      color: "var(--hz-warning)",
                    }}
                  >
                    {a.status}
                  </span>
                  <span className="tag tag-neutral">{a.hazard_label}</span>
                  <span className="flex-1" />
                  {a.datetime && (
                    <span className="text-xs" style={{ color: muted(52) }}>
                      {a.datetime}
                    </span>
                  )}
                </div>
                <h2 className="m-0 text-xl leading-[1.2]">
                  <Link
                    href={`/alerts/${a.slug}`}
                    className="text-inherit no-underline hover:text-[color:var(--color-accent-700)]"
                  >
                    {a.title}
                  </Link>
                </h2>
                <p
                  className="m-0 text-[13.5px] leading-[1.55]"
                  style={{ color: muted(65) }}
                >
                  {a.summary}
                </p>
                <span className="text-[12.5px]" style={{ color: muted(55) }}>
                  {a.region}
                </span>
              </article>
            ))
          ) : (
            <div className="border border-dashed border-[var(--color-divider)] px-6 py-14 text-center">
              <p className="m-0 mb-1 text-lg font-semibold [font-family:var(--font-heading)]">
                {pages.alertsList.emptyTitle}
              </p>
              <p className="m-0 text-[13px]" style={{ color: muted(60) }}>
                {pages.alertsList.emptyText}
              </p>
            </div>
          )}
        </div>

        {/* Боковая колонка: карта + 112 */}
        <aside className="flex min-w-0 flex-col gap-5">
          <div className="blueprint p-3">
            <h6 className="mx-1.5 mt-1 mb-2" style={{ color: muted(55) }}>
              {pages.alertsList.regionsHeading}
            </h6>
            <TjRiskMap regions={regions} height={300} showLabels={false} />
            <Link
              href={routes.map}
              className="btn btn-secondary mx-1.5 mt-2 text-[13px]"
            >
              {pages.alertsList.openMap}
            </Link>
          </div>

          <div className="blueprint flex flex-col gap-2 p-[18px]">
            <h6 className="m-0" style={{ color: muted(55) }}>
              {pages.alertsList.emergencyHelp}
            </h6>
            <a
              href="tel:112"
              className="text-[26px] font-semibold no-underline [font-family:var(--font-heading)]"
              style={{ color: "var(--hz-critical)" }}
            >
              112
            </a>
            <span className="text-[12.5px]" style={{ color: muted(62) }}>
              {pages.alertsList.emergencyNote}
            </span>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
