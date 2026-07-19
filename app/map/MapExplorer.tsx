"use client";

import { useState } from "react";
import Link from "next/link";
import TjRiskMap from "@/components/public/TjRiskMap";
import { muted } from "@/components/public/ui";
import { routes } from "@/lib/routes";
import {
  regionOrder,
  regionName,
  levelStatusText,
  levelDotColor,
  levelMapFill,
  legendItems,
  countLabel,
} from "@/lib/levels";
import type { AlertLevel, RegionStatus } from "@/lib/types";
import { map, type RiskFilter } from "./content";

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
 * SVG-карта регионов и доступный список событий-альтернатива. Один источник
 * состояния (`kind`) управляет и заливкой карты, и списком, и счётчиком.
 */
export default function MapExplorer() {
  const [kind, setKind] = useState<RiskFilter>(map.allKind);

  const list = map.incidents.filter(
    (i) => kind === map.allKind || i.kind === kind
  );

  // Уровень и число событий по каждому региону из отфильтрованного списка.
  const mapRegions: RegionStatus[] = regionOrder.map((k) => {
    const rs = list.filter((i) => i.regionKey === k);
    const level = rs.reduce<AlertLevel>(
      (top, i) => (rank[i.level] > rank[top] ? i.level : top),
      "none"
    );
    return {
      key: k,
      name: regionName[k],
      level,
      count: rs.length,
      statusText: levelStatusText[level],
    };
  });

  const countLine =
    list.length > 0
      ? `${list.length} ${countLabel(list.length)} · ${map.countFilterPrefix} ${kind}`
      : `${map.countFilterPrefix} ${kind}`;

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
          {map.kinds.map((c) => {
            const active = c === kind;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setKind(c)}
                aria-pressed={active}
                className="btn px-[14px] py-1.5 text-[13px] hover:border-[var(--color-accent)]"
                style={{
                  background: active ? "var(--color-accent)" : "transparent",
                  color: active ? "var(--color-bg)" : "var(--color-text)",
                }}
              >
                {c}
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
            {legendItems.map((l) => (
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

          {list.length > 0 ? (
            <div role="list" aria-label={map.incidentsListAria}>
              {list.map((i, idx) => (
                <Link
                  key={`${i.title}-${idx}`}
                  href={routes.alert}
                  role="listitem"
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
              ))}
            </div>
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
            <h6 className="m-0" style={{ color: muted(55) }}>
              {map.howToRead.title}
            </h6>
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
