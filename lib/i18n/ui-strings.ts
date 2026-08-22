import type { Locale } from "@/lib/i18n/config";
import type { AlertLevel, RegionKey } from "@/lib/types";

// Небольшой НЕ server-only набор строк для клиентских виджетов (NewsSlider,
// TjRiskMap), которым нужен перевод, но которые не получают его через props.
// Клиент вызывает getUiStrings(localeFromPathname(usePathname())).

interface UiStrings {
  slider: {
    region: string;
    carousel: string;
    prev: string;
    next: string;
    /** Подпись точки-слайда: `${slide} ${n}`. */
    slide: string;
    pause: string;
    play: string;
    /** Связка в «1 из 3». */
    of: string;
  };
  riskMap: {
    caption: string;
    loading: string;
    error: string;
  };
  /** aria-метка навигации по хлебным крошкам. */
  breadcrumbsAria: string;
  /** Плейсхолдер слота изображения без подписи. */
  imageSlot: string;
  /** Экран 404 (граница not-found.tsx). */
  notFound: {
    title: string;
    text: string;
    back: string;
  };
  /** Экран ошибки (граница error.tsx). */
  errorPage: {
    title: string;
    text: string;
    retry: string;
  };
  /**
   * Шкала опасности. Раньше эти подписи были русскими константами в
   * lib/levels.ts и выводились как есть на /tj и /en — рядом с локализованным
   * названием региона из CMS стоял русский бейдж.
   */
  levels: {
    /** Короткий бейдж региона: «штатно», «опасно». */
    badge: Record<AlertLevel, string>;
    /** Фраза статуса: «Обстановка штатная». */
    status: Record<AlertLevel, string>;
    /** Подпись в легенде карты. */
    legend: Record<AlertLevel, string>;
  };
  regions: {
    name: Record<RegionKey, string>;
    short: Record<RegionKey, string>;
  };
  /**
   * Формы слова «событие» по категориям Intl.PluralRules. Ключ `other`
   * обязателен: на него приходится откат, когда у локали нет своей формы.
   */
  eventForms: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
}

const ru: UiStrings = {
  slider: {
    region: "Главные новости",
    carousel: "карусель",
    prev: "Предыдущий слайд",
    next: "Следующий слайд",
    slide: "Слайд",
    pause: "Приостановить слайдер",
    play: "Возобновить слайдер",
    of: "из",
  },
  riskMap: {
    caption: "Карта Республики Таджикистан с уровнями опасности по регионам",
    loading: "Загрузка карты…",
    error: "Не удалось загрузить карту. Сведения по регионам доступны в списке ниже.",
  },
  breadcrumbsAria: "Хлебные крошки",
  imageSlot: "Изображение",
  notFound: {
    title: "Страница не найдена",
    text: "Запрашиваемая страница не существует или была перемещена.",
    back: "На главную",
  },
  errorPage: {
    title: "Что-то пошло не так",
    text: "Произошла ошибка при загрузке страницы. Попробуйте обновить.",
    retry: "Обновить",
  },
  levels: {
    badge: {
      none: "штатно",
      info: "инфо",
      warning: "внимание",
      danger: "опасно",
      critical: "критично",
    },
    status: {
      none: "Обстановка штатная",
      info: "Информационное уведомление",
      warning: "Действует предупреждение",
      danger: "Опасная обстановка",
      critical: "Критическая ситуация",
    },
    legend: {
      none: "Штатно",
      info: "Информация",
      warning: "Предупреждение",
      danger: "Опасность",
      critical: "Критично",
    },
  },
  regions: {
    name: {
      dushanbe: "г. Душанбе",
      sughd: "Согдийская область",
      khatlon: "Хатлонская область",
      rrp: "Районы республиканского подчинения",
      gbao: "ГБАО",
    },
    short: {
      dushanbe: "Душанбе",
      sughd: "Согдийская обл.",
      khatlon: "Хатлонская обл.",
      rrp: "РРП",
      gbao: "ГБАО",
    },
  },
  eventForms: { one: "событие", few: "события", many: "событий", other: "события" },
};

const tj: UiStrings = {
  slider: {
    region: "Хабарҳои асосӣ",
    carousel: "карусел",
    prev: "Слайди қаблӣ",
    next: "Слайди навбатӣ",
    slide: "Слайд",
    pause: "Бозист кардани слайдер",
    play: "Давом додани слайдер",
    of: "аз",
  },
  riskMap: {
    caption: "Харитаи Ҷумҳурии Тоҷикистон бо сатҳҳои хатар аз рӯи минтақаҳо",
    loading: "Боркунии харита…",
    error: "Харитаро бор кардан нашуд. Маълумот аз рӯи минтақаҳо дар рӯйхати поён дастрас аст.",
  },
  breadcrumbsAria: "Пайроҳа",
  imageSlot: "Тасвир",
  notFound: {
    title: "Саҳифа ёфт нашуд",
    text: "Саҳифаи дархостшуда вуҷуд надорад ё кӯчонида шудааст.",
    back: "Ба асосӣ",
  },
  errorPage: {
    title: "Чизе нодуруст шуд",
    text: "Ҳангоми боркунии саҳифа хатогӣ рӯй дод. Кӯшиш кунед аз нав бор кунед.",
    retry: "Аз нав",
  },
  levels: {
    badge: {
      none: "муқаррарӣ",
      info: "маълумот",
      warning: "диққат",
      danger: "хатарнок",
      critical: "бӯҳронӣ",
    },
    status: {
      none: "Вазъият муқаррарӣ",
      info: "Огоҳиномаи иттилоотӣ",
      warning: "Огоҳӣ амал мекунад",
      danger: "Вазъияти хатарнок",
      critical: "Вазъияти бӯҳронӣ",
    },
    legend: {
      none: "Муқаррарӣ",
      info: "Маълумот",
      warning: "Огоҳӣ",
      danger: "Хатар",
      critical: "Бӯҳронӣ",
    },
  },
  regions: {
    name: {
      dushanbe: "ш. Душанбе",
      sughd: "Вилояти Суғд",
      khatlon: "Вилояти Хатлон",
      rrp: "Ноҳияҳои тобеи ҷумҳурӣ",
      gbao: "ВМКБ",
    },
    short: {
      dushanbe: "Душанбе",
      sughd: "Вил. Суғд",
      khatlon: "Вил. Хатлон",
      rrp: "НТҶ",
      gbao: "ВМКБ",
    },
  },
  eventForms: { one: "ҳодиса", other: "ҳодиса" },
};

const en: UiStrings = {
  slider: {
    region: "Top news",
    carousel: "carousel",
    prev: "Previous slide",
    next: "Next slide",
    slide: "Slide",
    pause: "Pause slider",
    play: "Resume slider",
    of: "of",
  },
  riskMap: {
    caption: "Map of the Republic of Tajikistan with danger levels by region",
    loading: "Loading map…",
    error: "Failed to load the map. Regional information is available in the list below.",
  },
  breadcrumbsAria: "Breadcrumbs",
  imageSlot: "Image",
  notFound: {
    title: "Page not found",
    text: "The page you requested does not exist or has been moved.",
    back: "Go home",
  },
  errorPage: {
    title: "Something went wrong",
    text: "An error occurred while loading the page. Please try refreshing.",
    retry: "Retry",
  },
  levels: {
    badge: {
      none: "normal",
      info: "info",
      warning: "warning",
      danger: "danger",
      critical: "critical",
    },
    status: {
      none: "Conditions are normal",
      info: "Information notice",
      warning: "An alert is in effect",
      danger: "Dangerous conditions",
      critical: "Critical situation",
    },
    legend: {
      none: "Normal",
      info: "Information",
      warning: "Warning",
      danger: "Danger",
      critical: "Critical",
    },
  },
  regions: {
    name: {
      dushanbe: "Dushanbe city",
      sughd: "Sughd region",
      khatlon: "Khatlon region",
      rrp: "Districts of Republican Subordination",
      gbao: "GBAO",
    },
    short: {
      dushanbe: "Dushanbe",
      sughd: "Sughd",
      khatlon: "Khatlon",
      rrp: "DRS",
      gbao: "GBAO",
    },
  },
  eventForms: { one: "event", other: "events" },
};

/** Строки клиентских виджетов для активной локали. */
export function getUiStrings(locale: Locale): UiStrings {
  return { ru, tj, en }[locale];
}
