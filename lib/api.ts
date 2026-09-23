// Единый слой доступа к публичному API CMS (Laravel, `api/v1`).
// Серверные компоненты Next.js вызывают эти функции; данные кэшируются через
// ISR (`revalidate`). Формы/клиентские вызовы используют NEXT_PUBLIC_API_URL.

import { cache } from "react";
import type {
  ApiAlert,
  ApiAlertsActive,
  ApiAnnouncement,
  ApiDocument,
  ApiHome,
  ApiInstruction,
  ApiMenu,
  ApiNewsItem,
  ApiPageDetail,
  ApiProject,
  ApiRegionOffice,
  ApiRegionStatus,
  ApiSearchResult,
  ApiSettings,
  SlugListResponse,
} from "@/lib/api.generated";
import {
  DEFAULT_LOCALE,
  LOCALES,
  toApiLocale,
  type Locale,
} from "@/lib/i18n/config";
import { reportCmsFailure } from "@/lib/cms-error-reporting.mjs";
import {
  cmsCacheTags,
  cmsRequestTags,
  isAddressableSlug,
  MAX_CMS_SLUG_LENGTH,
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

/**
 * Верхний лимит ожидания ответа CMS для запросов контента (мс). Без него
 * зависший upstream держал SSR-рендер до системного TCP-таймаута; 8 секунд —
 * больше любого разумного ответа API и меньше, чем пользователь готов ждать
 * страницу обстановки. Внимание: `signal` отключает мемоизацию запроса в
 * пределах рендера (документация Next), но не ISR-кэш — это осознанный размен.
 */
export const CMS_TIMEOUT_MS = 8_000;

function timeoutSignal(): AbortSignal {
  return AbortSignal.timeout(CMS_TIMEOUT_MS);
}

export type ContentLocale = "ru" | "tg" | "en";

function cmsFetchOptions(
  type: Exclude<CmsContentType, "shell">,
  locale: Locale,
  slug?: string,
): {
  next: { revalidate: number; tags: string[] };
  signal: AbortSignal;
} {
  return {
    next: {
      revalidate: REVALIDATE,
      tags: cmsRequestTags(type, locale, slug),
    },
    signal: timeoutSignal(),
  };
}

/**
 * Ошибка неуспешного ответа CMS. Кроме статуса несёт `X-Request-ID` — тот
 * самый идентификатор, который CMS уже пишет в свой лог (`PublicApiResponse`).
 * Без него в журнале фронта оставалось только «API 500», и связать запись с
 * записью на стороне CMS было нечем: время и маршрут не различают запросы,
 * идущие пачками при сборке страницы.
 */
function cmsResponseError(res: Response): Error {
  const requestId = res.headers.get("x-request-id");

  return new Error(
    `API ${res.status}${requestId ? ` request_id=${requestId}` : ""}`,
  );
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

/**
 * Результат списочного запроса. `unavailable: true` — CMS не ответила
 * (сеть/5xx/таймаут). Пустой список без этого флага — подтверждённое
 * «ничего не найдено»; с ним — «данные временно недоступны». Страницы
 * обязаны различать эти состояния: для портала ЧС выдать молчание бэкенда
 * за пустую выдачу так же недопустимо, как за «обстановку штатную».
 */
export interface FetchList<T> extends Paginated<T> {
  unavailable?: boolean;
}

const emptyList = (): Paginated<never> => ({
  data: [],
  meta: { total: 0, per_page: 0, current_page: 1, last_page: 1 },
});

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
 * результат с `unavailable: true`, чтобы страница деградировала мягко
 * (состояние «временно недоступно»), а не падала и не выдавала пустоту за
 * «ничего не найдено».
 */
export async function fetchNews(
  query: NewsQuery = {},
): Promise<FetchList<ApiNewsItem>> {
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
      throw cmsResponseError(res);
    }
    return (await res.json()) as Paginated<ApiNewsItem>;
  } catch (error) {
    reportCmsFailure("fetchNews", error);
    return { ...emptyList(), unavailable: true } as FetchList<ApiNewsItem>;
  }
}

/**
 * Одна новость по slug. Возвращает null при 404 (материал не опубликован или не
 * существует) — вызывающая страница показывает notFound().
 */
export const fetchNewsItem = cache(async function fetchNewsItem(
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
      throw cmsResponseError(res);
    }
    const body = (await res.json()) as { data: ApiNewsItem };
    return body.data;
  } catch (error) {
    // Пробрасываем не-404 (5xx/сеть/таймаут): пусть Next отдаст последний удачный
    // статический рендер или error-boundary, а не кэширует ложный notFound().
    reportCmsFailure("fetchNewsItem", error);
    throw error;
  }
});

/** Категория контента (`GET /categories`), напр. рубрика новости. */
export interface ApiCategory {
  slug: string;
  name: string;
  type: string;
}

/**
 * Справочник категорий заданного типа (по умолчанию `news`) — для серверного
 * фильтра списков (см. `?category=` в fetchNews). Пустой массив при сбое.
 * Правку категории вебхук CMS доносит тегом `cms:categories:{locale}`.
 */
export async function fetchCategories(
  params: { type?: string; locale?: Locale } = {},
): Promise<ApiCategory[]> {
  const url = buildUrl("/categories", {
    type: params.type ?? "news",
    locale: params.locale,
    per_page: 50,
  });

  try {
    const res = await fetch(url, {
      next: {
        revalidate: REVALIDATE,
        tags: [
          cmsCacheTags.reference("category", params.locale ?? DEFAULT_LOCALE),
        ],
      },
      signal: timeoutSignal(),
    });
    if (!res.ok) {
      throw cmsResponseError(res);
    }
    const body = (await res.json()) as { data: ApiCategory[] };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchCategories", error);
    return [];
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
 * коротком запросе — пустой результат (ошибка ввода, не сбой). При
 * недоступности API — `unavailable: true`: «поиск временно недоступен»
 * отличается от «ничего не найдено».
 */
export async function fetchSearch(
  query: SearchQuery,
): Promise<FetchList<ApiSearchResult>> {
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
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE },
      signal: timeoutSignal(),
    });
    if (!res.ok) {
      throw cmsResponseError(res);
    }
    return (await res.json()) as Paginated<ApiSearchResult>;
  } catch (error) {
    reportCmsFailure("fetchSearch", error);
    return { ...empty, unavailable: true };
  }
}

// --------------------------------------------------------------- инструкции

export type InstructionSectionKey = keyof NonNullable<
  ApiInstruction["sections"]
>;

interface InstructionQuery {
  locale?: Locale;
  page?: number;
  perPage?: number;
}

/**
 * Каталог опубликованных инструкций (закреплённые первыми), постранично. При
 * недоступности API возвращает пустой результат — страница деградирует мягко.
 */
export async function fetchInstructions(
  query: InstructionQuery = {},
): Promise<FetchList<ApiInstruction>> {
  const url = buildUrl("/instructions", {
    locale: query.locale,
    page: query.page,
    per_page: query.perPage ?? 20,
  });

  try {
    const res = await fetch(
      url,
      cmsFetchOptions("instruction", query.locale ?? DEFAULT_LOCALE),
    );
    if (!res.ok) {
      throw cmsResponseError(res);
    }
    return (await res.json()) as Paginated<ApiInstruction>;
  } catch (error) {
    reportCmsFailure("fetchInstructions", error);
    return { ...emptyList(), unavailable: true } as FetchList<ApiInstruction>;
  }
}

/** Одна инструкция по slug (с блоками sections). null при 404. */
export const fetchInstruction = cache(async function fetchInstruction(
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
      throw cmsResponseError(res);
    }
    const body = (await res.json()) as { data: ApiInstruction };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchInstruction", error);
    throw error;
  }
});

// ---------------------------------------------------------------- документы

/**
 * Библиотека опубликованных документов (новые первыми), постранично. При
 * недоступности API возвращает пустой результат — страница деградирует мягко.
 */
export async function fetchDocuments(
  params: {
    locale?: Locale;
    type?: string;
    section?: string;
    q?: string;
    page?: number;
    perPage?: number;
  } = {},
): Promise<FetchList<ApiDocument>> {
  const url = buildUrl("/documents", {
    locale: params.locale,
    type: params.type,
    section: params.section,
    q: params.q,
    page: params.page,
    per_page: params.perPage ?? 20,
  });

  try {
    const res = await fetch(
      url,
      cmsFetchOptions("document", params.locale ?? DEFAULT_LOCALE),
    );
    if (!res.ok) {
      throw cmsResponseError(res);
    }
    return (await res.json()) as Paginated<ApiDocument>;
  } catch (error) {
    reportCmsFailure("fetchDocuments", error);
    return { ...emptyList(), unavailable: true } as FetchList<ApiDocument>;
  }
}

// ----------------------------------------------------------------- проекты

interface ProjectQuery {
  locale?: Locale;
  page?: number;
  perPage?: number;
}

/** Список опубликованных проектов, постранично. При недоступности API — пустой результат с `unavailable`. */
export async function fetchProjects(
  query: ProjectQuery = {},
): Promise<FetchList<ApiProject>> {
  const url = buildUrl("/projects", {
    locale: query.locale,
    page: query.page,
    per_page: query.perPage ?? 20,
  });

  try {
    const res = await fetch(
      url,
      cmsFetchOptions("project", query.locale ?? DEFAULT_LOCALE),
    );
    if (!res.ok) {
      throw cmsResponseError(res);
    }
    return (await res.json()) as Paginated<ApiProject>;
  } catch (error) {
    reportCmsFailure("fetchProjects", error);
    return { ...emptyList(), unavailable: true } as FetchList<ApiProject>;
  }
}

/** Один проект по slug (с целями, хронологией и дирекцией). null при 404. */
export const fetchProject = cache(async function fetchProject(
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
      throw cmsResponseError(res);
    }
    const body = (await res.json()) as { data: ApiProject };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchProject", error);
    throw error;
  }
});

// -------------------------------------------------------------- объявления

interface AnnouncementQuery {
  locale?: Locale;
  kind?: "vacancy" | "tender";
  page?: number;
  perPage?: number;
}

/** Список опубликованных объявлений (открытые первыми), постранично. При сбое — пустой результат с `unavailable`. */
export async function fetchAnnouncements(
  query: AnnouncementQuery = {},
): Promise<FetchList<ApiAnnouncement>> {
  const url = buildUrl("/announcements", {
    locale: query.locale,
    kind: query.kind,
    page: query.page,
    per_page: query.perPage ?? 20,
  });

  try {
    const res = await fetch(
      url,
      cmsFetchOptions("announcement", query.locale ?? DEFAULT_LOCALE),
    );
    if (!res.ok) {
      throw cmsResponseError(res);
    }
    return (await res.json()) as Paginated<ApiAnnouncement>;
  } catch (error) {
    reportCmsFailure("fetchAnnouncements", error);
    return { ...emptyList(), unavailable: true } as FetchList<ApiAnnouncement>;
  }
}

/** Одно объявление по slug. null при 404. */
export const fetchAnnouncement = cache(async function fetchAnnouncement(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiAnnouncement | null> {
  const url = buildUrl(`/announcements/${encodeURIComponent(slug)}`, {
    locale,
  });

  try {
    const res = await fetch(url, cmsFetchOptions("announcement", locale, slug));
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      throw cmsResponseError(res);
    }
    const body = (await res.json()) as { data: ApiAnnouncement };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchAnnouncement", error);
    throw error;
  }
});

// --------------------------------------------------- предупреждения / карта

export type PublicAlertLevel =
  "none" | "info" | "warning" | "danger" | "critical";

/**
 * Активные предупреждения (наиболее серьёзные первыми).
 * `null` — CMS не ответила; это НЕ «предупреждений нет»: вызывающая сторона
 * обязана показать состояние недоступности данных вместо пустого списка.
 */
export async function fetchAlerts(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiAlert[] | null> {
  const url = buildUrl("/alerts", { locale });

  try {
    const res = await fetch(url, cmsFetchOptions("alert", locale));
    if (!res.ok) {
      throw cmsResponseError(res);
    }
    const body = (await res.json()) as { data: ApiAlert[] };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchAlerts", error);
    return null;
  }
}

/** Одно предупреждение по slug (с инструкциями и регионами). null при 404. */
export const fetchAlert = cache(async function fetchAlert(
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
      throw cmsResponseError(res);
    }
    const body = (await res.json()) as { data: ApiAlert };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchAlert", error);
    throw error;
  }
});

/**
 * Глобальная сводка обстановки + статусы регионов (для баннера и карты).
 * `null` — CMS не ответила. Раньше сбой подставлял `state: "calm"`, и портал
 * выдавал молчание бэкенда за подтверждённое отсутствие угроз — для сайта ЧС
 * это худший из возможных исходов деградации.
 */
export async function fetchAlertsActive(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiAlertsActive | null> {
  const url = buildUrl("/alerts/active", { locale });

  try {
    const res = await fetch(url, cmsFetchOptions("alert", locale));
    if (!res.ok) {
      throw cmsResponseError(res);
    }
    const body = (await res.json()) as { data: ApiAlertsActive };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchAlertsActive", error);
    return null;
  }
}

/**
 * Статусы регионов для карты рисков. `null` — CMS не ответила; карта в этом
 * состоянии не должна раскрашивать регионы «спокойным» цветом как проверенные.
 * Статус зависит и от предупреждений (`cms:alerts:*`), и от самих регионов
 * (`cms:regions:*` — вебхук `region`).
 */
export async function fetchRegions(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiRegionStatus[] | null> {
  const url = buildUrl("/regions", { locale });

  try {
    const res = await fetch(url, {
      next: {
        revalidate: REVALIDATE,
        tags: [
          ...cmsRequestTags("alert", locale),
          cmsCacheTags.reference("region", locale),
        ],
      },
      signal: timeoutSignal(),
    });
    if (!res.ok) {
      throw cmsResponseError(res);
    }
    const body = (await res.json()) as { data: ApiRegionStatus[] };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchRegions", error);
    return null;
  }
}

// ----------------------------------------------------------------- главная

/**
 * Пустая главная. Раньше её отдавал `fetchHome` при любой ошибке, и страница
 * не могла отличить «CMS сказала, что предупреждений нет» от «CMS не ответила»:
 * `state: "calm"` в обоих случаях давал зелёный баннер «обстановка штатная».
 * Теперь `fetchHome` возвращает `null` при отказе, а это значение страница
 * подставляет сама — уже зная, что данные недостоверны.
 */
export const EMPTY_HOME: ApiHome = {
  blocks: [],
  // Время сверки неизвестно: CMS не ответила. Пустая строка — не время,
  // сводка его не выводит.
  alerts: { state: "calm", count: 0, updated_at: "", regions: [], items: [] },
  news: [],
  instructions: [],
  documents: [],
  announcements: [],
  projects: [],
  emergency_contacts: {},
};

/**
 * Всё, что нужно главной странице, одним запросом.
 * `null` — CMS не ответила; отличать это от пустой выдачи обязательно, иначе
 * портал заявит об отсутствии угроз, когда на самом деле не знает обстановки.
 * Тег `cms:home:{locale}` сбрасывают и правка блоков главной (вебхук `home`),
 * и публикация показанных на ней материалов (каскад в cache-tags.ts).
 */
export async function fetchHome(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiHome | null> {
  const url = buildUrl("/home", { locale });

  try {
    const res = await fetch(url, {
      next: {
        revalidate: REVALIDATE,
        tags: [cmsCacheTags.home(locale)],
      },
      signal: timeoutSignal(),
    });
    if (!res.ok) {
      throw cmsResponseError(res);
    }
    const body = (await res.json()) as { data: ApiHome };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchHome", error);
    return null;
  }
}

// ------------------------------------------------ настройки сайта / меню

/**
 * Публичные настройки сайта: шапка, подвал, SEO по умолчанию, контакты.
 * null при недоступности API. Мемоизированы на время запроса (`cache`):
 * настройки читают и метаданные layout, и сам layout, и страницы, а `signal`
 * отключает встроенную мемоизацию fetch (см. CMS_TIMEOUT_MS).
 */
export const fetchSettings = cache(async function fetchSettings(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiSettings | null> {
  const url = buildUrl("/settings", { locale });

  try {
    const res = await fetch(url, {
      next: {
        revalidate: REVALIDATE,
        tags: [cmsCacheTags.shell(locale)],
      },
      signal: timeoutSignal(),
    });
    if (!res.ok) {
      throw cmsResponseError(res);
    }
    const body = (await res.json()) as { data: ApiSettings };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchSettings", error);
    return null;
  }
});

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
      signal: timeoutSignal(),
    });
    if (!res.ok) {
      throw cmsResponseError(res);
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
        tags: [cmsCacheTags.reference("region", locale)],
      },
      signal: timeoutSignal(),
    });
    if (!res.ok) {
      throw cmsResponseError(res);
    }
    const body = (await res.json()) as { data: ApiRegionOffice[] };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchRegionsDirectory", error);
    return [];
  }
}

/** Запись в руководстве Комитета (страница «Руководство»): председатель или заместитель. */
export interface ApiLeader {
  id: number;
  role: string;
  name: string;
  meta: string | null;
  bio: string | null;
  is_chairman: boolean;
  photo_url: string | null;
}

/**
 * Состав руководства, председатель первым. Пустой массив при сбое.
 * Правку состава вебхук CMS доносит тегом `cms:leadership:{locale}`.
 */
export async function fetchLeadership(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiLeader[]> {
  const url = buildUrl("/leadership", { locale, per_page: 50 });

  try {
    const res = await fetch(url, {
      next: {
        revalidate: REVALIDATE,
        tags: [cmsCacheTags.reference("leadership", locale)],
      },
      signal: timeoutSignal(),
    });
    if (!res.ok) {
      throw cmsResponseError(res);
    }
    const body = (await res.json()) as { data: ApiLeader[] };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchLeadership", error);
    return [];
  }
}

/** Подразделение на странице «Структура»; вложенность — на любую глубину. */
export interface ApiStructureUnit {
  num: string;
  name: string;
  desc: string;
  /** Вложенные подразделения в заданном порядке; у «листа» — пустой массив. */
  children: ApiStructureUnit[];
}

/**
 * Подразделения верхнего уровня (каждое — с вложенными), в заданном порядке.
 * Пустой массив при сбое. Правку структуры вебхук CMS доносит тегом
 * `cms:structure:{locale}`.
 */
export async function fetchStructureUnits(
  locale: Locale = DEFAULT_LOCALE,
): Promise<ApiStructureUnit[]> {
  const url = buildUrl("/structure", { locale, per_page: 50 });

  try {
    const res = await fetch(url, {
      next: {
        revalidate: REVALIDATE,
        tags: [cmsCacheTags.reference("structure", locale)],
      },
      signal: timeoutSignal(),
    });
    if (!res.ok) {
      throw cmsResponseError(res);
    }
    const body = (await res.json()) as { data: ApiStructureUnit[] };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchStructureUnits", error);
    return [];
  }
}

// `fetchPages` («список опубликованных страниц») удалён вместе с последним
// потребителем: его звали только ради slug'ов, а это теперь `fetchSlugs`.
// Сам эндпоинт `/pages` в CMS остаётся — он часть публичного контракта.

/** Одна страница по slug. `null` при 404 / недоступности. */
export const fetchPage = cache(async function fetchPage(
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
      throw cmsResponseError(res);
    }
    const body = (await res.json()) as { data: ApiPageDetail };
    return body.data;
  } catch (error) {
    reportCmsFailure("fetchPage", error);
    throw error;
  }
});

/**
 * CMS-страница для раздела с собственным запасным контентом (/leadership,
 * /structure, /symbols): страница, только если она опубликована И переведена
 * на язык запроса — по той же проверке, что и availableLocalesFor у
 * pages/[slug]. Иначе `null`, и раздел молча показывает свой content.ts:
 *  - 404 — страницы нет или она не опубликована;
 *  - перевода нет — CMS отдала fallback другой локали, выдавать его за
 *    перевод нельзя;
 *  - CMS не ответила (5xx/сеть/таймаут) — разделу нельзя ломаться; сбой уже
 *    записан fetchPage.
 * Данные идут через тот же fetchPage, поэтому раздел инвалидируется теми же
 * тегами вебхука (`cms:pages:{slug}:{locale}`, `cms:pages:{locale}`).
 */
export async function fetchTranslatedPage(
  slug: string,
  locale: Locale,
): Promise<ApiPageDetail | null> {
  try {
    const page = await fetchPage(slug, locale);
    if (!page) {
      return null;
    }
    return (await translationAvailable("page", slug, locale)) ? page : null;
  } catch {
    return null;
  }
}

// ------------------------------------------------- slug'и для генерации URL

/**
 * Сегмент `api/v1/slugs/{type}` для типа контента. Отличается от сегмента
 * маршрута портала (инструкции живут под `/guides`), поэтому карта отдельная,
 * а не переиспользует `RESOURCE_BY_TYPE` из cache-tags.
 */
const SLUG_ENDPOINTS = {
  alert: "alerts",
  announcement: "announcements",
  instruction: "instructions",
  news: "news",
  page: "pages",
  project: "projects",
} as const;

/** Типы контента, у которых есть детальный маршрут, а значит и список slug'ов. */
export type SlugContentType = keyof typeof SLUG_ENDPOINTS;

/**
 * Опубликован ли перевод материала в этой локали.
 *
 * Сигнал — список slug'ов запрошенной локали (контракт `/slugs/{type}`:
 * «slug'и, доступные в запрошенной локали»). При сбое списка считаем
 * перевод доступным: объявлять опубликованный материал непереведённым на
 * основании молчания бэкенда — та же недостоверность, только зеркальная.
 */
export async function translationAvailable(
  type: SlugContentType,
  slug: string,
  locale: Locale,
): Promise<boolean> {
  const slugs = await fetchSlugs(type, locale);
  return slugs === null ? true : slugs.includes(slug);
}

/**
 * Локали, в которых перевод материала ДЕЙСТВИТЕЛЬНО опубликован.
 *
 * Используется детальными маршрутами для hreflang, x-default и честной
 * заметки о переводе. Без этого `buildAlternates` механически объявлял все
 * три языка, и /en-адрес русского fallback'а выдавал себя за полноценную
 * английскую публикацию. Три запроса к `/slugs/{type}` разделяют кэш Next
 * (одни и те же URL с тегами), поэтому на странице это не три похода в CMS.
 */
export async function availableLocalesFor(
  type: SlugContentType,
  slug: string,
): Promise<Locale[]> {
  const present = await Promise.all(
    LOCALES.map((locale) => translationAvailable(type, slug, locale)),
  );
  return LOCALES.filter((_, i) => present[i]);
}

/**
 * Локали, в которых материал опубликован: из `available_locales` его
 * детального ответа CMS (A-3) — прямой ответ на вопрос, без трёх запросов к
 * `/slugs`. Если CMS поля не прислала (старая версия), — по спискам slug'ов,
 * как раньше.
 */
export async function availableLocalesOf(
  item: { available_locales?: readonly string[] | null } | null | undefined,
  type: SlugContentType,
  slug: string,
): Promise<Locale[]> {
  const listed = item?.available_locales;

  if (Array.isArray(listed)) {
    return LOCALES.filter((locale) => listed.includes(toApiLocale(locale)));
  }

  return availableLocalesFor(type, slug);
}

/**
 * Slug'и всех материалов типа, доступных в этой локали — для
 * `generateStaticParams`, карты сайта и проверки наличия перевода.
 *
 * `null` — CMS не ответила. Это не «материалов нет»: карта сайта по пустому
 * списку молча урезалась бы при временном сбое, поэтому null обрабатывается
 * отдельно (см. app/sitemap.ts), а `generateStaticParams` деградирует в
 * рендер по запросу.
 */
/**
 * `generateStaticParams` для детального маршрута: slug'и, которые можно
 * пре-рендерить.
 *
 * Два отсева, оба — про сборку, а не про содержимое:
 *  - CMS не ответила (`null`) → пустой список, маршрут отрендерится по
 *    запросу; урезанная прегенерация лучше упавшей сборки;
 *  - slug длиннее контрактных 180 символов (`isAddressableSlug`) → он не
 *    помещается в имя файла `.next/.../<slug>.segments`, а 255 байт на
 *    компонент пути — предел файловой системы и на Windows, и на Linux.
 *    Один такой материал из CMS ронял весь production-билд; теперь он
 *    просто рендерится по запросу.
 */
export async function fetchStaticParamSlugs(
  type: SlugContentType,
  locale: Locale,
): Promise<{ slug: string }[]> {
  const slugs = await fetchSlugs(type, locale);
  const prerenderable = (slugs ?? []).filter(isAddressableSlug);

  const skipped = (slugs ?? []).length - prerenderable.length;
  if (skipped > 0) {
    console.warn(
      `[static-params] ${type}/${locale}: ${skipped} slug(s) длиннее ${MAX_CMS_SLUG_LENGTH} символов не пре-рендерятся (см. lib/cache-tags.ts).`,
    );
  }

  return prerenderable.map((slug) => ({ slug }));
}

export async function fetchSlugs(
  type: SlugContentType,
  locale: Locale = DEFAULT_LOCALE,
): Promise<string[] | null> {
  const url = buildUrl(`/slugs/${SLUG_ENDPOINTS[type]}`, { locale });

  try {
    const res = await fetch(url, cmsFetchOptions(type, locale));
    if (!res.ok) {
      throw cmsResponseError(res);
    }
    const body = (await res.json()) as SlugListResponse;
    return body.data;
  } catch (error) {
    reportCmsFailure(`fetchSlugs(${type})`, error);
    return null;
  }
}
