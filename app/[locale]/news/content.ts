import type { Locale } from "@/lib/i18n/config";
import { routes } from "@/lib/routes";

// Текстовый контент страницы «Новости и заявления». Список новостей и категории
// фильтра берутся из CMS (NewsList строит их из данных), поэтому здесь только
// подписи интерфейса. Локализовано: getNews(locale) → ru/tj/en.

const ru = {
  metaTitle: "Новости и заявления",
  metaDescription:
    "Официальные новости, заявления и сообщения пресс-службы Комитета по чрезвычайным ситуациям Таджикистана.",

  header: {
    title: "Новости и заявления",
    kicker: "Пресс-служба КЧС",
  },

  filter: {
    groupAria: "Категории",
    allCategory: "Все",
    searchPlaceholder: "Поиск по новостям",
    searchAria: "Поиск по новостям",
    submit: "Найти",
    // Мобильное представление фильтра: вместо ряда кнопок — select в той же
    // GET-форме (состояние живёт в адресе, работает и без JS).
    categorySelect: "Категория",
    resultsPrefix: "Результатов",
    reload: "Обновить страницу",
  },

  feed: {
    aria: "Список новостей",
  },

  empty: {
    title: "Ничего не найдено",
    text: "Попробуйте изменить запрос или выбрать другую категорию.",
    reset: "Сбросить фильтры",
    // CMS не ответила — это не «ничего не найдено»: список может быть непустым.
    unavailableTitle: "Новости временно недоступны",
    unavailableText:
      "Не удалось получить список новостей. Проверьте подключение или обновите страницу позже.",
  },

  aside: {
    media: {
      title: "Для СМИ",
      text: "Аккредитация журналистов и официальные комментарии — через пресс-службу Комитета.",
      email: "press@khf.tj",
      emailAria: "Написать в пресс-службу",
      href: "mailto:press@khf.tj",
    },
    // Раньше здесь стояла форма подписки на оповещения о ЧС: поле и кнопка
    // вне <form>, без обработчика, при отсутствующем эндпоинте подписки в API.
    // Портал обещал предупреждения по региону и молча ничего не отправлял.
    alerts: {
      title: "Действующие предупреждения",
      text: "Обстановка по регионам и активные предупреждения публикуются на портале.",
      link: "Все предупреждения →",
      href: routes.alert,
    },
  },
};

type NewsContent = typeof ru;

const tj: NewsContent = {
  metaTitle: "Хабарҳо ва баёнияҳо",
  metaDescription:
    "Хабарҳо, баёнияҳо ва паёмҳои расмии хадамоти матбуоти Кумитаи ҳолатҳои фавқулодаи Тоҷикистон.",

  header: {
    title: "Хабарҳо ва баёнияҳо",
    kicker: "Хадамоти матбуоти КҲФ",
  },

  filter: {
    groupAria: "Категорияҳо",
    allCategory: "Ҳама",
    searchPlaceholder: "Ҷустуҷӯ дар хабарҳо",
    searchAria: "Ҷустуҷӯ дар хабарҳо",
    submit: "Ҷустуҷӯ",
    categorySelect: "Категория",
    resultsPrefix: "Натиҷаҳо",
    reload: "Саҳифаро нав кардан",
  },

  feed: {
    aria: "Рӯйхати хабарҳо",
  },

  empty: {
    title: "Ҳеҷ чиз ёфт нашуд",
    text: "Дархостро тағйир диҳед ё категорияи дигар интихоб кунед.",
    reset: "Тоза кардани полоишҳо",
    unavailableTitle: "Хабарҳо муваққатан дастрас нестанд",
    unavailableText:
      "Рӯйхати хабарҳо гирифта нашуд. Пайвастшавиро тафтиш кунед ё саҳифаро баъдтар нав кунед.",
  },

  aside: {
    media: {
      title: "Барои ВАО",
      text: "Аккредитатсияи рӯзноманигорон ва шарҳҳои расмӣ — тавассути хадамоти матбуоти Кумита.",
      email: "press@khf.tj",
      emailAria: "Навиштан ба хадамоти матбуот",
      href: "mailto:press@khf.tj",
    },
    alerts: {
      title: "Огоҳиҳои амалкунанда",
      text: "Вазъият аз рӯи минтақаҳо ва огоҳиҳои фаъол дар портал нашр мешаванд.",
      link: "Ҳамаи огоҳиҳо →",
      href: routes.alert,
    },
  },
};

const en: NewsContent = {
  metaTitle: "News & statements",
  metaDescription:
    "Official news, statements and press releases from the Committee of Emergency Situations of Tajikistan.",

  header: {
    title: "News & statements",
    kicker: "CoES press office",
  },

  filter: {
    groupAria: "Categories",
    allCategory: "All",
    searchPlaceholder: "Search the news",
    searchAria: "Search the news",
    submit: "Search",
    categorySelect: "Category",
    resultsPrefix: "Results",
    reload: "Refresh page",
  },

  feed: {
    aria: "News list",
  },

  empty: {
    title: "Nothing found",
    text: "Try changing your query or selecting another category.",
    reset: "Reset filters",
    unavailableTitle: "News is temporarily unavailable",
    unavailableText:
      "The news list could not be retrieved. Check your connection or refresh the page later.",
  },

  aside: {
    media: {
      title: "For media",
      text: "Journalist accreditation and official comments — via the Committee's press office.",
      email: "press@khf.tj",
      emailAria: "Write to the press office",
      href: "mailto:press@khf.tj",
    },
    alerts: {
      title: "Active alerts",
      text: "Regional conditions and active alerts are published on the portal.",
      link: "All alerts →",
      href: routes.alert,
    },
  },
};

/** Текстовый контент страницы новостей для активной локали. */
export function getNews(locale: Locale): NewsContent {
  return { ru, tj, en }[locale];
}
