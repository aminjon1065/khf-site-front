// Карта маршрутов публичной части. Ссылки в референсах указывают на *.dc.html —
// здесь сопоставление с реальными путями Next.js (App Router).
//
// У функций слаг обязателен: раньше стояли значения по умолчанию
// ("zamin-2026", "earthquake" и т. п.), и вызов без аргумента давал внешне
// исправную ссылку на материал, которого в CMS нет.
export const routes = {
  home: "/",
  alert: "/alerts",
  news: "/news",
  article: (slug: string) => `/news/${slug}`,
  guides: "/guides",
  guide: (slug: string) => `/guides/${slug}`,
  map: "/map",
  documents: "/documents",
  contacts: "/contacts",
  about: "/about",
  leadership: "/leadership",
  structure: "/structure",
  symbols: "/symbols",
  sos: "/sos",
  projects: "/projects",
  project: (slug: string) => `/projects/${slug}`,
  announcements: "/announcements",
  announcement: (slug: string) => `/announcements/${slug}`,
  /** Страница CMS: канонический раздел для slug'ов из CMS_PAGE_ROUTES, иначе `/pages/{slug}`. */
  page: (slug: string) => cmsPagePath(slug),
  sitemap: "/sitemap",
} as const;

/**
 * CMS-страницы (`Page`), у которых есть собственный раздел сайта вместо
 * общего `/pages/{slug}`. Контракт с CMS: по этой же таблице она строит
 * ссылки «Открыть на сайте», поэтому меняется таблица только вместе с CMS.
 * Из неё же next.config.ts строит 308-редиректы `/{locale}/pages/{slug}` →
 * раздел (у материала один адрес), а sitemap.xml — адреса страниц.
 */
export const CMS_PAGE_ROUTES = {
  about: routes.about,
  leadership: routes.leadership,
  structure: routes.structure,
  symbols: routes.symbols,
} as const;

export type CanonicalCmsPageSlug = keyof typeof CMS_PAGE_ROUTES;

/** Есть ли у CMS-страницы собственный раздел (без ловушки `"toString" in …`). */
export function isCanonicalCmsPage(slug: string): slug is CanonicalCmsPageSlug {
  return Object.prototype.hasOwnProperty.call(CMS_PAGE_ROUTES, slug);
}

/** Публичный путь CMS-страницы (без префикса локали). */
export function cmsPagePath(slug: string): string {
  return isCanonicalCmsPage(slug) ? CMS_PAGE_ROUTES[slug] : `/pages/${slug}`;
}

// Значение для prop `active` в шапке (подчёркивание активного пункта).
export type NavKey =
  | "home"
  | "about"
  | "news"
  | "guides"
  | "map"
  | "documents"
  | "projects"
  | "announcements"
  | "contacts"
  | "";
