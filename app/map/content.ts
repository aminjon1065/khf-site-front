import type { AlertLevel, RegionKey } from "@/lib/types";

// Весь контент страницы «Карта рисков» (демо-данные заглушки CMS).
// Представление отделено от контента: страница/клиентский виджет читают отсюда.

// Тип риска для фильтра. «Все» — сброс фильтра; остальные — реальные категории.
export type RiskKind =
  | "Сель"
  | "Жара"
  | "Камнепад"
  | "Лавина"
  | "Землетрясение";
export type RiskFilter = "Все" | RiskKind;

// Активное событие (оперативная обстановка). regionKey привязывает событие к
// региону карты; level задаёт цвет точки и вклад в уровень региона.
export interface MapIncident {
  kind: RiskKind;
  level: AlertLevel;
  time: string;
  title: string;
  region: string;
  regionKey: RegionKey;
}

export const map = {
  title: "Карта рисков",
  subtitle: "Оперативная обстановка по регионам республики",
  updated: "Обновлено 18.07.2026, 14:00 · ЦУКС КЧС",

  filterLabel: "Тип риска:",
  filterGroupAria: "Фильтр по типу риска",
  allKind: "Все" as RiskFilter,
  kinds: [
    "Все",
    "Сель",
    "Жара",
    "Камнепад",
    "Лавина",
    "Землетрясение",
  ] as RiskFilter[],

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

  incidents: [
    {
      kind: "Сель",
      level: "warning",
      time: "18.07, 09:00",
      title: "Селевая опасность в предгорных районах",
      region: "Хатлонская область — Куляб, Восе, Дангара",
      regionKey: "khatlon",
    },
    {
      kind: "Жара",
      level: "info",
      time: "17.07, 16:00",
      title: "Аномальная жара до +43 °C",
      region: "Хатлонская область, РРП",
      regionKey: "khatlon",
    },
    {
      kind: "Жара",
      level: "info",
      time: "17.07, 16:00",
      title: "Высокая пожарная опасность в степной зоне",
      region: "РРП — Рудаки, Вахдат",
      regionKey: "rrp",
    },
    {
      kind: "Камнепад",
      level: "info",
      time: "16.07, 11:30",
      title: "Камнепады на автодороге Хорог — Мургаб",
      region: "ГБАО",
      regionKey: "gbao",
    },
  ] as MapIncident[],
} as const;
