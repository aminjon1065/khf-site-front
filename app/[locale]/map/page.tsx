import type { Metadata } from "next";
import PageShell from "@/components/public/PageShell";
import { muted } from "@/components/public/ui";
import { fetchAlerts, fetchRegions } from "@/lib/api";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo";
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
  // Кроме предупреждений на карту влияет базовый статус региона, который
  // выставляет редактор: регион может быть помечен как опасный и без активного
  // предупреждения. Раньше `/regions` не запрашивался вовсе, и такие пометки
  // на карту не попадали.
  const [alerts, baseline] = await Promise.all([
    fetchAlerts(locale),
    fetchRegions(locale),
  ]);

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

  return (
    <PageShell>
      <div className="flex flex-wrap items-baseline gap-[14px] border-b border-[var(--color-divider)] pb-[14px]">
        <h1 className="page-title page-title-caps">{map.title}</h1>
        <span className="text-xs" style={{ color: muted(50) }}>
          {map.subtitle}
        </span>
      </div>

      <MapExplorer incidents={incidents} baseline={baseline} />
    </PageShell>
  );
}
