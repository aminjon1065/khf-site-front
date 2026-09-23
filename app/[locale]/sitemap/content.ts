// Контент страницы «Карта сайта» (заглушка CMS). Иерархическая структура
// разделов портала: сгруппированные ссылки на все публичные страницы. Все пути —
// через общий модуль `routes`, чтобы карта сайта не расходилась с реальной
// навигацией. Текст локализован: getSitemap(locale) возвращает ru/tj/en.
import type { Locale } from "@/lib/i18n/config";
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

const ru: SitemapContent = {
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
        { label: "О Комитете", href: routes.about },
        { label: "Руководство", href: routes.leadership },
        { label: "Структура Комитета", href: routes.structure },
        { label: "Государственные символы", href: routes.symbols },
        {
          label: "Новости и заявления",
          href: routes.news,
          spaced: true,
        },
        { label: "Документы", href: routes.documents, spaced: true },
        { label: "Объявления — вакансии и тендеры", href: routes.announcements },
        {
          label: "Проекты и программы",
          href: routes.projects,
        },
      ],
    },
    {
      title: "Гражданам",
      links: [
        {
          label: "Безопасность населения",
          href: routes.guides,
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

const tj: SitemapContent = {
  title: "Харитаи сомона",
  intro: "Сохтори иерархии бахшҳои портали расмии КҲФ.",
  groups: [
    {
      title: "Портал",
      links: [
        {
          label: "Саҳифаи асосӣ",
          href: routes.home,
          children: [
            { label: "Вазъияти оперативӣ", href: routes.home },
            { label: "Амалҳои фаврӣ", href: routes.home },
            { label: "Вазъият аз рӯи минтақаҳо", href: routes.home },
          ],
        },
        { label: "Харитаи хатарҳо", href: routes.map, spaced: true },
        { label: "Огоҳиҳо", href: routes.alert },
        { label: "Барномаи мобилии SOS", href: routes.sos },
      ],
    },
    {
      title: "Дар бораи мо ва маълумот",
      links: [
        { label: "Дар бораи Кумита", href: routes.about },
        { label: "Роҳбарият", href: routes.leadership },
        { label: "Сохтори Кумита", href: routes.structure },
        { label: "Рамзҳои давлатӣ", href: routes.symbols },
        {
          label: "Хабарҳо ва баёнияҳо",
          href: routes.news,
          spaced: true,
        },
        { label: "Ҳуҷҷатҳо", href: routes.documents, spaced: true },
        { label: "Эълонҳо — ҷойҳои холӣ ва тендерҳо", href: routes.announcements },
        {
          label: "Лоиҳаҳо ва барномаҳо",
          href: routes.projects,
        },
      ],
    },
    {
      title: "Ба шаҳрвандон",
      links: [
        {
          label: "Бехатарии аҳолӣ",
          href: routes.guides,
        },
        {
          label: "Тамос ва идораҳои минтақавӣ",
          href: routes.contacts,
          spaced: true,
          children: [{ label: "Қабулгоҳи электронӣ", href: routes.contacts }],
        },
        { label: "Харитаи сомона", href: routes.sitemap, spaced: true, current: true },
      ],
    },
  ],
};

const en: SitemapContent = {
  title: "Sitemap",
  intro: "Hierarchical structure of the sections of the official CoES portal.",
  groups: [
    {
      title: "Portal",
      links: [
        {
          label: "Home page",
          href: routes.home,
          children: [
            { label: "Operational situation", href: routes.home },
            { label: "Quick actions", href: routes.home },
            { label: "Situation by region", href: routes.home },
          ],
        },
        { label: "Risk map", href: routes.map, spaced: true },
        { label: "Alerts", href: routes.alert },
        { label: "SOS mobile app", href: routes.sos },
      ],
    },
    {
      title: "About us and information",
      links: [
        { label: "About the Committee", href: routes.about },
        { label: "Leadership", href: routes.leadership },
        { label: "Committee structure", href: routes.structure },
        { label: "State symbols", href: routes.symbols },
        {
          label: "News & statements",
          href: routes.news,
          spaced: true,
        },
        { label: "Documents", href: routes.documents, spaced: true },
        { label: "Announcements — vacancies and tenders", href: routes.announcements },
        {
          label: "Projects & programmes",
          href: routes.projects,
        },
      ],
    },
    {
      title: "For citizens",
      links: [
        {
          label: "Public safety",
          href: routes.guides,
        },
        {
          label: "Contacts and regional offices",
          href: routes.contacts,
          spaced: true,
          children: [{ label: "Electronic reception", href: routes.contacts }],
        },
        { label: "Sitemap", href: routes.sitemap, spaced: true, current: true },
      ],
    },
  ],
};

/** Контент «Карта сайта» для активной локали. */
export function getSitemap(locale: Locale): SitemapContent {
  return { ru, tj, en }[locale];
}
