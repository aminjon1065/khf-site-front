// Единый слой доступа к публичному API CMS (Laravel, `api/v1`).
// Серверные компоненты Next.js вызывают эти функции; данные кэшируются через
// ISR (`revalidate`). Формы/клиентские вызовы используют NEXT_PUBLIC_API_URL.

import type { NewsItem } from "@/lib/types";
import { DEFAULT_LOCALE, toApiLocale, type Locale } from "@/lib/i18n/config";

/** База API: на сервере — API_URL, на клиенте — NEXT_PUBLIC_API_URL. */
export const API_BASE =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8848/api/v1";

/** Как часто ISR перепроверяет данные (сек). */
const REVALIDATE = 60;

export type ContentLocale = "ru" | "tg" | "en";

/** Форма новости, отдаваемая CMS (`PublicNewsResource`). Расширяет NewsItem. */
export interface ApiNewsItem extends NewsItem {
  datetime?: string | null;
  image?: string | null;
  image_srcset?: string | null;
  body?: string;
  views?: number;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

interface NewsQuery {
  locale?: Locale;
  category?: string;
  q?: string;
  page?: number;
  perPage?: number;
}

function buildUrl(path: string, params: Record<string, string | number | undefined>): string {
  const url = new URL(`${API_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") {
      continue;
    }
    // Локаль портала (`tj`) уходит в CMS как стандартный `tg` (см. toApiLocale).
    const out = key === "locale" ? toApiLocale(value as Locale) : value;
    url.searchParams.set(key, String(out));
  }
  return url.toString();
}

/**
 * Список опубликованных новостей. При недоступности API возвращает пустой
 * результат, чтобы страница деградировала мягко (пустое состояние), а не падала.
 */
export async function fetchNews(query: NewsQuery = {}): Promise<Paginated<ApiNewsItem>> {
  const url = buildUrl("/news", {
    locale: query.locale,
    category: query.category,
    q: query.q,
    page: query.page,
    per_page: query.perPage,
  });

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    return (await res.json()) as Paginated<ApiNewsItem>;
  } catch (error) {
    console.error("fetchNews failed:", error);
    return {
      data: [],
      meta: { total: 0, per_page: 0, current_page: 1, last_page: 1 },
    };
  }
}

/**
 * Одна новость по slug. Возвращает null при 404 (материал не опубликован или не
 * существует) — вызывающая страница показывает notFound().
 */
export async function fetchNewsItem(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiNewsItem | null> {
  const url = buildUrl(`/news/${encodeURIComponent(slug)}`, { locale });

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiNewsItem };
    return body.data;
  } catch (error) {
    console.error(`fetchNewsItem(${slug}) failed:`, error);
    return null;
  }
}

// --------------------------------------------------------------- инструкции

export type InstructionSectionKey =
  | "before"
  | "during"
  | "after"
  | "prohibited";

/** Инструкция населению (`PublicInstructionResource`). */
export interface ApiInstruction {
  slug: string;
  title: string;
  summary: string;
  hazard: string | null;
  hazard_label: string | null;
  hazard_icon: string | null;
  priority: boolean;
  image: string | null;
  image_srcset?: string | null;
  /** Присутствуют только в детальном ответе. */
  sections?: Record<InstructionSectionKey, string[]>;
  /** Необязательное развёрнутое описание (HTML из редактора CMS). */
  body?: string;
}

/**
 * Каталог опубликованных инструкций (закреплённые первыми). При недоступности
 * API возвращает пустой массив — страница деградирует мягко.
 */
export async function fetchInstructions(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiInstruction[]> {
  const url = buildUrl("/instructions", { locale });

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiInstruction[] };
    return body.data;
  } catch (error) {
    console.error("fetchInstructions failed:", error);
    return [];
  }
}

/** Одна инструкция по slug (с блоками sections). null при 404. */
export async function fetchInstruction(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiInstruction | null> {
  const url = buildUrl(`/instructions/${encodeURIComponent(slug)}`, { locale });

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiInstruction };
    return body.data;
  } catch (error) {
    console.error(`fetchInstruction(${slug}) failed:`, error);
    return null;
  }
}

// ---------------------------------------------------------------- документы

/** Файл документа на одном языке. */
export interface ApiDocumentFile {
  lang: string;
  label: string;
  url: string;
  ext: string;
  size: string;
}

/** Официальный документ (`PublicDocumentResource`). */
export interface ApiDocument {
  id: number;
  type: string; // человекочитаемый тип («Закон»)
  type_value: string;
  title: string;
  number: string | null;
  section: string | null;
  date: string | null; // «02.03.2026»
  lang: string; // «ТҶ / РУ / EN»
  size: string | null; // «PDF · 0,4 МБ»
  href: string | null; // основной файл для скачивания
  files: ApiDocumentFile[];
}

/**
 * Библиотека опубликованных документов (новые первыми). При недоступности API
 * возвращает пустой массив — страница деградирует мягко.
 */
export async function fetchDocuments(
  params: { locale?: Locale; type?: string; section?: string } = {},
): Promise<ApiDocument[]> {
  const url = buildUrl("/documents", {
    locale: params.locale,
    type: params.type,
    section: params.section,
  });

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiDocument[] };
    return body.data;
  } catch (error) {
    console.error("fetchDocuments failed:", error);
    return [];
  }
}

// ----------------------------------------------------------------- проекты

export interface ApiProjectTimeline {
  date: string;
  text: string;
  tone: string;
}

/** Проект/программа (`PublicProjectResource`). */
export interface ApiProject {
  slug: string;
  title: string;
  status: string; // человекочитаемый статус («Реализуется»)
  status_tone: string;
  years: string | null;
  partner: string | null;
  budget: string | null;
  desc: string;
  image: string | null;
  image_srcset?: string | null;
  // только в детальном ответе:
  code?: string | null;
  customer?: string | null;
  body?: string;
  goals?: string[];
  timeline?: ApiProjectTimeline[];
  direction?: { address: string; phone: string; email: string };
}

/** Список опубликованных проектов. При недоступности API — пустой массив. */
export async function fetchProjects(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiProject[]> {
  const url = buildUrl("/projects", { locale });

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiProject[] };
    return body.data;
  } catch (error) {
    console.error("fetchProjects failed:", error);
    return [];
  }
}

/** Один проект по slug (с целями, хронологией и дирекцией). null при 404. */
export async function fetchProject(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiProject | null> {
  const url = buildUrl(`/projects/${encodeURIComponent(slug)}`, { locale });

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiProject };
    return body.data;
  } catch (error) {
    console.error(`fetchProject(${slug}) failed:`, error);
    return null;
  }
}

// -------------------------------------------------------------- объявления

/** Объявление: вакансия или тендер (`PublicAnnouncementResource`). */
export interface ApiAnnouncement {
  kind: "vacancy" | "tender";
  kind_label: string;
  title: string;
  org: string | null;
  desc: string;
  deadline: string; // готовая строка, напр. «до 31.07.2026»
  open: boolean;
}

/** Список опубликованных объявлений (открытые первыми). Пустой массив при сбое. */
export async function fetchAnnouncements(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiAnnouncement[]> {
  const url = buildUrl("/announcements", { locale });

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiAnnouncement[] };
    return body.data;
  } catch (error) {
    console.error("fetchAnnouncements failed:", error);
    return [];
  }
}

// --------------------------------------------------- предупреждения / карта

export type PublicAlertLevel =
  | "none"
  | "info"
  | "warning"
  | "danger"
  | "critical";

export interface ApiAlertMeta {
  label: string;
  value: string;
}

export interface ApiAlertRegion {
  code: string;
  name: string;
}

/** Экстренное предупреждение (`PublicAlertResource`). */
export interface ApiAlert {
  slug: string;
  level: PublicAlertLevel;
  level_label: string;
  severity: string;
  status: string; // «Действует» / «Завершено»
  is_active: boolean;
  hazard: string;
  hazard_label: string;
  title: string;
  summary: string;
  region: string;
  region_codes: string[];
  datetime: string | null;
  starts_at: string | null;
  ends_at: string | null;
  // только в детальном ответе:
  body?: string;
  instructions?: string[];
  contacts?: string;
  source?: string | null;
  territory_type?: string;
  regions?: ApiAlertRegion[];
  meta?: ApiAlertMeta[];
}

/** Статус региона для карты (`RegionController`). */
export interface ApiRegionStatus {
  key: string;
  name: string;
  level: PublicAlertLevel;
  count: number;
  statusText: string;
}

/** Сводка активных предупреждений (`alerts/active`). */
export interface ApiAlertsActive {
  state: "calm" | "warning" | "critical";
  count: number;
  regions: ApiRegionStatus[];
}

/** Активные предупреждения (наиболее серьёзные первыми). */
export async function fetchAlerts(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiAlert[]> {
  const url = buildUrl("/alerts", { locale });

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiAlert[] };
    return body.data;
  } catch (error) {
    console.error("fetchAlerts failed:", error);
    return [];
  }
}

/** Одно предупреждение по slug (с инструкциями и регионами). null при 404. */
export async function fetchAlert(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiAlert | null> {
  const url = buildUrl(`/alerts/${encodeURIComponent(slug)}`, { locale });

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiAlert };
    return body.data;
  } catch (error) {
    console.error(`fetchAlert(${slug}) failed:`, error);
    return null;
  }
}

/** Глобальная сводка обстановки + статусы регионов (для баннера и карты). */
export async function fetchAlertsActive(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiAlertsActive> {
  const url = buildUrl("/alerts/active", { locale });

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiAlertsActive };
    return body.data;
  } catch (error) {
    console.error("fetchAlertsActive failed:", error);
    return { state: "calm", count: 0, regions: [] };
  }
}

/** Статусы регионов для карты рисков. */
export async function fetchRegions(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiRegionStatus[]> {
  const url = buildUrl("/regions", { locale });

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiRegionStatus[] };
    return body.data;
  } catch (error) {
    console.error("fetchRegions failed:", error);
    return [];
  }
}

// ----------------------------------------------------------------- главная

export interface ApiHomeBlock {
  type: string;
  title: string;
  config: { limit?: number } & Record<string, unknown>;
}

/** Композиция главной страницы (`/api/v1/home`). */
export interface ApiHome {
  blocks: ApiHomeBlock[];
  alerts: {
    state: "calm" | "warning" | "critical";
    count: number;
    regions: ApiRegionStatus[];
    items: ApiAlert[];
  };
  news: ApiNewsItem[];
  instructions: ApiInstruction[];
  documents: ApiDocument[];
  announcements: ApiAnnouncement[];
  projects: ApiProject[];
}

const EMPTY_HOME: ApiHome = {
  blocks: [],
  alerts: { state: "calm", count: 0, regions: [], items: [] },
  news: [],
  instructions: [],
  documents: [],
  announcements: [],
  projects: [],
};

/** Всё, что нужно главной странице, одним запросом. */
export async function fetchHome(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiHome> {
  const url = buildUrl("/home", { locale });

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiHome };
    return body.data;
  } catch (error) {
    console.error("fetchHome failed:", error);
    return EMPTY_HOME;
  }
}

// ------------------------------------------------ настройки сайта / меню

export interface ApiSettings {
  org: {
    name: string;
    short_name: string;
    about: string;
    address: string;
    email: string;
    emergency_number: string;
    trust_phone: string;
  };
  contacts: { press_email: string; press_phone: string; duty_phone: string };
  social: Record<string, string>;
  emergency_services: { num: string; label: string }[];
  copyright: string;
  seo: { meta_title: string; meta_description: string };
}

export interface ApiMenuItem {
  label: string;
  url: string | null;
  children?: { label: string; url: string | null }[];
}

export interface ApiMenu {
  main: ApiMenuItem[];
  footer: ApiMenuItem[];
}

/** Публичные настройки сайта (шапка/подвал). null при недоступности API. */
export async function fetchSettings(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiSettings | null> {
  const url = buildUrl("/settings", { locale });

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiSettings };
    return body.data;
  } catch (error) {
    console.error("fetchSettings failed:", error);
    return null;
  }
}

/** Навигационные меню (главное + подвал). Пустые массивы при сбое. */
export async function fetchMenu(locale: Locale = DEFAULT_LOCALE): Promise<ApiMenu> {
  const url = buildUrl("/menu", { locale });

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiMenu };
    return body.data;
  } catch (error) {
    console.error("fetchMenu failed:", error);
    return { main: [], footer: [] };
  }
}

/** Региональное управление (справочник на странице «Контакты»). */
export interface ApiRegionOffice {
  code: string;
  name: string;
  type: string;
  head: string;
  regional_center: string | null;
  address: string;
  phone: string | null;
  phone_href: string | null;
  duty_phone: string | null;
  email: string | null;
  districts_count: number;
  districts: string[];
}

/** Справочник региональных управлений. Пустой массив при сбое. */
export async function fetchRegionsDirectory(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiRegionOffice[]> {
  const url = buildUrl("/regions/directory", { locale });

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiRegionOffice[] };
    return body.data;
  } catch (error) {
    console.error("fetchRegionsDirectory failed:", error);
    return [];
  }
}

/** Информационная страница сайта (CMS `PublicPageResource`). */
export interface ApiPage {
  slug: string;
  title: string;
}

export interface ApiPageDetail extends ApiPage {
  body: string;
  updated: string | null;
}

/** Список опубликованных страниц (для генерации маршрутов). Пусто при сбое. */
export async function fetchPages(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiPage[]> {
  const url = buildUrl("/pages", { locale });

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiPage[] };
    return body.data;
  } catch (error) {
    console.error("fetchPages failed:", error);
    return [];
  }
}

/** Одна страница по slug. `null` при 404 / недоступности. */
export async function fetchPage(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiPageDetail | null> {
  const url = buildUrl(`/pages/${encodeURIComponent(slug)}`, { locale });

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiPageDetail };
    return body.data;
  } catch (error) {
    console.error(`fetchPage(${slug}) failed:`, error);
    return null;
  }
}
