import { TriangleAlert } from "lucide-react";
import Link from "@/components/i18n/LocaleLink";
import RefreshOnVisible from "@/components/public/RefreshOnVisible";
import { muted } from "@/components/public/ui";
import { routes } from "@/lib/routes";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

/**
 * «Оперативная сводка». Четыре различимых состояния, и ни одно не выдаёт
 * молчание бэкенда за факт: недоступность данных, устаревание открытой
 * вкладки, действующие предупреждения и подтверждённое их отсутствие.
 * Голый «0» рядом со строкой «предупреждений нет» читался как
 * противоречие, поэтому число показывается только когда несёт смысл;
 * охват по регионам берётся из alerts.regions ответа CMS.
 */
export default function OpsSummary({
  unavailable,
  alertsCount,
  affectedRegions,
  watchedRegions,
  home,
}: {
  unavailable: boolean;
  alertsCount: number;
  affectedRegions: number;
  watchedRegions: number;
  home: Dictionary["home"];
}) {
  return (
    <section
      aria-label={home.ops.title}
      className="blueprint command-strip mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3 max-[560px]:flex-col max-[560px]:items-start"
    >
      <h2 className="kicker-heading m-0" style={{ color: muted(72) }}>
        {home.ops.title}
      </h2>
      {unavailable ? (
        <span
          className="inline-flex items-center gap-2 text-sm"
          style={{ color: muted(80) }}
        >
          <TriangleAlert
            size={15}
            strokeWidth={1.5}
            aria-hidden="true"
            style={{ color: "var(--hz-warning)", flex: "none" }}
          />
          {home.ops.unavailableText}
        </span>
      ) : alertsCount > 0 ? (
        <span className="inline-flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="inline-flex items-baseline gap-2">
            <span className="text-sm" style={{ color: muted(75) }}>
              {home.ops.activeLabel}
            </span>
            <span
              className="text-2xl font-semibold [font-family:var(--font-heading)]"
              style={{ color: "var(--hz-danger)" }}
            >
              {alertsCount}
            </span>
          </span>
          {affectedRegions > 0 && (
            <span
              className="text-sm [font-variant-numeric:tabular-nums]"
              style={{ color: muted(70) }}
            >
              {home.ops.affectedRegions}: {affectedRegions}
            </span>
          )}
        </span>
      ) : (
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
          <span style={{ color: muted(80) }}>{home.ops.noneText}</span>
          {watchedRegions > 0 && (
            <span
              className="[font-variant-numeric:tabular-nums]"
              style={{ color: muted(70) }}
            >
              {home.ops.watchedRegions}: {watchedRegions}
            </span>
          )}
        </span>
      )}
      <span className="flex-1" />
      {/* Открытая вкладка не получает ISR-обновления сама. При возвращении
          на неё компонент тихо перезапрашивает маршрут и на это время
          показывает здесь пометку «данные могли устареть» — четвёртое
          состояние обстановки. Без JS пометки просто нет. */}
      <RefreshOnVisible staleLabel={home.ops.staleText} />
      <Link
        href={routes.map}
        className="section-link shrink-0 text-[13px]"
        style={{ color: "var(--color-accent-700)" }}
      >
        {home.ops.mapLink}
      </Link>
    </section>
  );
}
