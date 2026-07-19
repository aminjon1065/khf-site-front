import type { AlertLevel, RegionKey } from "@/lib/types";

// Семантическая шкала опасности — единый источник цветов, подписей и заливок.
// Правило: красный только для danger/critical; уровень всегда дублируется текстом.

export const levelDotColor: Record<AlertLevel, string> = {
  none: "var(--hz-success)",
  info: "var(--hz-info)",
  warning: "var(--hz-warning)",
  danger: "var(--hz-danger)",
  critical: "var(--hz-critical)",
};

export const levelBadge: Record<AlertLevel, string> = {
  none: "штатно",
  info: "инфо",
  warning: "внимание",
  danger: "опасно",
  critical: "критично",
};

export const levelStatusText: Record<AlertLevel, string> = {
  none: "Обстановка штатная",
  info: "Информационное уведомление",
  warning: "Действует предупреждение",
  danger: "Опасная обстановка",
  critical: "Критическая ситуация",
};

// Заливка региона на SVG-карте (полупрозрачная, поверх фона карты).
export const levelMapFill: Record<AlertLevel, string> = {
  none: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
  info: "color-mix(in srgb, var(--hz-info) 30%, transparent)",
  warning: "color-mix(in srgb, var(--hz-warning) 45%, transparent)",
  danger: "color-mix(in srgb, var(--hz-danger) 55%, transparent)",
  critical: "color-mix(in srgb, var(--hz-critical) 60%, transparent)",
};

// Легенда карты.
export const legendItems: { level: AlertLevel; label: string }[] = [
  { level: "none", label: "Штатно" },
  { level: "info", label: "Информация" },
  { level: "warning", label: "Предупреждение" },
  { level: "danger", label: "Опасность" },
  { level: "critical", label: "Критично" },
];

// Порядок и названия регионов.
export const regionOrder: RegionKey[] = [
  "dushanbe",
  "sughd",
  "khatlon",
  "rrp",
  "gbao",
];

export const regionName: Record<RegionKey, string> = {
  dushanbe: "г. Душанбе",
  sughd: "Согдийская область",
  khatlon: "Хатлонская область",
  rrp: "Районы республиканского подчинения",
  gbao: "ГБАО",
};

export const regionShort: Record<RegionKey, string> = {
  dushanbe: "Душанбе",
  sughd: "Согдийская обл.",
  khatlon: "Хатлонская обл.",
  rrp: "РРП",
  gbao: "ГБАО",
};

export function countLabel(n: number): string {
  return n === 1 ? "событие" : n < 5 ? "события" : "событий";
}

// Сопоставление стабильного hc-key из TopoJSON (@highcharts/map-collection)
// с ключами регионов портала. Надёжнее сопоставления по названию, которое в
// исходном файле дано в устаревшей форме (Leninabad = Согд, Territories = РРП).
export function regionKeyOfHc(hcKey: string | undefined): RegionKey {
  switch ((hcKey || "").toLowerCase()) {
    case "tj-du":
      return "dushanbe";
    case "tj-le":
      return "sughd";
    case "tj-kl":
      return "khatlon";
    case "tj-bk":
      return "gbao";
    default:
      return "rrp";
  }
}
