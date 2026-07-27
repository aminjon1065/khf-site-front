// Статическая «рамка» страницы «Структура Комитета»: заголовки, хлебные
// крошки, реквизиты центрального аппарата и направления деятельности.
// Специализированные подразделения и сводные цифры (год образования, число
// подразделений) больше не здесь — они приходят из CMS (C-1b): подразделения
// через fetchStructureUnits(), цифры — как поля Settings через fetchSettings()
// (это агрегаты уровня страницы, не свойство одного подразделения). Текст
// локализован: getStructure(locale) → ru/tj/en.
import type { Locale } from "@/lib/i18n/config";
import { routes } from "@/lib/routes";

export interface CrumbItem {
  label: string;
  href?: string;
}

export interface InlineLink {
  label: string;
  href: string;
}

export interface StructureContent {
  breadcrumbs: CrumbItem[];
  title: string;
  intro: string;
  /** Подписи для двух цифровых плашек — значения приходят из fetchSettings(). */
  statLabels: { foundedYear: string; unitsCount: string };
  central: {
    label: string;
    /** Локация и состав аппарата — оканчивается тире перед ссылкой. */
    meta: string;
    link: InlineLink;
  };
  unitsLabel: string;
  footnote: {
    /** Текст перед ссылкой — оканчивается тире. */
    text: string;
    link: InlineLink;
    /** Точка после ссылки. */
    suffix: string;
  };
  directions: {
    title: string;
    items: string[];
  };
}

const ru: StructureContent = {
  breadcrumbs: [
    { label: "Главная", href: routes.home },
    { label: "О нас" },
    { label: "Структура" },
  ],
  title: "Структура Комитета",
  intro:
    "Центральный аппарат, специализированные службы и региональные управления образуют единую государственную систему предупреждения и ликвидации чрезвычайных ситуаций.",
  statLabels: { foundedYear: "год образования", unitsCount: "подразделений по стране" },
  central: {
    label: "Центральный аппарат",
    meta: "г. Душанбе · председатель, заместители, коллегия — ",
    link: { label: "руководство →", href: routes.leadership },
  },
  unitsLabel: "Подразделения",
  footnote: {
    text: "Региональные управления действуют в г. Душанбе, Согдийской и Хатлонской областях, ГБАО и районах республиканского подчинения — ",
    link: { label: "контакты управлений", href: routes.contacts },
    suffix: ".",
  },
  directions: {
    title: "Направления деятельности",
    items: [
      "Мониторинг и прогнозирование чрезвычайных ситуаций, система раннего оповещения населения",
      "Поисково-спасательные и аварийно-восстановительные работы",
      "Гражданская оборона и подготовка населения к действиям при ЧС",
      "Государственный надзор в области защиты от чрезвычайных ситуаций",
      "Международное сотрудничество в области снижения риска бедствий",
      "Регистрация и сопровождение туристических групп в горных районах",
    ],
  },
};

const tj: StructureContent = {
  breadcrumbs: [
    { label: "Асосӣ", href: routes.home },
    { label: "Дар бораи мо" },
    { label: "Сохтор" },
  ],
  title: "Сохтори Кумита",
  intro:
    "Аппарати марказӣ, хидматҳои махсус ва идораҳои минтақавӣ низоми ягонаи давлатии пешгирӣ ва бартарафсозии ҳолатҳои фавқулодаро ташкил медиҳанд.",
  statLabels: { foundedYear: "соли таъсис", unitsCount: "воҳид дар саросари кишвар" },
  central: {
    label: "Аппарати марказӣ",
    meta: "ш. Душанбе · раис, муовинон, коллегия — ",
    link: { label: "роҳбарият →", href: routes.leadership },
  },
  unitsLabel: "Воҳидҳо",
  footnote: {
    text: "Идораҳои минтақавӣ дар ш. Душанбе, вилоятҳои Суғд ва Хатлон, ВМКБ ва ноҳияҳои тобеи ҷумҳурӣ фаъолият мекунанд — ",
    link: { label: "тамос бо идораҳо", href: routes.contacts },
    suffix: ".",
  },
  directions: {
    title: "Самтҳои фаъолият",
    items: [
      "Мониторинг ва пешгӯии ҳолатҳои фавқулода, низоми огоҳонии барвақтии аҳолӣ",
      "Корҳои ҷустуҷӯию наҷотдиҳӣ ва аварияю барқарорсозӣ",
      "Мудофиаи гражданӣ ва омодасозии аҳолӣ ба амал ҳангоми ҳолатҳои фавқулода",
      "Назорати давлатӣ дар соҳаи ҳифз аз ҳолатҳои фавқулода",
      "Ҳамкории байналмилалӣ дар соҳаи коҳиши хатари офат",
      "Бақайдгирӣ ва ҳамроҳии гурӯҳҳои сайёҳӣ дар минтақаҳои кӯҳӣ",
    ],
  },
};

const en: StructureContent = {
  breadcrumbs: [
    { label: "Home", href: routes.home },
    { label: "About us" },
    { label: "Structure" },
  ],
  title: "Committee structure",
  intro:
    "The central office, specialised services and regional offices form the unified state system for emergency prevention and response.",
  statLabels: { foundedYear: "year founded", unitsCount: "units nationwide" },
  central: {
    label: "Central office",
    meta: "Dushanbe · chairman, deputies, collegium — ",
    link: { label: "leadership →", href: routes.leadership },
  },
  unitsLabel: "Units",
  footnote: {
    text: "Regional offices operate in Dushanbe, the Sughd and Khatlon regions, GBAO and the districts of republican subordination — ",
    link: { label: "office contacts", href: routes.contacts },
    suffix: ".",
  },
  directions: {
    title: "Areas of activity",
    items: [
      "Monitoring and forecasting of emergencies, public early-warning system",
      "Search-and-rescue and emergency recovery works",
      "Civil defence and preparing the public to act in emergencies",
      "State supervision in the field of protection from emergencies",
      "International cooperation in disaster risk reduction",
      "Registration and support of tourist groups in mountainous areas",
    ],
  },
};

/** Контент «Структура» для активной локали. */
export function getStructure(locale: Locale): StructureContent {
  return { ru, tj, en }[locale];
}
