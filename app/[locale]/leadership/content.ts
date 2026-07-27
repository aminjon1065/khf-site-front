// Статическая «рамка» страницы «Руководство Комитета»: заголовки, хлебные
// крошки и постоянные ссылки-действия председателя. Персональный состав
// (председатель, заместители, их ФИО/должности/фото/биографии) больше не
// здесь — он приходит из CMS через fetchLeadership() (C-1a), т.к. меняется
// при кадровых перестановках независимо от релизов фронта. Представление
// (page.tsx) объединяет обе части.
import type { Locale } from "@/lib/i18n/config";
import { routes } from "@/lib/routes";

/** Элемент хлебных крошек: без href — текущая/неактивная позиция. */
export interface CrumbItem {
  label: string;
  href?: string;
}

/** Кнопка-действие в карточке председателя: не зависит от того, кто им является. */
export interface LeaderAction {
  label: string;
  href: string;
  variant: "secondary" | "ghost";
}

export interface LeadershipContent {
  breadcrumbs: CrumbItem[];
  title: string;
  chairmanActions: LeaderAction[];
  deputiesTitle: string;
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

  chairmanActions: [
    { label: "График приёма граждан", href: routes.contacts, variant: "secondary" },
    { label: "Выступления и заявления →", href: routes.news, variant: "ghost" },
  ],

  deputiesTitle: "Заместители председателя",

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

  chairmanActions: [
    { label: "Ҷадвали қабули шаҳрвандон", href: routes.contacts, variant: "secondary" },
    { label: "Баромадҳо ва баёнияҳо →", href: routes.news, variant: "ghost" },
  ],

  deputiesTitle: "Муовинони раис",

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

  chairmanActions: [
    { label: "Citizen reception schedule", href: routes.contacts, variant: "secondary" },
    { label: "Speeches and statements →", href: routes.news, variant: "ghost" },
  ],

  deputiesTitle: "Deputy chairmen",

  footerNote: {
    before: "The structure of the Committee's units is on the ",
    linkLabel: "“Structure”",
    linkHref: routes.structure,
    after: " page.",
  },
};

/** Статическая «рамка» страницы «Руководство» для активной локали. */
export function getLeadership(locale: Locale): LeadershipContent {
  return { ru, tj, en }[locale];
}
