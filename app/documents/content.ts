// Контент страницы «Документы» (заглушка CMS). Представление отделено от данных:
// таблица нормативных актов, отчётов и памяток с клиентским фильтром и поиском.
import type { DocItem } from "@/lib/types";

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

export const documents: DocumentsContent = {
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
