import type { ApiHomeBlock } from "@/lib/api";

// Раскладка главной по блокам CMS (раздел «Главная страница» в админке).
//
// `GET /home` отдаёт в `blocks` только включённые блоки в порядке редактора,
// а заголовок блока — на языке запроса. Верх страницы — слайдер с карточкой
// Президента и «Оперативная сводка» — от блоков не зависит и всегда идёт
// первым; остальные секции выстраиваются по `blocks`.

/** Типы блоков CMS, которые рисует сайт. */
export type HomeBlockType =
  | "active_alerts"
  | "announcements"
  | "documents"
  | "indicators"
  | "instructions"
  | "latest_news"
  | "projects"
  | "regions_map";

/** Секции главной ниже «Оперативной сводки». */
export type HomeSection =
  | "alerts"
  | "indicators"
  | "news"
  | "officialInfo"
  | "quickActions"
  | "regions";

const SECTION_BY_BLOCK: Readonly<Record<HomeBlockType, HomeSection>> = {
  active_alerts: "alerts",
  indicators: "indicators",
  instructions: "quickActions",
  latest_news: "news",
  regions_map: "regions",
  // Документы, объявления и проекты — одна секция «Официальная информация»,
  // она встаёт на место первого из трёх блоков; каждая колонка внутри — только
  // при своём блоке.
  announcements: "officialInfo",
  documents: "officialInfo",
  projects: "officialInfo",
};

function isKnownBlock(type: unknown): type is HomeBlockType {
  return (
    typeof type === "string" &&
    Object.prototype.hasOwnProperty.call(SECTION_BY_BLOCK, type)
  );
}

/**
 * Секции в порядке блоков. Каждая — один раз, на месте первого своего блока.
 * Незнакомые типы — в том числе `emergency_contacts`, который CMS перестаёт
 * предлагать, — пропускаются молча: новый блок в CMS не должен ломать сайт.
 */
export function homeSections(blocks: readonly ApiHomeBlock[]): HomeSection[] {
  const sections: HomeSection[] = [];
  for (const block of blocks) {
    if (!isKnownBlock(block?.type)) {
      continue;
    }
    const section = SECTION_BY_BLOCK[block.type];
    if (!sections.includes(section)) {
      sections.push(section);
    }
  }
  return sections;
}

/** Включён ли блок: CMS присылает только включённые. */
export function hasHomeBlock(
  blocks: readonly ApiHomeBlock[],
  type: HomeBlockType,
): boolean {
  return blocks.some((block) => block?.type === type);
}

/**
 * Заголовок блока на языке страницы или `null`, если редактор его не задал —
 * тогда секция берёт свой заголовок из словаря.
 */
export function homeBlockTitle(
  blocks: readonly ApiHomeBlock[],
  type: HomeBlockType,
): string | null {
  const title: unknown = blocks.find((block) => block?.type === type)?.title;
  return typeof title === "string" && title.trim() !== "" ? title.trim() : null;
}

/**
 * Сколько материалов секция способна показать — больше она не покажет, даже
 * если CMS пришлёт. CMS уже отдаёт ровно столько, сколько указано в поле
 * «Количество» блока, и ограничивает это поле теми же числами.
 */
export const HOME_BLOCK_MAX_ITEMS = {
  /** Главная новость + четыре строки списка рядом с ней. */
  latest_news: 5,
  /** Крупная плитка + две малые рядом с тремя навигационными. */
  instructions: 3,
  /** Один ряд сетки из трёх карточек. */
  active_alerts: 3,
  /** Строки в левой колонке «Официальной информации». */
  documents: 5,
  announcements: 5,
  /** Карточки в узкой правой колонке. */
  projects: 3,
} as const satisfies Partial<Record<HomeBlockType, number>>;

/**
 * Раскладка, когда `/home` не ответил: как и прежде, остаются только плитки
 * «Что делать в ЧС» — без инструкций, с одними навигационными ссылками
 * (карта, телефоны, приёмная). Ни одна секция не выдаёт отсутствие данных за
 * их содержимое.
 */
export const UNAVAILABLE_HOME_SECTIONS: readonly HomeSection[] = [
  "quickActions",
];
