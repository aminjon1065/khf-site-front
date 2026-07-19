// Карта маршрутов публичной части. Ссылки в референсах указывают на *.dc.html —
// здесь сопоставление с реальными путями Next.js (App Router).
export const routes = {
  home: "/",
  alert: "/alerts",
  news: "/news",
  article: (slug = "zamin-2026") => `/news/${slug}`,
  guides: "/guides",
  guide: (slug = "earthquake") => `/guides/${slug}`,
  map: "/map",
  documents: "/documents",
  contacts: "/contacts",
  leadership: "/leadership",
  structure: "/structure",
  symbols: "/symbols",
  sos: "/sos",
  projects: "/projects",
  project: (slug = "early-warning-system") => `/projects/${slug}`,
  announcements: "/announcements",
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
  | "contacts"
  | "";
