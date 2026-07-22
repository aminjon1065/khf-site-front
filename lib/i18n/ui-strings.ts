import type { Locale } from "@/lib/i18n/config";

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
}

const ru: UiStrings = {
  slider: {
    region: "Главные новости",
    carousel: "карусель",
    prev: "Предыдущий слайд",
    next: "Следующий слайд",
    slide: "Слайд",
  },
  riskMap: {
    caption: "Карта Республики Таджикистан с уровнями опасности по регионам",
    loading: "Загрузка карты…",
    error: "Не удалось загрузить карту. Сведения по регионам доступны в списке ниже.",
  },
  breadcrumbsAria: "Хлебные крошки",
  imageSlot: "Изображение",
};

const tj: UiStrings = {
  slider: {
    region: "Хабарҳои асосӣ",
    carousel: "карусел",
    prev: "Слайди қаблӣ",
    next: "Слайди навбатӣ",
    slide: "Слайд",
  },
  riskMap: {
    caption: "Харитаи Ҷумҳурии Тоҷикистон бо сатҳҳои хатар аз рӯи минтақаҳо",
    loading: "Боркунии харита…",
    error: "Харитаро бор кардан нашуд. Маълумот аз рӯи минтақаҳо дар рӯйхати поён дастрас аст.",
  },
  breadcrumbsAria: "Пайроҳа",
  imageSlot: "Тасвир",
};

const en: UiStrings = {
  slider: {
    region: "Top news",
    carousel: "carousel",
    prev: "Previous slide",
    next: "Next slide",
    slide: "Slide",
  },
  riskMap: {
    caption: "Map of the Republic of Tajikistan with danger levels by region",
    loading: "Loading map…",
    error: "Failed to load the map. Regional information is available in the list below.",
  },
  breadcrumbsAria: "Breadcrumbs",
  imageSlot: "Image",
};

/** Строки клиентских виджетов для активной локали. */
export function getUiStrings(locale: Locale): UiStrings {
  return { ru, tj, en }[locale];
}
