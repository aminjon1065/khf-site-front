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
  leadership: "/leadership",
  structure: "/structure",
  symbols: "/symbols",
  sos: "/sos",
  projects: "/projects",
  project: (slug: string) => `/projects/${slug}`,
  announcements: "/announcements",
  announcement: (slug: string) => `/announcements/${slug}`,
  sitemap: "/sitemap",
} as const;

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
