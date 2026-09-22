import Link from "@/components/i18n/LocaleLink";
import { SectionHeader, muted } from "@/components/public/ui";
import TjRiskMap from "@/components/public/TjRiskMap";
import { routes } from "@/lib/routes";
import {
  legendItems,
  levelBadges,
  levelDotColor,
  levelMapFill,
} from "@/lib/levels";
import type { Locale } from "@/lib/i18n/config";
import type { RegionStatus } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

/** «Обстановка по регионам»: карта + список статусов. */
export default function RegionsSection({
  regions,
  locale,
  home,
  ariaLabel,
  legendLabel,
  listLabel,
}: {
  regions: RegionStatus[];
  locale: Locale;
  home: Dictionary["home"];
  ariaLabel: string;
  legendLabel: string;
  listLabel: string;
}) {
  return (
    <section aria-label={ariaLabel} className="mt-[52px]">
      <SectionHeader as="h2" title={home.regionSection.title} />
      <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)] items-start gap-7 max-[920px]:grid-cols-1">
        <div className="blueprint p-3">
          {/* lazy: на главной карта ниже первого экрана — код d3-geo и
              вычисление геометрии не нужны до прокрутки (см. TjRiskMap).
              Геометрия блока зарезервирована обёрткой, SSR-список регионов
              рядом остаётся доступен и без графики. */}
          <TjRiskMap regions={regions} height={440} lazy />
          {/* role="group": aria-label на безролевом <div> вспомогательные
              технологии игнорируют, и легенда оставалась без имени.
              13px вместо 12: легенда расшифровывает статусы. */}
          <div
            role="group"
            className="mt-2.5 flex flex-wrap gap-4 border-t border-[var(--color-divider)] px-2 pb-1 pt-2.5 text-[13px]"
            aria-label={legendLabel}
          >
            {legendItems(locale).map((l) => (
              <span key={l.level} className="inline-flex items-center gap-1.5">
                <span
                  className="h-3 w-3 border border-[var(--color-divider)]"
                  style={{ background: levelMapFill[l.level] }}
                />
                {l.label}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <div role="list" aria-label={listLabel}>
            {regions.map((r) => {
              const badgeText = levelBadges(locale)[r.level];
              const isDuplicate =
                r.statusText.trim().toLowerCase() === badgeText?.trim().toLowerCase();
              const tagClass =
                r.level === "none"
                  ? "tag-calm"
                  : r.level === "warning"
                    ? "tag-warning"
                    : r.level === "danger" || r.level === "critical"
                      ? "tag-danger"
                      : "tag-neutral";

              return (
                <div
                  key={r.key}
                  role="listitem"
                  className="flex items-center gap-3 border-b border-[var(--color-divider)] px-0.5 py-3 transition-colors hover:bg-[var(--color-surface)]/50"
                >
                  <span
                    className="h-2.5 w-2.5 flex-none rounded-full"
                    style={{ background: levelDotColor[r.level] }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold [font-family:var(--font-heading)]">
                      {r.name}
                    </span>
                    {!isDuplicate && (
                      <span className="text-[13px]" style={{ color: muted(58) }}>
                        {r.statusText}
                      </span>
                    )}
                  </span>
                  <span className={`tag ${tagClass} flex-none text-xs font-semibold`}>
                    {badgeText}
                  </span>
                </div>
              );
            })}
          </div>
          <Link href={routes.map} className="btn btn-secondary mt-[14px] self-start">
            {home.regionSection.openFull}
          </Link>
        </div>
      </div>
    </section>
  );
}
