import { TriangleAlert } from "lucide-react";
import Link from "@/components/i18n/LocaleLink";
import RefreshOnVisible from "@/components/public/RefreshOnVisible";
import { muted } from "@/components/public/ui";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";
import { routes } from "@/lib/routes";
import { situationTime } from "@/lib/situation-time";

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
  asOf,
  locale,
  home,
}: {
  unavailable: boolean;
  alertsCount: number;
  affectedRegions: number;
  watchedRegions: number;
  /** Когда CMS сверила состояние предупреждений (alerts.updated_at). */
  asOf: string | null;
  locale: Locale;
  home: Dictionary["home"];
}) {
  // «Предупреждений нет» и «предупреждений нет по состоянию на 09:42» —
  // разные утверждения; без времени от CMS подпись просто не выводится.
  const stateTime = unavailable ? null : situationTime(asOf, locale);

  return (
    <section
      aria-label={home.ops.title}
      className="blueprint command-strip mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3.5 max-[560px]:flex-col max-[560px]:items-start"
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`h-2.5 w-2.5 flex-none rounded-full ${
            unavailable
              ? "ring-4 ring-amber-500/20"
              : alertsCount > 0
                ? "ring-4 ring-red-500/20"
                : "ring-4 ring-emerald-500/20"
          }`}
          style={{
            background: unavailable
              ? "var(--hz-warning)"
              : alertsCount > 0
                ? "var(--hz-danger)"
                : "var(--hz-success)",
          }}
          aria-hidden="true"
        />
        <h2 className="kicker-heading m-0 text-xs font-bold uppercase tracking-wider" style={{ color: muted(72) }}>
          {home.ops.title}
        </h2>
      </div>

      {unavailable ? (
        <span
          className="inline-flex items-center gap-2 text-sm text-amber-900 dark:text-amber-200"
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
              className="text-2xl font-bold [font-family:var(--font-heading)]"
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
          <span className="font-medium text-slate-800 dark:text-slate-200">{home.ops.noneText}</span>
          {watchedRegions > 0 && (
            <span
              className="text-xs text-slate-500 dark:text-slate-400 [font-variant-numeric:tabular-nums]"
            >
              ({home.ops.watchedRegions}: {watchedRegions})
            </span>
          )}
        </span>
      )}
      {stateTime && (
        <span
          className="text-xs [font-variant-numeric:tabular-nums]"
          style={{ color: muted(70) }}
        >
          {home.ops.asOf}{" "}
          <time dateTime={stateTime.dateTime}>{stateTime.text}</time>
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
        className="section-link inline-flex shrink-0 items-center gap-1 text-[13px] font-medium transition-opacity hover:opacity-80"
        style={{ color: "var(--color-accent-700)" }}
      >
        <span>{home.ops.mapLink}</span>
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
