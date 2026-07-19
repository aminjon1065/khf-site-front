// Контент страницы «Проекты и программы» (заглушка CMS). Представление
// (app/projects/page.tsx) читает только отсюда — никаких строк в JSX.
import type { ProjectItem, ProjectStatus } from "@/lib/types";
import { routes } from "@/lib/routes";

export interface CrumbItem {
  label: string;
  href?: string;
}

export interface ProjectsContent {
  breadcrumbs: CrumbItem[];
  title: string;
  intro: string;
  /** Подписи метаданных в футере карточки. */
  cardLabels: { partner: string; budget: string };
  /** Нижний блок со ссылками на смежные разделы. */
  related: {
    aria: string;
    text: string;
    tenders: string;
    reports: string;
  };
  projects: ProjectItem[];
}

/** Цвета статус-тега проекта — из семантической шкалы опасности (токены). */
export const projectStatusColors: Record<ProjectStatus, { bg: string; fg: string }> = {
  Реализуется: { bg: "var(--hz-success-bg)", fg: "var(--hz-success)" },
  Подготовка: { bg: "var(--hz-info-bg)", fg: "var(--hz-info)" },
  Завершён: { bg: "var(--color-neutral-100)", fg: "var(--color-neutral-800)" },
};

export const projectsContent: ProjectsContent = {
  breadcrumbs: [
    { label: "Главная", href: routes.home },
    { label: "Проекты" },
  ],
  title: "Проекты и программы",
  intro:
    "Государственные программы и проекты технической помощи, заказчиком или исполнителем которых является Комитет: цели, сроки, источники финансирования и ход реализации. Закупки и тендеры проводятся в рамках этих проектов.",
  cardLabels: {
    partner: "Партнёр:",
    budget: "Бюджет:",
  },
  related: {
    aria: "Связанные разделы",
    text:
      "Закупки товаров и услуг в рамках проектов проводятся на конкурсной основе. Действующие тендеры публикуются в разделе объявлений.",
    tenders: "Тендеры и объявления",
    reports: "Отчёты по проектам →",
  },
  projects: [
    {
      slug: "early-warning-system",
      title: "Модернизация системы раннего оповещения населения",
      status: "Реализуется",
      years: "2026–2030",
      partner: "УСРБ ООН, Всемирный банк",
      budget: "18,4 млн долл. США",
      desc:
        "Сирены и ячейковое вещание в 47 селеопасных джамоатах, интеграция с гидрометеослужбой и службой 112.",
    },
    {
      slug: "panj-river-drr",
      title: "Снижение риска бедствий в бассейне реки Пяндж",
      status: "Реализуется",
      years: "2024–2028",
      partner: "Фонд Ага Хана, Правительство Швейцарии",
      budget: "9,6 млн долл. США",
      desc:
        "Берегоукрепление, селеотводные каналы и обучение добровольных команд реагирования в 60 кишлаках ГБАО и Хатлона.",
    },
    {
      slug: "rescue-112-modernization",
      title: "Модернизация единой службы спасения 112",
      status: "Реализуется",
      years: "2025–2027",
      partner: "Европейский союз",
      budget: "6,2 млн евро",
      desc:
        "Новый центр обработки вызовов, цифровая радиосвязь и аварийно-спасательный инструмент для региональных управлений.",
    },
    {
      slug: "seismic-safety-schools",
      title: "Сейсмоустойчивость школ и больниц",
      status: "Подготовка",
      years: "2027–2031",
      partner: "Всемирный банк, JICA",
      budget: "оценка — 25 млн долл. США",
      desc:
        "Обследование и усиление 120 социальных объектов в зонах сейсмичности 8–9 баллов, типовые проекты безопасных школ.",
    },
  ],
};
