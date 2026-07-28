// Единый слой доступа к публичному API CMS (Laravel, `api/v1`).
// Серверные компоненты Next.js вызывают эти функции; данные кэшируются через
// ISR (`revalidate`). Формы/клиентские вызовы используют NEXT_PUBLIC_API_URL.

import type {
  ApiAlert,
  ApiAlertsActive,
  ApiAnnouncement,
  ApiDocument,
  ApiHome,
  ApiInstruction,
  ApiMenu,
  ApiNewsItem,
  ApiPage,
  ApiPageDetail,
  ApiProject,
  ApiRegionOffice,
  ApiRegionStatus,
  ApiSearchResult,
  ApiSettings,
} from "@/lib/api.generated";
import { DEFAULT_LOCALE, toApiLocale, type Locale } from "@/lib/i18n/config";
import { reportCmsFailure } from "@/lib/cms-error-reporting.mjs";
import {
  cmsCacheTags,
  cmsRequestTags,
  type CmsContentType,
} from "@/lib/cache-tags";

export type {
  ApiAlert,
  ApiAlertMeta,
  ApiAlertRegion,
  ApiAlertsActive,
  ApiAnnouncement,
  ApiDocument,
  ApiDocumentFile,
  ApiHome,
  ApiHomeBlock,
  ApiInstruction,
  ApiMenu,
  ApiMenuItem,
  ApiNewsItem,
  ApiPage,
  ApiPageDetail,
  ApiProject,
  ApiProjectTimeline,
  ApiRegionOffice,
  ApiRegionStatus,
  ApiSearchResult,
  ApiSettings,
} from "@/lib/api.generated";

/** База API: на сервере — API_URL, на клиенте — NEXT_PUBLIC_API_URL. */
export const API_BASE =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8848/api/v1";

/** Как часто ISR перепроверяет данные (сек). */
const REVALIDATE = 60;

export type ContentLocale = "ru" | "tg" | "en";

function cmsFetchOptions(
  type: Exclude<CmsContentType, "shell">,
  locale: Locale,
  slug?: string,
): { next: { revalidate: number; tags: string[] } } {
  return {
    next: {
      revalidate: REVALIDATE,
      tags: cmsRequestTags(type, locale, slug),
    },
  };
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

export function buildUrl(
  path: string,
  params: Record<string, string | number | undefined>,
): string {
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
export async function fetchNews(
  query: NewsQuery = {},
): Promise<Paginated<ApiNewsItem>> {
  const url = buildUrl("/news", {
    locale: query.locale,
    category: query.category,
    q: query.q,
    page: query.page,
    per_page: query.perPage,
  });

  try {
    const res = await fetch(
      url,
      cmsFetchOptions("news", query.locale ?? DEFAULT_LOCALE),
    );
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    return (await res.json()) as Paginated<ApiNewsItem>;
  } catch (error) {
    reportCmsFailure("fetchNews", error);
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
    const res = await fetch(url, cmsFetchOptions("news", locale, slug));
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiNewsItem };
    return body.data;
  } catch (error) {
    // Пробрасываем не-404 (5xx/сеть/таймаут): пусть Next отдаст последний удачный
    // статический рендер или error-boundary, а не кэширует ложный notFound().
    reportCmsFailure("fetchNewsItem", error);
    throw error;
  }
}

// ------------------------------------------------------------------- поиск

/** Тип найденного материала (для подписи/группировки в выдаче). */
export type SearchResultType = ApiSearchResult["type"];

interface SearchQuery {
  q: string;
  locale?: Locale;
  page?: number;
  perPage?: number;
}

/**
 * Глобальный поиск по опубликованному контенту (`GET /search`, q ≥ 2). При
 * коротком запросе или недоступности API возвращает пустой результат.
 */
export async function fetchSearch(
  query: SearchQuery,
): Promise<Paginated<ApiSearchResult>> {
  const q = query.q.trim();
  const empty: Paginated<ApiSearchResult> = {
    data: [],
    meta: { total: 0, per_page: 0, current_page: 1, last_page: 1 },
  };
  if (q.length < 2) {
    return empty;
  }

  const url = buildUrl("/search", {
    q,
    locale: query.locale,
    page: query.page,
    per_page: query.perPage,
  });

  try {
    // Поиск не тегируем `cms` (запросы уникальны, инвалидировать не нужно).
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    return (await res.json()) as Paginated<ApiSearchResult>;
  } catch (error) {
    reportCmsFailure("fetchSearch", error);
    return empty;
  }
}

// --------------------------------------------------------------- инструкции

export type InstructionSectionKey = keyof NonNullable<
  ApiInstruction["sections"]
>;

/**
 * Каталог опубликованных инструкций (закреплённые первыми). При недоступности
 * API возвращает пустой массив — страница деградирует мягко.
 */
export async function fetchInstructions(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiInstruction[]> {
  const url = buildUrl("/instructions", { locale, per_page: 50 });

  try {
    const res = await fetch(url, cmsFetchOptions("instruction", locale));
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiInstruction[] };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchInstructions", error);
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
    const res = await fetch(url, cmsFetchOptions("instruction", locale, slug));
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiInstruction };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchInstruction", error);
    throw error;
  }
}

// ---------------------------------------------------------------- документы

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
    per_page: 50,
  });

  try {
    const res = await fetch(
      url,
      cmsFetchOptions("document", params.locale ?? DEFAULT_LOCALE),
    );
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiDocument[] };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchDocuments", error);
    return [];
  }
}

// ----------------------------------------------------------------- проекты

/** Список опубликованных проектов. При недоступности API — пустой массив. */
export async function fetchProjects(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiProject[]> {
  const url = buildUrl("/projects", { locale, per_page: 50 });

  try {
    const res = await fetch(url, cmsFetchOptions("project", locale));
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiProject[] };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchProjects", error);
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
    const res = await fetch(url, cmsFetchOptions("project", locale, slug));
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiProject };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchProject", error);
    throw error;
  }
}

// -------------------------------------------------------------- объявления

/** Список опубликованных объявлений (открытые первыми). Пустой массив при сбое. */
export async function fetchAnnouncements(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiAnnouncement[]> {
  const url = buildUrl("/announcements", { locale, per_page: 50 });

  try {
    const res = await fetch(url, cmsFetchOptions("announcement", locale));
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiAnnouncement[] };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchAnnouncements", error);
    return [];
  }
}

// --------------------------------------------------- предупреждения / карта

export type PublicAlertLevel =
  "none" | "info" | "warning" | "danger" | "critical";

/** Активные предупреждения (наиболее серьёзные первыми). */
export async function fetchAlerts(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiAlert[]> {
  const url = buildUrl("/alerts", { locale });

  try {
    const res = await fetch(url, cmsFetchOptions("alert", locale));
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiAlert[] };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchAlerts", error);
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
    const res = await fetch(url, cmsFetchOptions("alert", locale, slug));
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiAlert };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchAlert", error);
    throw error;
  }
}

/** Глобальная сводка обстановки + статусы регионов (для баннера и карты). */
export async function fetchAlertsActive(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiAlertsActive> {
  const url = buildUrl("/alerts/active", { locale });

  try {
    const res = await fetch(url, cmsFetchOptions("alert", locale));
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiAlertsActive };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchAlertsActive", error);
    return { state: "calm", count: 0, regions: [] };
  }
}

/** Статусы регионов для карты рисков. */
export async function fetchRegions(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiRegionStatus[]> {
  const url = buildUrl("/regions", { locale });

  try {
    const res = await fetch(url, {
      next: {
        revalidate: REVALIDATE,
        tags: [...cmsRequestTags("alert", locale), `cms:regions:${locale}`],
      },
    });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiRegionStatus[] };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchRegions", error);
    return [];
  }
}

// ----------------------------------------------------------------- главная

const EMPTY_HOME: ApiHome = {
  blocks: [],
  alerts: { state: "calm", count: 0, regions: [], items: [] },
  news: [],
  instructions: [],
  documents: [],
  announcements: [],
  projects: [],
  emergency_contacts: {},
};

/** Всё, что нужно главной странице, одним запросом. */
export async function fetchHome(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiHome> {
  const url = buildUrl("/home", { locale });

  try {
    const res = await fetch(url, {
      next: {
        revalidate: REVALIDATE,
        tags: [cmsCacheTags.home(locale)],
      },
    });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiHome };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchHome", error);
    return EMPTY_HOME;
  }
}

// ------------------------------------------------ настройки сайта / меню

/** Публичные настройки сайта (шапка/подвал). null при недоступности API. */
export async function fetchSettings(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiSettings | null> {
  const url = buildUrl("/settings", { locale });

  try {
    const res = await fetch(url, {
      next: {
        revalidate: REVALIDATE,
        tags: [cmsCacheTags.shell(locale)],
      },
    });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiSettings };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchSettings", error);
    return null;
  }
}

/** Навигационные меню (главное + подвал). Пустые массивы при сбое. */
export async function fetchMenu(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiMenu> {
  const url = buildUrl("/menu", { locale });

  try {
    const res = await fetch(url, {
      next: {
        revalidate: REVALIDATE,
        tags: [cmsCacheTags.shell(locale)],
      },
    });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiMenu };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchMenu", error);
    return { main: [], footer: [] };
  }
}

/** Справочник региональных управлений. Пустой массив при сбое. */
export async function fetchRegionsDirectory(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiRegionOffice[]> {
  const url = buildUrl("/regions/directory", { locale });

  try {
    const res = await fetch(url, {
      next: {
        revalidate: REVALIDATE,
        tags: [`cms:regions:${locale}`],
      },
    });
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiRegionOffice[] };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchRegionsDirectory", error);
    return [];
  }
}

/** Список опубликованных страниц (для генерации маршрутов). Пусто при сбое. */
export async function fetchPages(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiPage[]> {
  const url = buildUrl("/pages", { locale });

  try {
    const res = await fetch(url, cmsFetchOptions("page", locale));
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiPage[] };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchPages", error);
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
    const res = await fetch(url, cmsFetchOptions("page", locale, slug));
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`API ${res.status}`);
    }
    const body = (await res.json()) as { data: ApiPageDetail };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchPage", error);
    throw error;
  }
}
