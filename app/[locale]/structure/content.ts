// Контент страницы «Структура Комитета» (заглушка CMS). Представление отделено
// от данных: аппарат, специализированные подразделения, региональные управления
// и направления деятельности. Текст локализован: getStructure(locale) → ru/tj/en.
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

/** Плитка ключевой цифры в шапке (год образования, число подразделений). */
export interface StructureStat {
  value: string;
  label: string;
}

/** Карточка специализированного подразделения. */
export interface StructureUnit {
  num: string;
  name: string;
  desc: string;
}

export interface StructureContent {
  breadcrumbs: CrumbItem[];
  title: string;
  intro: string;
  stats: StructureStat[];
  central: {
    label: string;
    /** Локация и состав аппарата — оканчивается тире перед ссылкой. */
    meta: string;
    link: InlineLink;
  };
  unitsLabel: string;
  units: StructureUnit[];
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
  stats: [
    { value: "1994", label: "год образования" },
    { value: "68", label: "подразделений по стране" },
  ],
  central: {
    label: "Центральный аппарат",
    meta: "г. Душанбе · председатель, заместители, коллегия — ",
    link: { label: "руководство →", href: routes.leadership },
  },
  unitsLabel: "Подразделения",
  units: [
    {
      num: "01",
      name: "Центр управления в кризисных ситуациях",
      desc: "Круглосуточный мониторинг обстановки, приём вызовов 112, координация реагирования",
    },
    {
      num: "02",
      name: "Служба спасения",
      desc: "Аэромобильный отряд, кинологические расчёты, водолазная и горная службы",
    },
    {
      num: "03",
      name: "Управление гражданской обороны",
      desc: "Планы ГО, эвакуационные мероприятия, защитные сооружения",
    },
    {
      num: "04",
      name: "Управление предупреждения ЧС",
      desc: "Прогнозирование рисков, селе- и лавиноопасные участки, надзор",
    },
    {
      num: "05",
      name: "Учебный центр",
      desc: "Подготовка спасателей и обучение населения действиям при ЧС",
    },
    {
      num: "06",
      name: "Управление международного сотрудничества",
      desc: "Программы с УСРБ ООН, ИНСАРАГ, партнёрами по региону",
    },
  ],
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
  stats: [
    { value: "1994", label: "соли таъсис" },
    { value: "68", label: "воҳид дар саросари кишвар" },
  ],
  central: {
    label: "Аппарати марказӣ",
    meta: "ш. Душанбе · раис, муовинон, коллегия — ",
    link: { label: "роҳбарият →", href: routes.leadership },
  },
  unitsLabel: "Воҳидҳо",
  units: [
    {
      num: "01",
      name: "Маркази идоракунӣ дар ҳолатҳои бӯҳронӣ",
      desc: "Мониторинги шабонарӯзии вазъият, қабули зангҳои 112, ҳамоҳангсозии вокуниш",
    },
    {
      num: "02",
      name: "Хидмати наҷот",
      desc: "Гурӯҳи ҳавоӣ, гурӯҳҳои кинологӣ, хидматҳои ғаввосӣ ва кӯҳӣ",
    },
    {
      num: "03",
      name: "Идораи мудофиаи гражданӣ",
      desc: "Нақшаҳои мудофиаи гражданӣ, чорабиниҳои эвакуатсионӣ, иншооти муҳофизатӣ",
    },
    {
      num: "04",
      name: "Идораи пешгирии ҲФ",
      desc: "Пешгӯии хатарҳо, минтақаҳои хатари сел ва тарма, назорат",
    },
    {
      num: "05",
      name: "Маркази таълимӣ",
      desc: "Омодасозии наҷотдиҳандагон ва омӯзиши аҳолӣ барои амал ҳангоми ҳолатҳои фавқулода",
    },
    {
      num: "06",
      name: "Идораи ҳамкории байналмилалӣ",
      desc: "Барномаҳо бо СММ оид ба БОХ, ИНСАРАГ, шарикони минтақа",
    },
  ],
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
  stats: [
    { value: "1994", label: "year founded" },
    { value: "68", label: "units nationwide" },
  ],
  central: {
    label: "Central office",
    meta: "Dushanbe · chairman, deputies, collegium — ",
    link: { label: "leadership →", href: routes.leadership },
  },
  unitsLabel: "Units",
  units: [
    {
      num: "01",
      name: "Crisis Management Centre",
      desc: "24/7 situation monitoring, 112 call handling, response coordination",
    },
    {
      num: "02",
      name: "Rescue service",
      desc: "Air-mobile unit, canine teams, diving and mountain services",
    },
    {
      num: "03",
      name: "Civil Defence Directorate",
      desc: "Civil defence plans, evacuation measures, protective facilities",
    },
    {
      num: "04",
      name: "Emergency Prevention Directorate",
      desc: "Risk forecasting, mudflow- and avalanche-prone areas, supervision",
    },
    {
      num: "05",
      name: "Training centre",
      desc: "Training rescuers and teaching the public how to act in emergencies",
    },
    {
      num: "06",
      name: "International Cooperation Directorate",
      desc: "Programmes with UNDRR, INSARAG and regional partners",
    },
  ],
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
