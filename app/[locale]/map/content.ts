import type { Locale } from "@/lib/i18n/config";

// Текстовый контент страницы «Карта рисков». Данные о событиях приходят из CMS
// (страница строит incidents из предупреждений), поэтому здесь только подписи UI.
// Локализовано: getMap(locale) → ru/tj/en.

interface MapContent {
  title: string;
  subtitle: string;
  updated: string;
  filterLabel: string;
  filterGroupAria: string;
  /** Подпись кнопки-сброса фильтра («Все»/«Ҳама»/«All»). */
  allFilter: string;
  legendAria: string;
  incidentsTitle: string;
  incidentsListAria: string;
  countFilterPrefix: string;
  empty: { title: string; text: string };
  howToRead: { title: string; text: string };
}

const ru: MapContent = {
  title: "Карта рисков",
  subtitle: "Оперативная обстановка по регионам республики",
  updated: "Обновлено 18.07.2026, 14:00 · ЦУКС КЧС",
  filterLabel: "Тип риска:",
  filterGroupAria: "Фильтр по типу риска",
  allFilter: "Все",
  legendAria: "Легенда карты",
  incidentsTitle: "Активные события",
  incidentsListAria: "Активные события — список",
  countFilterPrefix: "фильтр:",
  empty: {
    title: "Событий этого типа нет",
    text: "По выбранному типу риска активных событий не зарегистрировано.",
  },
  howToRead: {
    title: "Как читать карту",
    text: "Цвет региона отражает наивысший уровень действующего предупреждения. Уровень всегда дублируется текстом и значком — не только цветом.",
  },
};

const tj: MapContent = {
  title: "Харитаи хатарҳо",
  subtitle: "Вазъияти оперативӣ аз рӯи минтақаҳои ҷумҳурӣ",
  updated: "Навсозӣ 18.07.2026, 14:00 · МИБ КҲФ",
  filterLabel: "Навъи хатар:",
  filterGroupAria: "Полоиш аз рӯи навъи хатар",
  allFilter: "Ҳама",
  legendAria: "Роҳнамои харита",
  incidentsTitle: "Рӯйдодҳои фаъол",
  incidentsListAria: "Рӯйдодҳои фаъол — рӯйхат",
  countFilterPrefix: "полоиш:",
  empty: {
    title: "Рӯйдоди ин навъ нест",
    text: "Аз рӯи навъи интихобшудаи хатар рӯйдоди фаъол сабт нашудааст.",
  },
  howToRead: {
    title: "Харитаро чӣ гуна хондан",
    text: "Ранги минтақа сатҳи баландтарини огоҳии амалкунандаро нишон медиҳад. Сатҳ ҳамеша бо матн ва аломат такрор мешавад — на танҳо бо ранг.",
  },
};

const en: MapContent = {
  title: "Risk map",
  subtitle: "Operational situation across the regions of the republic",
  updated: "Updated 18.07.2026, 14:00 · CoES Crisis Centre",
  filterLabel: "Risk type:",
  filterGroupAria: "Filter by risk type",
  allFilter: "All",
  legendAria: "Map legend",
  incidentsTitle: "Active events",
  incidentsListAria: "Active events — list",
  countFilterPrefix: "filter:",
  empty: {
    title: "No events of this type",
    text: "No active events are registered for the selected risk type.",
  },
  howToRead: {
    title: "How to read the map",
    text: "A region's colour reflects the highest level of the active alert. The level is always duplicated with text and an icon — not by colour alone.",
  },
};

/** Текстовый контент карты рисков для активной локали. */
export function getMap(locale: Locale): MapContent {
  return { ru, tj, en }[locale];
}
