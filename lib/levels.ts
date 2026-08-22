import { htmlLang, type Locale } from "@/lib/i18n/config";
import { getUiStrings } from "@/lib/i18n/ui-strings";
import type { AlertLevel, RegionKey } from "@/lib/types";

// Семантическая шкала опасности — единый источник цветов, подписей и заливок.
// Правило: красный только для danger/critical; уровень всегда дублируется текстом.
//
// Цвета, порядок регионов и сопоставление ключей от языка не зависят и остаются
// константами. Подписи зависят: раньше они были русскими литералами и выводились
// как есть на /tj и /en, из-за чего рядом с локализованным названием региона из
// CMS стоял русский бейдж. Теперь они берутся из lib/i18n/ui-strings по локали.

export const levelDotColor: Record<AlertLevel, string> = {
  none: "var(--hz-success)",
  info: "var(--hz-info)",
  warning: "var(--hz-warning)",
  danger: "var(--hz-danger)",
  critical: "var(--hz-critical)",
};

/** Короткий бейдж уровня для конкретной локали. */
export function levelBadges(locale: Locale): Record<AlertLevel, string> {
  return getUiStrings(locale).levels.badge;
}

/** Фраза статуса региона для конкретной локали. */
export function levelStatusTexts(locale: Locale): Record<AlertLevel, string> {
  return getUiStrings(locale).levels.status;
}

// Заливка региона на SVG-карте (полупрозрачная, поверх фона карты).
export const levelMapFill: Record<AlertLevel, string> = {
  none: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
  info: "color-mix(in srgb, var(--hz-info) 30%, transparent)",
  warning: "color-mix(in srgb, var(--hz-warning) 45%, transparent)",
  danger: "color-mix(in srgb, var(--hz-danger) 55%, transparent)",
  critical: "color-mix(in srgb, var(--hz-critical) 60%, transparent)",
};

/** Легенда карты в порядке возрастания опасности. */
export function legendItems(
  locale: Locale,
): { level: AlertLevel; label: string }[] {
  const legend = getUiStrings(locale).levels.legend;

  return LEGEND_ORDER.map((level) => ({ level, label: legend[level] }));
}

const LEGEND_ORDER: AlertLevel[] = [
  "none",
  "info",
  "warning",
  "danger",
  "critical",
];

// Порядок и названия регионов.
export const regionOrder: RegionKey[] = [
  "dushanbe",
  "sughd",
  "khatlon",
  "rrp",
  "gbao",
];

/** Полные названия регионов для конкретной локали. */
export function regionNames(locale: Locale): Record<RegionKey, string> {
  return getUiStrings(locale).regions.name;
}

/** Сокращённые названия регионов — для подписей на карте. */
export function regionShorts(locale: Locale): Record<RegionKey, string> {
  return getUiStrings(locale).regions.short;
}

/**
 * Склонение слова «событие». Правило берётся у Intl.PluralRules, а не пишется
 * руками: у русского три формы с исключениями на 11–14, у таджикского и
 * английского — свои. Для локали без данных в среде выполнения остаётся `other`.
 */
export function countLabel(locale: Locale, n: number): string {
  const forms = getUiStrings(locale).eventForms;

  let category: Intl.LDMLPluralRule = "other";
  try {
    category = new Intl.PluralRules(htmlLang(locale)).select(n);
  } catch {
    // Среда не знает эту локаль — остаётся общая форма.
  }

  return forms[category] ?? forms.other;
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
