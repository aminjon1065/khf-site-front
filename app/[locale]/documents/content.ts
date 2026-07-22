// Контент страницы «Документы» (заглушка CMS). Представление отделено от данных:
// таблица нормативных актов, отчётов и памяток с клиентским фильтром и поиском.
// Текст локализован: getDocuments(locale) возвращает ru/tj/en.
import type { DocItem } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";

export interface DocumentsContent {
  title: string;
  subtitle: string;
  /** Подпись группы кнопок-фильтров по типу. */
  typeGroupLabel: string;
  /** Значение «показать все типы» — первый и стартовый фильтр. */
  allType: string;
  /** Полный список типов (включая «Все»). */
  types: string[];
  search: { placeholder: string; ariaLabel: string };
  columns: {
    type: string;
    title: string;
    number: string;
    date: string;
    lang: string;
    file: string;
  };
  /** Доступная подпись ссылки скачивания. */
  downloadAria: string;
  empty: { title: string; text: string; reset: string };
  docs: DocItem[];
}

const ru: DocumentsContent = {
  title: "Документы",
  subtitle: "Нормативные акты, отчёты и памятки",
  typeGroupLabel: "Тип документа",
  allType: "Все",
  types: ["Все", "Закон", "Постановление", "Приказ", "Отчёт", "Памятка"],
  search: {
    placeholder: "Название или номер документа",
    ariaLabel: "Поиск документов",
  },
  columns: {
    type: "Тип",
    title: "Название",
    number: "Номер",
    date: "Дата",
    lang: "Язык",
    file: "Файл",
  },
  downloadAria: "Скачать документ",
  empty: {
    title: "Документы не найдены",
    text: "Уточните запрос или выберите другой тип документа.",
    reset: "Сбросить фильтры",
  },
  docs: [
    {
      type: "Закон",
      title:
        "Закон РТ «О защите населения и территорий от чрезвычайных ситуаций природного и техногенного характера»",
      number: "№ 1230",
      date: "02.01.2020",
      lang: "ТҶ / РУ",
      size: "PDF · 0,4 МБ",
    },
    {
      type: "Закон",
      title: "Закон РТ «О гражданской обороне»",
      number: "№ 1097",
      date: "28.06.2011",
      lang: "ТҶ / РУ",
      size: "PDF · 0,3 МБ",
    },
    {
      type: "Постановление",
      title:
        "Национальная стратегия снижения риска бедствий на 2026–2030 годы",
      number: "№ 218",
      date: "15.04.2026",
      lang: "ТҶ / РУ / EN",
      size: "PDF · 2,1 МБ",
    },
    {
      type: "Постановление",
      title:
        "Положение о единой государственной системе предупреждения и ликвидации ЧС",
      number: "№ 531",
      date: "03.11.2018",
      lang: "ТҶ / РУ",
      size: "PDF · 0,7 МБ",
    },
    {
      type: "Отчёт",
      title:
        "Отчёт о деятельности Комитета за первое полугодие 2026 года",
      number: "—",
      date: "10.07.2026",
      lang: "ТҶ / РУ",
      size: "PDF · 1,3 МБ",
    },
    {
      type: "Отчёт",
      title:
        "Анализ чрезвычайных ситуаций на территории республики за 2025 год",
      number: "—",
      date: "25.02.2026",
      lang: "ТҶ / РУ / EN",
      size: "PDF · 3,4 МБ",
    },
    {
      type: "Памятка",
      title: "Памятка населению «Действия при землетрясении»",
      number: "ИН-01",
      date: "12.05.2026",
      lang: "ТҶ / РУ",
      size: "PDF · 0,8 МБ",
    },
    {
      type: "Памятка",
      title: "Памятка «Селевая и паводковая опасность»",
      number: "ИН-02",
      date: "12.05.2026",
      lang: "ТҶ / РУ",
      size: "PDF · 0,9 МБ",
    },
    {
      type: "Приказ",
      title: "Приказ об организации месячника гражданской обороны",
      number: "№ 87",
      date: "15.07.2026",
      lang: "ТҶ",
      size: "PDF · 0,2 МБ",
    },
  ],
};

const tj: DocumentsContent = {
  title: "Ҳуҷҷатҳо",
  subtitle: "Санадҳои меъёрӣ, ҳисоботҳо ва ёддоштҳо",
  typeGroupLabel: "Навъи ҳуҷҷат",
  allType: "Ҳама",
  types: ["Ҳама", "Қонун", "Қарор", "Фармоиш", "Ҳисобот", "Ёддошт"],
  search: {
    placeholder: "Ном ё рақами ҳуҷҷат",
    ariaLabel: "Ҷустуҷӯи ҳуҷҷатҳо",
  },
  columns: {
    type: "Навъ",
    title: "Ном",
    number: "Рақам",
    date: "Сана",
    lang: "Забон",
    file: "Файл",
  },
  downloadAria: "Боргирии ҳуҷҷат",
  empty: {
    title: "Ҳуҷҷатҳо ёфт нашуданд",
    text: "Дархостро аниқ кунед ё навъи дигари ҳуҷҷатро интихоб кунед.",
    reset: "Тоза кардани филтрҳо",
  },
  docs: [
    {
      type: "Қонун",
      title:
        "Қонуни ҶТ «Дар бораи ҳифзи аҳолӣ ва ҳудудҳо аз ҳолатҳои фавқулодаи табиӣ ва техногенӣ»",
      number: "№ 1230",
      date: "02.01.2020",
      lang: "ТҶ / РУ",
      size: "PDF · 0,4 МБ",
    },
    {
      type: "Қонун",
      title: "Қонуни ҶТ «Дар бораи мудофиаи гражданӣ»",
      number: "№ 1097",
      date: "28.06.2011",
      lang: "ТҶ / РУ",
      size: "PDF · 0,3 МБ",
    },
    {
      type: "Қарор",
      title:
        "Стратегияи миллии коҳиши хатари офат барои солҳои 2026–2030",
      number: "№ 218",
      date: "15.04.2026",
      lang: "ТҶ / РУ / EN",
      size: "PDF · 2,1 МБ",
    },
    {
      type: "Қарор",
      title:
        "Низомнома дар бораи низоми ягонаи давлатии пешгирӣ ва бартарафсозии ҲФ",
      number: "№ 531",
      date: "03.11.2018",
      lang: "ТҶ / РУ",
      size: "PDF · 0,7 МБ",
    },
    {
      type: "Ҳисобот",
      title:
        "Ҳисобот оид ба фаъолияти Кумита барои нимсолаи аввали соли 2026",
      number: "—",
      date: "10.07.2026",
      lang: "ТҶ / РУ",
      size: "PDF · 1,3 МБ",
    },
    {
      type: "Ҳисобот",
      title:
        "Таҳлили ҳолатҳои фавқулода дар ҳудуди ҷумҳурӣ барои соли 2025",
      number: "—",
      date: "25.02.2026",
      lang: "ТҶ / РУ / EN",
      size: "PDF · 3,4 МБ",
    },
    {
      type: "Ёддошт",
      title: "Ёддошт барои аҳолӣ «Амалҳо ҳангоми заминҷунбӣ»",
      number: "ИН-01",
      date: "12.05.2026",
      lang: "ТҶ / РУ",
      size: "PDF · 0,8 МБ",
    },
    {
      type: "Ёддошт",
      title: "Ёддошт «Хатари сел ва обхезӣ»",
      number: "ИН-02",
      date: "12.05.2026",
      lang: "ТҶ / РУ",
      size: "PDF · 0,9 МБ",
    },
    {
      type: "Фармоиш",
      title: "Фармоиш дар бораи ташкили моҳонаи мудофиаи гражданӣ",
      number: "№ 87",
      date: "15.07.2026",
      lang: "ТҶ",
      size: "PDF · 0,2 МБ",
    },
  ],
};

const en: DocumentsContent = {
  title: "Documents",
  subtitle: "Regulations, reports and leaflets",
  typeGroupLabel: "Document type",
  allType: "All",
  types: ["All", "Law", "Resolution", "Order", "Report", "Leaflet"],
  search: {
    placeholder: "Document title or number",
    ariaLabel: "Search documents",
  },
  columns: {
    type: "Type",
    title: "Title",
    number: "Number",
    date: "Date",
    lang: "Language",
    file: "File",
  },
  downloadAria: "Download document",
  empty: {
    title: "No documents found",
    text: "Refine your query or select another document type.",
    reset: "Reset filters",
  },
  docs: [
    {
      type: "Law",
      title:
        "Law of the RT “On the protection of the population and territories from natural and man-made emergencies”",
      number: "№ 1230",
      date: "02.01.2020",
      lang: "TJ / RU",
      size: "PDF · 0.4 MB",
    },
    {
      type: "Law",
      title: "Law of the RT “On civil defence”",
      number: "№ 1097",
      date: "28.06.2011",
      lang: "TJ / RU",
      size: "PDF · 0.3 MB",
    },
    {
      type: "Resolution",
      title: "National Disaster Risk Reduction Strategy for 2026–2030",
      number: "№ 218",
      date: "15.04.2026",
      lang: "TJ / RU / EN",
      size: "PDF · 2.1 MB",
    },
    {
      type: "Resolution",
      title:
        "Regulation on the unified state system for emergency prevention and response",
      number: "№ 531",
      date: "03.11.2018",
      lang: "TJ / RU",
      size: "PDF · 0.7 MB",
    },
    {
      type: "Report",
      title: "Report on the Committee's activities for the first half of 2026",
      number: "—",
      date: "10.07.2026",
      lang: "TJ / RU",
      size: "PDF · 1.3 MB",
    },
    {
      type: "Report",
      title:
        "Analysis of emergencies in the territory of the republic for 2025",
      number: "—",
      date: "25.02.2026",
      lang: "TJ / RU / EN",
      size: "PDF · 3.4 MB",
    },
    {
      type: "Leaflet",
      title: "Public leaflet “What to do in an earthquake”",
      number: "ИН-01",
      date: "12.05.2026",
      lang: "TJ / RU",
      size: "PDF · 0.8 MB",
    },
    {
      type: "Leaflet",
      title: "Leaflet “Mudflow and flood hazard”",
      number: "ИН-02",
      date: "12.05.2026",
      lang: "TJ / RU",
      size: "PDF · 0.9 MB",
    },
    {
      type: "Order",
      title: "Order on organising the civil defence month",
      number: "№ 87",
      date: "15.07.2026",
      lang: "TJ",
      size: "PDF · 0.2 MB",
    },
  ],
};

/** Контент «Документы» для активной локали. */
export function getDocuments(locale: Locale): DocumentsContent {
  return { ru, tj, en }[locale];
}
