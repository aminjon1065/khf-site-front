import type { Locale } from "@/lib/i18n/config";
import { routes } from "@/lib/routes";
import type { GuideItem } from "@/lib/types";

// Контент страницы «Безопасность населения» (каталог инструкций). Карточки и
// каталог приходят из CMS; здесь — только текст шапки, локализованный для ru/tj/en
// через getGuidesContent(locale).

interface GuidesContent {
  hero: { title: string; lead: string };
  emergency: { number: string; text: string };
  priorityCta: string;
}

const ru: GuidesContent = {
  hero: {
    title: "Безопасность населения",
    lead: "Пошаговые инструкции, как действовать до, во время и после чрезвычайных ситуаций. Изучите их заранее — в момент опасности времени на чтение не будет.",
  },
  emergency: {
    number: "112",
    text: "Единый номер экстренных служб. Звонок бесплатный, работает без SIM-карты.",
  },
  priorityCta: "Открыть инструкцию →",
};

const tj: GuidesContent = {
  hero: {
    title: "Бехатарии аҳолӣ",
    lead: "Дастурҳои қадам ба қадам оид ба он ки пеш, ҳангом ва пас аз ҳолатҳои фавқулода чӣ гуна амал кардан лозим аст. Онҳоро пешакӣ омӯзед — дар лаҳзаи хатар вақт барои хондан намемонад.",
  },
  emergency: {
    number: "112",
    text: "Рақами ягонаи хидматҳои фавқулодда. Занг ройгон аст ва бе SIM-корт кор мекунад.",
  },
  priorityCta: "Кушодани дастур →",
};

const en: GuidesContent = {
  hero: {
    title: "Public safety",
    lead: "Step-by-step instructions on how to act before, during and after emergencies. Learn them in advance — in a moment of danger there will be no time to read.",
  },
  emergency: {
    number: "112",
    text: "The single number for emergency services. The call is free and works without a SIM card.",
  },
  priorityCta: "Open the guide →",
};

/** Текст шапки страницы «Безопасность» для активной локали. */
export function getGuidesContent(locale: Locale): GuidesContent {
  return { ru, tj, en }[locale];
}

// Приоритетная плитка риска — крупнее, чем строки каталога.
export interface PriorityTile {
  href: string;
  kicker: string;
  /** CSS-выражение цвета кикера (токен/переменная). */
  kickerColor: string;
  title: string;
  desc: string;
  /** Тёмная акцентная плитка (главный риск республики). */
  accent?: boolean;
}

export const priority: PriorityTile[] = [
  {
    href: routes.guide("earthquake"),
    kicker: "Главный риск республики",
    kickerColor: "var(--color-accent-300)",
    title: "Землетрясение",
    desc: "Территория Таджикистана относится к зоне сейсмичности 8–9 баллов. Каждая семья должна знать порядок действий.",
    accent: true,
  },
  {
    href: routes.guide("flood"),
    kicker: "Сезонный риск · весна–лето",
    kickerColor: "var(--hz-warning)",
    title: "Сель и наводнение",
    desc: "Ливни и таяние ледников вызывают сели в предгорьях. Действует предупреждение по Хатлонской области.",
  },
  {
    href: routes.guide("avalanche"),
    kicker: "Сезонный риск · зима",
    kickerColor: "var(--hz-info)",
    title: "Лавины",
    desc: "Горные дороги и перевалы: как подготовиться к поездке и что делать при сходе лавины.",
  },
];

export const catalog = {
  title: "Все инструкции",
  count: "12 тем",
  // desc используется как краткая подпись под названием темы.
  topics: [
    { slug: "fire", title: "Пожар", desc: "В жилом доме, на предприятии, в поле" },
    {
      slug: "storm",
      title: "Сильный ветер и гроза",
      desc: "Штормовые предупреждения, поведение на улице",
    },
    {
      slug: "heat",
      title: "Аномальная жара",
      desc: "Тепловой удар, защита детей и пожилых",
    },
    {
      slug: "frost",
      title: "Сильный мороз",
      desc: "Обморожение, отопление, поездки зимой",
    },
    {
      slug: "first-aid",
      title: "Первая помощь",
      desc: "Кровотечение, переломы, сердечно-лёгочная реанимация",
    },
    {
      slug: "child-safety",
      title: "Безопасность детей",
      desc: "Дома, на воде, по дороге в школу",
    },
    {
      slug: "mountain-safety",
      title: "Безопасность в горах",
      desc: "Регистрация туристических групп, снаряжение",
    },
    {
      slug: "evacuation",
      title: "Эвакуация",
      desc: "Сборный пункт, тревожный чемоданчик, документы",
    },
    {
      slug: "water-safety",
      title: "Безопасность на воде",
      desc: "Реки, каналы и водохранилища летом",
    },
    {
      slug: "landslide",
      title: "Оползни",
      desc: "Признаки смещения грунта, действия жителей",
    },
    { slug: "epidemic", title: "Эпидемии", desc: "Гигиена и карантинные меры" },
    {
      slug: "chemical",
      title: "Химическая опасность",
      desc: "Утечки на объектах, средства защиты",
    },
  ] as GuideItem[],
};

/** Порядковый номер темы с ведущим нулём: 01, 02 … */
export const topicNum = (i: number) => String(i + 1).padStart(2, "0");
