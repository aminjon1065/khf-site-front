"use client";

import { useEffect, useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { RegionStatus } from "@/lib/types";
import {
  levelMapFill,
  regionKeyOfHc,
  regionShort,
  countLabel,
} from "@/lib/levels";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFeature = any;

/**
 * Интерактивная SVG-карта регионов Таджикистана (d3-geo + Highcharts TopoJSON,
 * WGS84). TopoJSON вендорится локально (/geo/tj-all.topo.json). Регионы
 * сопоставляются по стабильному hc-key. Состояния: загрузка / ошибка (со
 * ссылкой на список) / карта.
 */
export default function TjRiskMap({
  regions = [],
  height = 480,
  showLabels = true,
}: {
  regions?: RegionStatus[];
  height?: number;
  showLabels?: boolean;
}) {
  const [features, setFeatures] = useState<AnyFeature | null>(null);
  const [error, setError] = useState(false);
  const [hover, setHover] = useState<string | null>(null);

  const W = 960;
  const H = Math.round((height / 480) * 560);

  useEffect(() => {
    let dead = false;
    fetch("/geo/tj-all.topo.json")
      .then((r) => {
        if (!r.ok) throw new Error("http " + r.status);
        return r.json();
      })
      .then((topo) => {
        if (dead) return;
        const objName = Object.keys(topo.objects)[0];
        setFeatures(feature(topo, topo.objects[objName]));
      })
      .catch(() => {
        if (!dead) setError(true);
      });
    return () => {
      dead = true;
    };
  }, []);

  const byKey = useMemo(() => {
    const m: Record<string, RegionStatus> = {};
    regions.forEach((r) => (m[r.key] = r));
    return m;
  }, [regions]);

  const built = useMemo(() => {
    if (!features) return null;
    const projection = geoMercator().fitExtent(
      [
        [16, 16],
        [W - 16, H - 16],
      ],
      features
    );
    const path = geoPath(projection);
    const shapes = features.features.map((f: AnyFeature, i: number) => ({
      f,
      i,
      key: regionKeyOfHc(f.properties && f.properties["hc-key"]),
    }));
    const labels: Record<string, { c: [number, number]; area: number }> = {};
    shapes.forEach((s: { f: AnyFeature; key: string }) => {
      const c = path.centroid(s.f) as [number, number];
      const a = path.area(s.f);
      if (!labels[s.key] || a > labels[s.key].area) labels[s.key] = { c, area: a };
    });
    return { path, shapes, labels };
  }, [features, H]);

  if (error) {
    return (
      <div
        role="note"
        style={{
          padding: 32,
          textAlign: "center",
          fontSize: 13,
          color: "color-mix(in srgb, var(--color-text) 60%, transparent)",
        }}
      >
        Не удалось загрузить карту. Сведения по регионам доступны в списке ниже.
      </div>
    );
  }

  if (!built) {
    return (
      <div
        aria-busy="true"
        style={{
          height,
          display: "grid",
          placeItems: "center",
          fontSize: 13,
          color: "color-mix(in srgb, var(--color-text) 50%, transparent)",
        }}
      >
        Загрузка карты…
      </div>
    );
  }

  const { path, shapes, labels } = built;

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Карта Республики Таджикистан с уровнями опасности по регионам"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        {shapes.map((s: { f: AnyFeature; i: number; key: string }) => {
          const data = byKey[s.key];
          const level = (data && data.level) || "none";
          const isHover = hover === s.key;
          return (
            <path
              key={s.i}
              d={path(s.f) || undefined}
              fill={levelMapFill[level] || levelMapFill.none}
              stroke={
                isHover
                  ? "var(--color-accent-700)"
                  : "color-mix(in srgb, var(--color-text) 40%, transparent)"
              }
              strokeWidth={isHover ? 1.8 : 0.8}
              style={{ cursor: "pointer", transition: "stroke .15s" }}
              onMouseEnter={() => setHover(s.key)}
              onMouseLeave={() => setHover(null)}
            >
              <title>{data ? `${data.name}: ${data.statusText}` : s.key}</title>
            </path>
          );
        })}
        {showLabels &&
          Object.entries(labels).map(([key, l]) => {
            const data = byKey[key];
            return (
              <g key={key} style={{ pointerEvents: "none" }}>
                <text
                  x={l.c[0]}
                  y={l.c[1]}
                  textAnchor="middle"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 17,
                    fontWeight: 600,
                    fill: "var(--color-text)",
                    letterSpacing: ".02em",
                  }}
                >
                  {regionShort[key as RegionStatus["key"]] ?? key}
                </text>
                {data && data.count > 0 && (
                  <text
                    x={l.c[0]}
                    y={l.c[1] + 20}
                    textAnchor="middle"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 12.5,
                      fill: "color-mix(in srgb, var(--color-text) 65%, transparent)",
                    }}
                  >
                    {data.count} {countLabel(data.count)}
                  </text>
                )}
              </g>
            );
          })}
      </svg>
      {hover && byKey[hover] && (
        <div
          style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            padding: "8px 12px",
            background: "var(--color-bg)",
            border: "1px solid var(--color-divider)",
            fontSize: 12.5,
            boxShadow: "var(--shadow-sm)",
            pointerEvents: "none",
            maxWidth: 280,
          }}
        >
          <strong
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 14,
              display: "block",
            }}
          >
            {byKey[hover].name}
          </strong>
          <span>{byKey[hover].statusText}</span>
        </div>
      )}
    </div>
  );
}
