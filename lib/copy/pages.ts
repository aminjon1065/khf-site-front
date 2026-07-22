// Строки интерфейса страниц/секций, которых нет в CMS и в постраничных content.ts:
// заголовки секций, aria-метки, служебные подписи, <title> и т.п. Русский —
// канон; параллельные переводы в lib/i18n/dictionaries/{tj,en}.ts.

export const pages = {
  // <title> страниц (используются в generateMetadata).
  meta: {
    projects: "Проекты и программы",
    documents: "Документы",
    contacts: "Контакты",
    guides: "Безопасность населения",
    leadership: "Руководство",
    structure: "Структура",
    symbols: "Государственные символы",
    sitemap: "Карта сайта",
    sos: "Приложение SOS",
    projectFallback: "Проект",
    projectSuffix: "Проекты",
    alertFallback: "Предупреждение",
    newsFallback: "Новость",
    guideFallback: "Инструкция",
    pageFallback: "Страница",
    alerts: "Предупреждения",
  },

  // Aria-метки секций и alt главной страницы.
  home: {
    main: "Главное",
    presidentPhotoAlt: "Фото Президента",
    quickActions: "Быстрые действия",
    alertsMap: "Карта предупреждений",
    mapLegend: "Легенда карты",
    regionsList: "Обстановка по регионам — список",
    latestAlerts: "Последние предупреждения",
    news: "Новости",
    kpis: "Ключевые показатели",
    officialInfo: "Официальная информация",
  },

  // Страница «Предупреждения» (список).
  alertsList: {
    breadcrumb: "Предупреждения",
    heading: "Предупреждения",
    situationAria: "Обстановка",
    listAria: "Активные предупреждения",
    noneActive: "нет действующих",
    activeCountSuffix: "действующих",
    emptyTitle: "Действующих предупреждений нет",
    emptyText: "Обстановка на территории республики штатная.",
    regionsHeading: "Обстановка по регионам",
    openMap: "Открыть карту рисков",
    emergencyHelp: "Экстренная помощь",
    emergencyNote: "Единый номер экстренных служб, круглосуточно",
    state: {
      calm: {
        label: "Обстановка штатная",
        text: "Действующих предупреждений по республике нет. Следите за официальными сообщениями Комитета.",
      },
      warning: {
        label: "Действуют предупреждения",
        text: "По ряду регионов объявлен повышенный уровень опасности. Соблюдайте меры предосторожности.",
      },
      critical: {
        label: "Критическая обстановка",
        text: "В отдельных регионах действует критический уровень опасности. Следуйте указаниям спасательных служб.",
      },
    },
  },

  // Детальная страница предупреждения.
  alertDetail: {
    breadcrumbHome: "Главная",
    breadcrumbAlerts: "Предупреждения",
    aria: "Предупреждение",
    whatToDo: "Что делать сейчас",
    officialDescription: "Официальное описание",
    officialInfo: "Официальная информация",
    guidesLink: "Инструкции населению",
    zone: "Зона действия",
    emergencyHelp: "Экстренная помощь",
    related: "Связанные предупреждения",
    share: "Поделиться",
    shared: "Ссылка скопирована",
  },

  // Детальная страница проекта.
  projectDetail: {
    aria: "О проекте",
    customer: "Заказчик",
    partners: "Партнёры",
    budget: "Бюджет",
    term: "Сроки",
    goalsAria: "Цели проекта",
    goalsTitle: "Цели и задачи",
    moreTitle: "Подробнее о проекте",
    timelineTitle: "Ход реализации",
    photoAria: "Фото",
    photoLabel: "Фото проекта",
    direction: "Дирекция проекта",
    otherProjects: "Другие проекты",
  },

  // Детальная страница инструкции.
  guideDetail: {
    kicker: "Инструкция населению",
    keyPoint: "Главное",
    prohibited: "Чего делать нельзя",
    more: "Подробнее",
    emergencyHelp: "Экстренная помощь",
    emergencyNote: "Единая служба спасения, круглосуточно",
    related: "Связанные инструкции",
    blocks: {
      before: { tag: "До", title: "Подготовьтесь заранее", aria: "До события" },
      during: { tag: "Во время", title: "Во время события", aria: "Во время события" },
      after: { tag: "После", title: "После события", aria: "После события" },
    },
  },

  // Информационная страница CMS (pages/[slug]).
  contentPage: {
    breadcrumbAria: "Хлебные крошки",
    updated: "Обновлено:",
    placeholder: "Содержание страницы готовится.",
  },

  // Страница поиска.
  search: {
    title: "Поиск",
    submit: "Найти",
    promptShort: "Введите минимум 2 символа для поиска.",
    emptyPrefix: "Ничего не найдено по запросу",
    resultsPrefix: "Результаты по запросу",
    typeLabels: {
      news: "Новости",
      alert: "Предупреждение",
      instruction: "Инструкция",
      document: "Документ",
      project: "Проект",
      announcement: "Объявление",
      page: "Страница",
    },
  },

  // Прочие постраничные подписи.
  projectsList: { empty: "Проекты пока не опубликованы." },
  leadership: { chairmanAria: "Председатель", deputiesAria: "Заместители" },
  guidesList: {
    mainThreats: "Основные угрозы",
    allGuides: "Все инструкции",
    mainRisk: "Главный риск республики",
    priorityGuide: "Приоритетная инструкция",
    topicsSuffix: "тем",
    empty: "Инструкции пока не опубликованы.",
  },
  sosPage: { app: "Приложение SOS", features: "Возможности", how: "Как работает SOS" },
  newsDetail: {
    pressKicker: "Пресс-служба КЧС",
    pressSource: "Пресс-центр КЧС",
    newsCategory: "Новости",
  },
} as const;
