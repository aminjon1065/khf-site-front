"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "@/components/i18n/LocaleLink";
import TjRiskMap from "@/components/public/TjRiskMap";
import type { ApiRegionStatus } from "@/lib/api";
import { muted } from "@/components/public/ui";
import { localeFromPathname } from "@/lib/i18n/config";
import {
  regionOrder,
  regionNames,
  levelStatusTexts,
  levelDotColor,
  levelMapFill,
  legendItems,
  countLabel,
} from "@/lib/levels";
import type { AlertLevel, RegionStatus } from "@/lib/types";
import { getMap } from "./content";
import { uniqueAlerts, type LiveIncident } from "./incidents";

export type { LiveIncident };

const ALL = "Все";

// Ранг уровней для выбора наивысшего уровня региона из его событий.
const rank: Record<AlertLevel, number> = {
  none: 0,
  info: 1,
  warning: 2,
  danger: 3,
  critical: 4,
};

/**
 * Интерактивная часть страницы карты: фильтр по типу риска (aria-pressed),
 * SVG-карта регионов и доступный список событий. Данные (incidents) приходят
 * из CMS; фильтр управляет и заливкой карты, и списком, и счётчиком.
 */
export default function MapExplorer({
  incidents,
  baseline = [],
}: {
  incidents: LiveIncident[];
  /** Базовые статусы регионов из CMS: уровень, выставленный редактором. */
  baseline?: ApiRegionStatus[];
}) {
  const locale = localeFromPathname(usePathname());
  const map = getMap(locale);
  const [kind, setKind] = useState<string>(ALL);

  const kinds = useMemo<string[]>(
    () => [ALL, ...Array.from(new Set(incidents.map((i) => i.kind)))],
    [incidents],
  );

  // Для заливки карты нужна запись на каждый затронутый регион, а для списка
  // и счётчика — на каждое предупреждение. Раньше в списке использовался тот же
  // развёрнутый массив: предупреждение по трём регионам давало три одинаковых
  // строки (поле `region` у всех копий одно и то же) и утраивало счётчик, а
  // республиканское (`territory_type=country`) — пять строк и «5 событий».
  const list = incidents.filter((i) => kind === ALL || i.kind === kind);
  const alertsInView = uniqueAlerts(list);

  const baseByKey = new Map(baseline.map((r) => [r.key, r]));
  const names = regionNames(locale);
  const statuses = levelStatusTexts(locale);

  // Уровень и число событий по каждому региону из отфильтрованного списка.
  const mapRegions: RegionStatus[] = regionOrder.map((k) => {
    const rs = list.filter((i) => i.regionKey === k);
    const fromIncidents = rs.reduce<AlertLevel>(
      (top, i) => (rank[i.level] > rank[top] ? i.level : top),
      "none",
    );
    const base = baseByKey.get(k);
    // Базовый уровень региона учитывается только без фильтра: он относится к
    // обстановке в целом, а не к выбранному типу риска, и под фильтром
    // «сель» пометка о лавинной опасности вводила бы в заблуждение.
    const level: AlertLevel =
      kind === ALL && base && rank[base.level] > rank[fromIncidents]
        ? base.level
        : fromIncidents;

    return {
      key: k,
      // Название из CMS приоритетнее: оно локализовано редакцией.
      name: base?.name || names[k],
      level,
      count: rs.length,
      statusText: statuses[level],
    };
  });

  const kindLabel = kind === ALL ? map.allFilter : kind;
  const countLine =
    alertsInView.length > 0
      ? `${alertsInView.length} ${countLabel(locale, alertsInView.length)} · ${map.countFilterPrefix} ${kindLabel}`
      : `${map.countFilterPrefix} ${kindLabel}`;

  return (
    <>
      {/* Фильтр по типу риска */}
      <div className="flex flex-wrap items-center gap-[14px] py-4">
        <span
          className="text-xs uppercase tracking-[.08em]"
          style={{ color: muted(55) }}
        >
          {map.filterLabel}
        </span>
        <div
          role="group"
          aria-label={map.filterGroupAria}
          className="flex flex-wrap gap-1.5"
        >
          {kinds.map((c) => {
            const active = c === kind;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setKind(c)}
                aria-pressed={active}
                className="btn px-[14px] py-1.5 text-[13px] hover:border-[var(--color-accent)]"
                style={{
                  background: active
                    ? "var(--color-accent-solid)"
                    : "transparent",
                  color: active ? "var(--color-bg)" : "var(--color-text)",
                }}
              >
                {c === ALL ? map.allFilter : c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Карта + доступный список событий */}
      <div className="grid grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)] items-start gap-7 max-[920px]:grid-cols-1">
        <div className="blueprint p-3.5">
          <TjRiskMap regions={mapRegions} height={520} />
          <div
            className="mt-3 flex flex-wrap gap-4 border-t border-[var(--color-divider)] px-2 pb-1 pt-3 text-xs"
            aria-label={map.legendAria}
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

        <aside className="min-w-0">
          <h2 className="m-0 mb-1 text-xl uppercase tracking-[.02em]">
            {map.incidentsTitle}
          </h2>
          <p className="m-0 mb-2 text-xs" style={{ color: muted(50) }}>
            {countLine}
          </p>

          {alertsInView.length > 0 ? (
            <ul
              className="m-0 list-none p-0"
              aria-label={map.incidentsListAria}
            >
              {alertsInView.map((i) => (
                <li key={i.slug}>
                  <Link
                    href={`/alerts/${i.slug}`}
                    className="row-link block border-b border-[var(--color-divider)] py-3"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <span className="flex items-center gap-2 text-[11px]">
                      <span
                        className="h-2 w-2 flex-none rounded-full"
                        style={{ background: levelDotColor[i.level] }}
                      />
                      <span
                        className="uppercase tracking-[.06em]"
                        style={{ color: muted(55) }}
                      >
                        {i.kind} · {i.time}
                      </span>
                    </span>
                    <span className="mt-[3px] block text-[15.5px] font-semibold leading-[1.25] [font-family:var(--font-heading)]">
                      {i.title}
                    </span>
                    <span
                      className="mt-0.5 block text-[12.5px]"
                      style={{ color: muted(58) }}
                    >
                      {i.region}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="border border-dashed border-[var(--color-divider)] px-4 py-7 text-center">
              <p className="m-0 mb-1 text-base font-semibold [font-family:var(--font-heading)]">
                {map.empty.title}
              </p>
              <p className="m-0 text-[12.5px]" style={{ color: muted(60) }}>
                {map.empty.text}
              </p>
            </div>
          )}

          <div className="blueprint mt-5 flex flex-col gap-1.5 p-4">
            <h2 className="m-0 kicker-heading" style={{ color: muted(55) }}>
              {map.howToRead.title}
            </h2>
            <p
              className="m-0 text-[12.5px] leading-[1.55]"
              style={{ color: muted(65) }}
            >
              {map.howToRead.text}
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
