// Общие модели данных публичной части (заглушка CMS).
// В реальном проекте эти данные приходят из API/CMS; здесь — типизированные
// фикстуры, чтобы представление было отделено от контента.

export type AlertLevel = "none" | "info" | "warning" | "danger" | "critical";
export type AlertState = "calm" | "warning" | "critical";

export type RegionKey = "dushanbe" | "sughd" | "khatlon" | "rrp" | "gbao";

export interface RegionStatus {
  key: RegionKey;
  name: string;
  level: AlertLevel;
  count: number;
  statusText: string;
}

export interface NewsItem {
  slug: string;
  category: string;
  date: string; // отображаемая дата, напр. «16 июля 2026»
  title: string;
  excerpt?: string;
  photo?: string; // подпись-плейсхолдер или путь к фото
  featured?: boolean;
}

export interface AlertItem {
  slug: string;
  level: AlertLevel;
  levelLabel: string;
  status: string; // «Действует» / дата
  title: string;
  region: string;
  datetime: string;
  summary: string;
}

export type ProjectStatus = "Реализуется" | "Подготовка" | "Завершён";

export interface ProjectItem {
  slug: string;
  title: string;
  status: ProjectStatus;
  years: string;
  partner: string;
  budget: string;
  desc: string;
}

export interface DocItem {
  type: string; // Закон / Постановление / Отчёт …
  title: string;
  number?: string;
  date: string;
  lang: string; // РУ / ТҶ …
  size: string; // «PDF · 0,4 МБ»
  href?: string;
}

export type AnnouncementKind = "vacancy" | "tender";
export interface Announcement {
  kind: AnnouncementKind;
  title: string;
  deadline: string;
  status: "open" | "closed";
  statusLabel: string;
  meta?: string;
}

export interface GuideItem {
  slug: string;
  title: string;
  desc: string;
  priority?: boolean;
  icon?: string;
}

export interface Person {
  name: string;
  position: string;
  bio?: string;
  photo?: string;
  phone?: string;
  email?: string;
}
