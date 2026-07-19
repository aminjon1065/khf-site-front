// Контент страницы «Руководство Комитета» (заглушка CMS). Представление
// (app/leadership/page.tsx) читает только отсюда — никаких строк в JSX.
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

export const leadership: LeadershipContent = {
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
