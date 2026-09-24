import type { Metadata } from "next";
import PageShell from "@/components/public/PageShell";
import SituationAsOf from "@/components/public/SituationAsOf";
import { muted } from "@/components/public/ui";
import {
  fetchAlerts,
  fetchAlertsActive,
  fetchRegions,
  fetchSettings,
} from "@/lib/api";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo";
import {
  DEFAULT_STALE_AFTER_MINUTES,
  situationTime,
} from "@/lib/situation-time";
import type { RegionKey } from "@/lib/types";
import MapExplorer, { type LiveIncident } from "./MapExplorer";
import { getMap } from "./content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { common } = getDictionary(locale);
  const map = getMap(locale);

  return buildMetadata({
    locale,
    title: map.title,
    description: map.subtitle,
    path: "/map",
    siteName: common.siteShort,
  });
}

// ISR: оперативная обстановка перечитывается из CMS не чаще раза в минуту.
export const revalidate = 60;

export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = toLocale((await params).locale);
  const map = getMap(locale);
  const { common } = getDictionary(locale);
  // Кроме предупреждений на карту влияет базовый статус региона, который
  // выставляет редактор: регион может быть помечен как опасный и без активного
  // предупреждения. Раньше `/regions` не запрашивался вовсе, и такие пометки
  // на карту не попадали.
  const [alerts, baseline, active, settings] = await Promise.all([
    fetchAlerts(locale),
    fetchRegions(locale),
    // Только ради времени сверки обстановки (A-2) — тот же кэшируемый ответ,
    // что у сводки на главной и в предупреждениях.
    fetchAlertsActive(locale),
    fetchSettings(locale),
  ]);

  // null = CMS не ответила. Пустая карта с подписью «событий нет» выдавала бы
  // сбой сервиса за подтверждённое спокойствие — показываем недоступность данных.
  if (alerts === null || baseline === null) {
    return (
      <PageShell>
        <div className="page-head">
          <h1 className="page-title page-title-caps">{map.title}</h1>
          <span className="page-subtitle">
            {map.subtitle}
          </span>
        </div>
        <div
          className="mt-7 border px-6 py-14 text-center"
          style={{
            borderColor: "var(--hz-critical)",
            background: "var(--hz-critical-bg)",
          }}
          role="status"
        >
          <p className="m-0 mb-1 text-lg font-semibold [font-family:var(--font-heading)]">
            {map.unavailable.title}
          </p>
          <p className="m-0 text-[13px]" style={{ color: muted(60) }}>
            {map.unavailable.text}
          </p>
        </div>
      </PageShell>
    );
  }

  // Каждое предупреждение раскрывается в событие по каждому затронутому региону.
  const incidents: LiveIncident[] = alerts.flatMap((a) =>
    a.region_codes.map((code) => ({
      kind: a.hazard_label,
      level: a.level,
      time: a.datetime ?? "",
      title: a.title,
      region: a.region,
      regionKey: code as RegionKey,
      slug: a.slug,
    })),
  );

  const asOf = active ? situationTime(active.updated_at, locale) : null;

  return (
    <PageShell>
      <div className="page-head">
        <h1 className="page-title page-title-caps">{map.title}</h1>
        <span className="page-subtitle">
          {map.subtitle}
        </span>
      </div>
      {asOf && (
        <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <SituationAsOf
            label={common.situation.asOf}
            dateTime={asOf.dateTime}
            text={asOf.text}
            staleAfterMinutes={
              settings?.situation?.stale_after_minutes ??
              DEFAULT_STALE_AFTER_MINUTES
            }
            outdatedText={common.situation.outdated}
            className="text-xs [font-variant-numeric:tabular-nums]"
            style={{ color: muted(70) }}
          />
        </div>
      )}

      <MapExplorer incidents={incidents} baseline={baseline} />
    </PageShell>
  );
}
