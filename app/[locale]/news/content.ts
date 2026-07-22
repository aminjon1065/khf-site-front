import type { Locale } from "@/lib/i18n/config";
import { routes } from "@/lib/routes";

// Текстовый контент страницы «Новости и заявления». Список новостей и категории
// фильтра берутся из CMS (NewsList строит их из данных), поэтому здесь только
// подписи интерфейса. Локализовано: getNews(locale) → ru/tj/en.

const ru = {
  metaTitle: "Новости и заявления",

  header: {
    title: "Новости и заявления",
    kicker: "Пресс-служба КЧС",
  },

  filter: {
    groupAria: "Категории",
    allCategory: "Все",
    searchPlaceholder: "Поиск по новостям",
    searchAria: "Поиск по новостям",
  },

  feed: {
    aria: "Список новостей",
    pageSize: 6,
  },

  pagination: {
    aria: "Страницы",
    next: "Следующая →",
    pageAriaPrefix: "Страница",
  },

  empty: {
    title: "Ничего не найдено",
    text: "Попробуйте изменить запрос или выбрать другую категорию.",
    reset: "Сбросить фильтры",
  },

  aside: {
    photoLabel: "Фото пресс-службы",
    media: {
      title: "Для СМИ",
      text: "Аккредитация журналистов и официальные комментарии — через пресс-службу Комитета.",
      email: "press@khf.tj →",
      href: routes.contacts,
    },
    subscribe: {
      title: "Подписка на оповещения",
      text: "Получайте предупреждения о ЧС по вашему региону.",
      emailPlaceholder: "Электронная почта",
      emailAria: "Электронная почта",
      submit: "Подписаться",
    },
  },
};

type NewsContent = typeof ru;

const tj: NewsContent = {
  metaTitle: "Хабарҳо ва баёнияҳо",

  header: {
    title: "Хабарҳо ва баёнияҳо",
    kicker: "Хадамоти матбуоти КҲФ",
  },

  filter: {
    groupAria: "Категорияҳо",
    allCategory: "Ҳама",
    searchPlaceholder: "Ҷустуҷӯ дар хабарҳо",
    searchAria: "Ҷустуҷӯ дар хабарҳо",
  },

  feed: {
    aria: "Рӯйхати хабарҳо",
    pageSize: 6,
  },

  pagination: {
    aria: "Саҳифаҳо",
    next: "Баъдӣ →",
    pageAriaPrefix: "Саҳифа",
  },

  empty: {
    title: "Ҳеҷ чиз ёфт нашуд",
    text: "Дархостро тағйир диҳед ё категорияи дигар интихоб кунед.",
    reset: "Тоза кардани полоишҳо",
  },

  aside: {
    photoLabel: "Акси хадамоти матбуот",
    media: {
      title: "Барои ВАО",
      text: "Аккредитатсияи рӯзноманигорон ва шарҳҳои расмӣ — тавассути хадамоти матбуоти Кумита.",
      email: "press@khf.tj →",
      href: routes.contacts,
    },
    subscribe: {
      title: "Обуна ба огоҳиҳо",
      text: "Огоҳиҳо оид ба ҲФ-ро аз рӯи минтақаи худ гиред.",
      emailPlaceholder: "Почтаи электронӣ",
      emailAria: "Почтаи электронӣ",
      submit: "Обуна шудан",
    },
  },
};

const en: NewsContent = {
  metaTitle: "News & statements",

  header: {
    title: "News & statements",
    kicker: "CoES press office",
  },

  filter: {
    groupAria: "Categories",
    allCategory: "All",
    searchPlaceholder: "Search the news",
    searchAria: "Search the news",
  },

  feed: {
    aria: "News list",
    pageSize: 6,
  },

  pagination: {
    aria: "Pages",
    next: "Next →",
    pageAriaPrefix: "Page",
  },

  empty: {
    title: "Nothing found",
    text: "Try changing your query or selecting another category.",
    reset: "Reset filters",
  },

  aside: {
    photoLabel: "Press office photo",
    media: {
      title: "For media",
      text: "Journalist accreditation and official comments — via the Committee's press office.",
      email: "press@khf.tj →",
      href: routes.contacts,
    },
    subscribe: {
      title: "Alert subscription",
      text: "Receive emergency alerts for your region.",
      emailPlaceholder: "Email",
      emailAria: "Email",
      submit: "Subscribe",
    },
  },
};

/** Текстовый контент страницы новостей для активной локали. */
export function getNews(locale: Locale): NewsContent {
  return { ru, tj, en }[locale];
}
