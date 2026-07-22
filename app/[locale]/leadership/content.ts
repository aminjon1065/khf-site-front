// Контент страницы «Руководство Комитета» (заглушка CMS). Представление
// (app/leadership/page.tsx) читает только отсюда — никаких строк в JSX.
// Текст локализован: getLeadership(locale) возвращает ru/tj/en.
import type { Locale } from "@/lib/i18n/config";
import { routes } from "@/lib/routes";

/** Элемент хлебных крошек: без href — текущая/неактивная позиция. */
export interface CrumbItem {
  label: string;
  href?: string;
}

/** Кнопка-действие в карточке председателя. */
export interface LeaderAction {
  label: string;
  href: string;
  variant: "secondary" | "ghost";
}

/** Заместитель председателя: роль, ФИО, краткая зона ответственности. */
export interface DeputyItem {
  photoLabel: string;
  role: string;
  name: string;
  bio: string;
}

export interface LeadershipContent {
  breadcrumbs: CrumbItem[];
  title: string;
  chairman: {
    photoLabel: string;
    kicker: string;
    name: string;
    meta: string;
    bio: string;
    actions: LeaderAction[];
  };
  deputiesTitle: string;
  deputies: DeputyItem[];
  footerNote: {
    before: string;
    linkLabel: string;
    linkHref: string;
    after: string;
  };
}

const ru: LeadershipContent = {
  breadcrumbs: [
    { label: "Главная", href: routes.home },
    { label: "О нас" },
    { label: "Руководство" },
  ],
  title: "Руководство Комитета",

  chairman: {
    photoLabel: "Фото председателя",
    kicker: "Председатель Комитета",
    name: "Рустам Назарзода",
    meta: "Генерал-лейтенант · руководит Комитетом с 2016 года",
    bio: "Осуществляет общее руководство Комитетом, координацию сил и средств единой государственной системы предупреждения и ликвидации чрезвычайных ситуаций, представляет Комитет в Правительстве Республики Таджикистан и международных организациях.",
    actions: [
      { label: "График приёма граждан", href: routes.contacts, variant: "secondary" },
      { label: "Выступления и заявления →", href: routes.news, variant: "ghost" },
    ],
  },

  deputiesTitle: "Заместители председателя",
  deputies: [
    {
      photoLabel: "Фото первого заместителя",
      role: "Первый заместитель председателя",
      name: "Первый заместитель",
      bio: "Оперативное реагирование, Центр управления в кризисных ситуациях и служба спасения 112.",
    },
    {
      photoLabel: "Фото заместителя",
      role: "Заместитель председателя",
      name: "Заместитель по гражданской обороне",
      bio: "Гражданская оборона, подготовка населения, эвакуационные мероприятия и защитные сооружения.",
    },
    {
      photoLabel: "Фото заместителя",
      role: "Заместитель председателя",
      name: "Заместитель по предупреждению ЧС",
      bio: "Прогнозирование рисков, государственный надзор и международное сотрудничество.",
    },
  ],

  footerNote: {
    before: "Структура подразделений Комитета — на странице ",
    linkLabel: "«Структура»",
    linkHref: routes.structure,
    after: ".",
  },
};

const tj: LeadershipContent = {
  breadcrumbs: [
    { label: "Асосӣ", href: routes.home },
    { label: "Дар бораи мо" },
    { label: "Роҳбарият" },
  ],
  title: "Роҳбарияти Кумита",

  chairman: {
    photoLabel: "Акси раис",
    kicker: "Раиси Кумита",
    name: "Рустам Назарзода",
    meta: "Генерал-лейтенант · аз соли 2016 Кумитаро роҳбарӣ мекунад",
    bio: "Роҳбарии умумии Кумита, ҳамоҳангсозии қувва ва воситаҳои низоми ягонаи давлатии пешгирӣ ва бартарафсозии ҳолатҳои фавқулодаро амалӣ мекунад, Кумитаро дар Ҳукумати Ҷумҳурии Тоҷикистон ва созмонҳои байналмилалӣ намояндагӣ мекунад.",
    actions: [
      { label: "Ҷадвали қабули шаҳрвандон", href: routes.contacts, variant: "secondary" },
      { label: "Баромадҳо ва баёнияҳо →", href: routes.news, variant: "ghost" },
    ],
  },

  deputiesTitle: "Муовинони раис",
  deputies: [
    {
      photoLabel: "Акси муовини якум",
      role: "Муовини якуми раис",
      name: "Муовини якум",
      bio: "Вокуниши оперативӣ, Маркази идоракунӣ дар ҳолатҳои бӯҳронӣ ва хидмати наҷоти 112.",
    },
    {
      photoLabel: "Акси муовин",
      role: "Муовини раис",
      name: "Муовин оид ба мудофиаи гражданӣ",
      bio: "Мудофиаи гражданӣ, омодасозии аҳолӣ, чорабиниҳои эвакуатсионӣ ва иншооти муҳофизатӣ.",
    },
    {
      photoLabel: "Акси муовин",
      role: "Муовини раис",
      name: "Муовин оид ба пешгирии ҲФ",
      bio: "Пешгӯии хатарҳо, назорати давлатӣ ва ҳамкории байналмилалӣ.",
    },
  ],

  footerNote: {
    before: "Сохтори воҳидҳои Кумита — дар саҳифаи ",
    linkLabel: "«Сохтор»",
    linkHref: routes.structure,
    after: ".",
  },
};

const en: LeadershipContent = {
  breadcrumbs: [
    { label: "Home", href: routes.home },
    { label: "About us" },
    { label: "Leadership" },
  ],
  title: "Committee leadership",

  chairman: {
    photoLabel: "Chairman photo",
    kicker: "Chairman of the Committee",
    name: "Rustam Nazarzoda",
    meta: "Lieutenant General · has led the Committee since 2016",
    bio: "Provides overall leadership of the Committee, coordinates the forces and resources of the unified state system for emergency prevention and response, and represents the Committee in the Government of the Republic of Tajikistan and international organisations.",
    actions: [
      { label: "Citizen reception schedule", href: routes.contacts, variant: "secondary" },
      { label: "Speeches and statements →", href: routes.news, variant: "ghost" },
    ],
  },

  deputiesTitle: "Deputy chairmen",
  deputies: [
    {
      photoLabel: "First deputy photo",
      role: "First Deputy Chairman",
      name: "First Deputy",
      bio: "Rapid response, the Crisis Management Centre and the 112 rescue service.",
    },
    {
      photoLabel: "Deputy photo",
      role: "Deputy Chairman",
      name: "Deputy for Civil Defence",
      bio: "Civil defence, public preparedness, evacuation measures and protective facilities.",
    },
    {
      photoLabel: "Deputy photo",
      role: "Deputy Chairman",
      name: "Deputy for Emergency Prevention",
      bio: "Risk forecasting, state supervision and international cooperation.",
    },
  ],

  footerNote: {
    before: "The structure of the Committee's units is on the ",
    linkLabel: "“Structure”",
    linkHref: routes.structure,
    after: " page.",
  },
};

/** Контент «Руководство» для активной локали. */
export function getLeadership(locale: Locale): LeadershipContent {
  return { ru, tj, en }[locale];
}
