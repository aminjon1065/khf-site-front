// Типы детальной страницы проекта /projects/[slug]. Сами данные приходят из
// CMS (fetchProject, lib/api.ts) — здесь только форма (ProjectContent) и
// локализованные крошки (getProjectBreadcrumb), без демо-контента.
import type { Locale } from "@/lib/i18n/config";

/** Семантический тон точки на таймлайне → хазард-токен в представлении. */
export type TimelineTone = "success" | "info" | "warning" | "danger" | "critical";
/** Тон статуса тендера: открыт приём заявок / ожидается. */
export type TenderTone = "open" | "soon";

export interface ProjectMetaItem {
  label: string;
  value: string;
}

export interface ProjectGoal {
  n: string;
  text: string;
}

export interface ProjectTimelineItem {
  tone: TimelineTone;
  date: string;
  text: string;
}

export interface ProjectTender {
  tone: TenderTone;
  statusLabel: string;
  deadline: string;
  title: string;
  href: string;
}

export interface RelatedProject {
  title: string;
  href: string;
}

export interface ProjectContent {
  slug: string;
  /** Короткий заголовок вкладки/крошки. */
  metaTitle: string;
  status: string;
  years: string;
  code: string;
  title: string;
  meta: ProjectMetaItem[];
  goals: { title: string; intro: string; items: ProjectGoal[] };
  timeline: { title: string; items: ProjectTimelineItem[] };
  photo: { label: string; caption: string };
  tenders: {
    title: string;
    items: ProjectTender[];
    allLabel: string;
    allHref: string;
  };
  direction: {
    title: string;
    addressLines: string[];
    phone: string;
    phoneHref: string;
    email: string;
  };
  related: { title: string; items: RelatedProject[] };
}

/** Крошки — общие для всех детальных страниц проектов. */
type ProjectBreadcrumb = { home: string; projects: string };

const ru: ProjectBreadcrumb = { home: "Главная", projects: "Проекты" };
const tj: ProjectBreadcrumb = { home: "Асосӣ", projects: "Лоиҳаҳо" };
const en: ProjectBreadcrumb = { home: "Home", projects: "Projects" };

/** Крошки детальной страницы проекта для активной локали. */
export function getProjectBreadcrumb(locale: Locale): ProjectBreadcrumb {
  return { ru, tj, en }[locale];
}
