// Контент страницы «Карта сайта» (заглушка CMS). Иерархическая структура
// разделов портала: сгруппированные ссылки на все публичные страницы. Все пути —
// через общий модуль `routes`, чтобы карта сайта не расходилась с реальной
// навигацией.
import { routes } from "@/lib/routes";

/** Ссылка карты сайта. `current` — текущая страница (aria-current). */
export interface SitemapLink {
  label: string;
  href: string;
  /** Вложенные подпункты (рендерятся списком с левой линией). */
  children?: SitemapLink[];
  /** Дополнительный отступ сверху — визуальная группировка внутри колонки. */
  spaced?: boolean;
  /** Текущая страница — помечается aria-current="page". */
  current?: boolean;
}

/** Колонка карты сайта: заголовок раздела + список ссылок. */
export interface SitemapGroup {
  title: string;
  links: SitemapLink[];
}

export interface SitemapContent {
  title: string;
  intro: string;
  groups: SitemapGroup[];
}

export const sitemap: SitemapContent = {
  title: "Карта сайта",
  intro: "Иерархическая структура разделов официального портала КЧС.",
  groups: [
    {
      title: "Портал",
      links: [
        {
          label: "Главная страница",
          href: routes.home,
          children: [
            { label: "Оперативная обстановка", href: routes.home },
            { label: "Быстрые действия", href: routes.home },
            { label: "Обстановка по регионам", href: routes.home },
          ],
        },
        { label: "Карта рисков", href: routes.map, spaced: true },
        { label: "Предупреждения", href: routes.alert },
        { label: "Мобильное приложение SOS", href: routes.sos },
      ],
    },
    {
      title: "О нас и информация",
      links: [
        { label: "Руководство", href: routes.leadership },
        { label: "Структура Комитета", href: routes.structure },
        { label: "Государственные символы", href: routes.symbols },
        {
          label: "Новости и заявления",
          href: routes.news,
          spaced: true,
          children: [{ label: "Страница новости", href: routes.article() }],
        },
        { label: "Документы", href: routes.documents, spaced: true },
        { label: "Объявления — вакансии и тендеры", href: routes.announcements },
        {
          label: "Проекты и программы",
          href: routes.projects,
          children: [{ label: "Страница проекта", href: routes.project() }],
        },
      ],
    },
    {
      title: "Гражданам",
      links: [
        {
          label: "Безопасность населения",
          href: routes.guides,
          children: [
            { label: "Действия при землетрясении", href: routes.guide("earthquake") },
            { label: "Все инструкции (12 тем)", href: routes.guides },
          ],
        },
        {
          label: "Контакты и региональные управления",
          href: routes.contacts,
          spaced: true,
          children: [{ label: "Электронная приёмная", href: routes.contacts }],
        },
        { label: "Карта сайта", href: routes.sitemap, spaced: true, current: true },
      ],
    },
  ],
};
