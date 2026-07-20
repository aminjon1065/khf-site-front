import PageShell from "@/components/public/PageShell";
import { muted } from "@/components/public/ui";
import { fetchAlerts } from "@/lib/api";
import type { RegionKey } from "@/lib/types";
import MapExplorer, { type LiveIncident } from "./MapExplorer";
import { map } from "./content";

export const metadata = { title: map.title };

// ISR: оперативная обстановка перечитывается из CMS не чаще раза в минуту.
export const revalidate = 60;

export default async function MapPage() {
  const alerts = await fetchAlerts();

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
    <PageShell active="map">
      <div className="flex flex-wrap items-baseline gap-[14px] border-b border-[var(--color-divider)] pb-[14px]">
        <h1 className="m-0 text-[36px] uppercase tracking-[.02em]">
          {map.title}
        </h1>
        <span className="text-xs" style={{ color: muted(50) }}>
          {map.subtitle}
        </span>
      </div>

      <MapExplorer incidents={incidents} />
    </PageShell>
  );
}
