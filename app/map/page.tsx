import PageShell from "@/components/public/PageShell";
import { muted } from "@/components/public/ui";
import MapExplorer from "./MapExplorer";
import { map } from "./content";

export const metadata = { title: map.title };

export default function MapPage() {
  return (
    <PageShell active="map">
      <div className="flex flex-wrap items-baseline gap-[14px] border-b border-[var(--color-divider)] pb-[14px]">
        <h1 className="m-0 text-[36px] uppercase tracking-[.02em]">
          {map.title}
        </h1>
        <span className="text-xs" style={{ color: muted(50) }}>
          {map.subtitle}
        </span>
        <span className="flex-1" />
        <span className="text-xs" style={{ color: muted(50) }}>
          {map.updated}
        </span>
      </div>

      <MapExplorer />
    </PageShell>
  );
}
