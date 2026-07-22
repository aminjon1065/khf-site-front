// Контент детальных страниц проектов (заглушка CMS).
// Ключ — slug проекта; неизвестные slug'и отдаются с фолбэком на
// «early-warning-system». Всё, что видит пользователь, живёт здесь — представление
// (page.tsx) не содержит зашитых строк.
import type { Locale } from "@/lib/i18n/config";
import { routes } from "@/lib/routes";

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

const earlyWarningSystem: ProjectContent = {
  slug: "early-warning-system",
  metaTitle: "Система раннего оповещения",
  status: "Реализуется",
  years: "2026–2030",
  code: "Проект 01",
  title: "Модернизация системы раннего оповещения населения",
  meta: [
    { label: "Заказчик", value: "КЧС Республики Таджикистан" },
    { label: "Партнёры", value: "УСРБ ООН, Всемирный банк" },
    { label: "Бюджет", value: "18,4 млн долл. США" },
    { label: "Сроки", value: "январь 2026 — декабрь 2030" },
  ],
  goals: {
    title: "Цели и задачи",
    intro:
      "Проект направлен на создание современной многоканальной системы раннего оповещения населения о чрезвычайных ситуациях — от схода селей до землетрясений. Сигнал, сформированный Центром управления в кризисных ситуациях, будет доходить до жителей за минуты по всем доступным каналам одновременно.",
    items: [
      {
        n: "01",
        text: "Установка 180 сиренно-речевых установок в 47 селеопасных джамоатах Хатлонской области, РРП и ГБАО.",
      },
      {
        n: "02",
        text: "Запуск ячеистого вещания (Cell Broadcast) совместно с операторами мобильной связи — оповещение всех телефонов в зоне риска без подписки.",
      },
      {
        n: "03",
        text: "Интеграция датчиков гидрометеослужбы, сейсмостанций и постов наблюдения в единую платформу ЦУКС.",
      },
      {
        n: "04",
        text: "Обучение 2 000 ответственных лиц джамоатов и регулярные учения с населением.",
      },
    ],
  },
  timeline: {
    title: "Ход реализации",
    items: [
      {
        tone: "success",
        date: "Июнь 2026",
        text: "Завершено проектирование первой очереди — 60 установок в Кулябской зоне. Объявлен тендер на закупку оборудования.",
      },
      {
        tone: "success",
        date: "Апрель 2026",
        text: "Подписано соглашение о финансировании с Всемирным банком; создана дирекция проекта.",
      },
      {
        tone: "info",
        date: "IV квартал 2026 — план",
        text: "Монтаж первых 20 установок, пилотный запуск Cell Broadcast в Дангаринском районе.",
      },
    ],
  },
  photo: {
    label: "Фото: монтаж сиренной установки",
    caption:
      "Монтаж сиренно-речевой установки в джамоате Себистон. Фото: дирекция проекта",
  },
  tenders: {
    title: "Тендеры проекта",
    items: [
      {
        tone: "open",
        statusLabel: "Приём заявок",
        deadline: "до 05.08.2026",
        title: "Закупка аварийно-спасательного инструмента",
        href: routes.announcements,
      },
      {
        tone: "soon",
        statusLabel: "Скоро",
        deadline: "III квартал 2026",
        title: "Поставка сиренно-речевых установок, 1-я очередь",
        href: routes.announcements,
      },
    ],
    allLabel: "Все объявления",
    allHref: routes.announcements,
  },
  direction: {
    title: "Дирекция проекта",
    addressLines: ["г. Душанбе, ул. Лохути, 26, каб. 314"],
    phone: "+992 (37) 221-59-00",
    phoneHref: "tel:+992372215900",
    email: "ews@khf.tj",
  },
  related: {
    title: "Другие проекты",
    items: [
      { title: "Снижение риска бедствий в бассейне реки Пяндж", href: routes.projects },
      { title: "Модернизация единой службы спасения 112", href: routes.projects },
      { title: "Сейсмоустойчивость школ и больниц", href: routes.projects },
    ],
  },
};

/** Карта slug → контент. Пополняется по мере появления новых проектов. */
export const projectsContent: Record<string, ProjectContent> = {
  "early-warning-system": earlyWarningSystem,
};

/** Список известных slug'ов — для generateStaticParams. */
export const projectSlugs = Object.keys(projectsContent);

/** Контент по slug с фолбэком на «early-warning-system». */
export function getProjectContent(slug: string): ProjectContent {
  return projectsContent[slug] ?? earlyWarningSystem;
}
