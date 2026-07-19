import { routes } from "@/lib/routes";

// Общие строки интерфейса (шапка, подвал, служебные подписи). Русская
// локаль — канонический контент портала (демо). Точка расширения на ТҶ/EN:
// добавить параллельные словари и выбирать по активному языку.

export const common = {
  siteName: "КЧС и ГО Республики Таджикистан",
  siteShort: "КЧС РТ",
  siteDescription:
    "Комитет по чрезвычайным ситуациям и гражданской обороне при Правительстве Республики Таджикистан",
  skipToContent: "Перейти к содержанию",

  header: {
    committeeTitle: ["Комитет по чрезвычайным ситуациям", "и гражданской обороне"],
    committeeSub: "при Правительстве Республики Таджикистан",
    stateSymbols: "Государственные символы",
    sitemap: "Карта сайта",
    subdivisions: "Подразделения",
    themeToggle: "Переключить тему",
    themeTitle: "Светлая / тёмная тема",
    langGroup: "Забон / Язык",
    trustPhoneLabel: "Единый телефон доверия",
    trustPhone: "+992 (37) 221-59-00",
    trustPhoneHref: "tel:+992372215900",
    emergencyAria: "Экстренный вызов 112",
    openMenu: "Открыть меню",
    closeMenu: "Закрыть меню",
    menu: "Меню",
    searchPlaceholder: "Поиск по порталу",
    sosApp: "Приложение SOS",
    aboutMenu: "О нас",
    emergencyCallMobile: "112 — экстренный вызов",
    trustLineMobile: "Телефон доверия:",
  },

  nav: {
    home: "Главная",
    news: "Новости",
    guides: "Безопасность",
    map: "Карта рисков",
    documents: "Документы",
    contacts: "Контакты",
    projects: "Проекты",
    announcements: "Объявления",
    leadership: "Руководство",
    structure: "Структура",
  },

  langNotice: {
    tj: "Тарҷумаи тоҷикӣ дар CMS пешбинӣ шудааст — ин демо бо забони русӣ нишон дода мешавад.",
    en: "The English version is available in the CMS for international partners — this demo is shown in Russian.",
  },

  footer: {
    orgTitle: "КЧС и ГО Республики Таджикистан",
    about:
      "Государственный орган по предупреждению и ликвидации чрезвычайных ситуаций, защите населения и территорий Республики Таджикистан.",
    address: ["г. Душанбе, ул. Лохути, 26", "info@khf.tj"],
    sectionsTitle: "Разделы",
    sections: [
      { label: "Руководство", href: routes.leadership },
      { label: "Структура", href: routes.structure },
      { label: "Приложение SOS", href: routes.sos },
      { label: "Новости и заявления", href: routes.news },
      { label: "Инструкции населению", href: routes.guides },
      { label: "Карта рисков", href: routes.map },
      { label: "Документы", href: routes.documents },
      { label: "Проекты и программы", href: routes.projects },
      { label: "Вакансии и тендеры", href: routes.announcements },
      { label: "Контакты и приёмная", href: routes.contacts },
    ],
    emergencyTitle: "Экстренные службы",
    emergency: [
      { num: "112", label: "единая служба спасения" },
      { num: "101", label: "пожарная охрана" },
      { num: "102", label: "милиция" },
      { num: "103", label: "скорая помощь" },
    ],
    resourcesTitle: "Государственные ресурсы",
    resources: [
      { label: "Государственные символы", href: routes.symbols, external: false },
      { label: "Президент Республики Таджикистан", href: "https://president.tj", external: true },
      { label: "МИД Республики Таджикистан", href: "https://mfa.tj", external: true },
      { label: "khf.tj — официальный сайт", href: "https://khf.tj", external: true },
      { label: "Открытые данные", href: "#", external: false },
      { label: "Карта сайта", href: routes.sitemap, external: false },
    ],
    copyright:
      "© 2026 Комитет по чрезвычайным ситуациям и гражданской обороне. Все материалы являются официальной информацией; при использовании ссылка на khf.tj обязательна.",
    legal: [
      { label: "Защита персональных данных", href: "#" },
      { label: "Доступность", href: "#" },
    ],
    visitsToday: "Посещений сегодня: 4 218",
    updated: "Обновлено: 18.07.2026",
  },

  breadcrumbHome: "Главная",
} as const;
