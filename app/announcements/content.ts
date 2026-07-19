// Контент страницы «Объявления» (заглушка CMS). Представление
// (app/announcements/page.tsx и клиентский фильтр) читает только отсюда —
// никаких пользовательских строк в JSX.
import type { AnnouncementKind } from "@/lib/types";
import { routes } from "@/lib/routes";

export interface CrumbItem {
  label: string;
  href?: string;
}

/** Ключ фильтра: «все» либо конкретный вид объявления. */
export type FilterKey = "all" | AnnouncementKind;

export interface FilterOption {
  key: FilterKey;
  label: string;
}

/** Одно объявление ленты: вакансия либо тендер. */
export interface AnnouncementItem {
  kind: AnnouncementKind;
  title: string;
  /** Подразделение / проект-заказчик. */
  org: string;
  desc: string;
  /** Срок подачи или дата подведения итогов, напр. «до 31.07.2026». */
  deadline: string;
  /** Идёт приём заявок (true) либо процедура завершена (false). */
  open: boolean;
}

/** Сегмент текста в карточке-подсказке: обычный текст либо ссылка. */
export interface InfoSegment {
  text: string;
  /** Внутренний путь, tel: или mailto:. Если задан — сегмент выводится ссылкой. */
  href?: string;
  /** Перенести строку перед сегментом. */
  br?: boolean;
}

export interface InfoCard {
  title: string;
  body: InfoSegment[];
}

export interface AnnouncementsContent {
  breadcrumbs: CrumbItem[];
  title: string;
  subtitle: string;
  filterGroupLabel: string;
  filters: FilterOption[];
  feedLabel: string;
  items: AnnouncementItem[];
  info: InfoCard[];
}

/** Вид объявления → подпись тега и класс оформления. */
export const kindMeta: Record<AnnouncementKind, { label: string; tagClass: string }> = {
  vacancy: { label: "Вакансия", tagClass: "tag-accent" },
  tender: { label: "Тендер", tagClass: "tag-outline" },
};

/** Статус приёма заявок → подпись и цвета тега (семантическая шкала). */
export const statusMeta = {
  open: { label: "Приём заявок", bg: "var(--hz-success-bg)", fg: "var(--hz-success)" },
  closed: { label: "Завершён", bg: "var(--color-neutral-100)", fg: "var(--color-neutral-800)" },
} as const;

/** Строка счётчика со склонением: «1 объявление», «3 объявления», «6 объявлений». */
export function announcementsCount(n: number): string {
  const word = n === 1 ? "объявление" : n < 5 ? "объявления" : "объявлений";
  return `${n} ${word}`;
}

export const announcementsContent: AnnouncementsContent = {
  breadcrumbs: [
    { label: "Главная", href: routes.home },
    { label: "Объявления" },
  ],
  title: "Объявления",
  subtitle: "Вакансии государственной службы и тендеры",
  filterGroupLabel: "Тип объявления",
  filters: [
    { key: "all", label: "Все" },
    { key: "vacancy", label: "Вакансии" },
    { key: "tender", label: "Тендеры" },
  ],
  feedLabel: "Список объявлений",
  items: [
    {
      kind: "vacancy",
      title: "Спасатель аэромобильного отряда — г. Душанбе (2 должности)",
      org: "Служба спасения, центральный аппарат",
      desc: "Требования: возраст до 35 лет, физическая подготовка, готовность к командировкам. Обучение за счёт Комитета.",
      deadline: "до 31.07.2026",
      open: true,
    },
    {
      kind: "vacancy",
      title: "Инженер отдела гражданской обороны — Управление по Согдийской области",
      org: "Управление по Согдийской области, г. Худжанд",
      desc: "Высшее техническое образование, опыт работы от 3 лет. Знание таджикского и русского языков обязательно.",
      deadline: "до 25.07.2026",
      open: true,
    },
    {
      kind: "vacancy",
      title: "Оператор службы 112 — ЦУКС (сменный график)",
      org: "Центр управления в кризисных ситуациях",
      desc: "Приём и обработка экстренных вызовов. Владение таджикским и русским языками, стрессоустойчивость.",
      deadline: "до 10.08.2026",
      open: true,
    },
    {
      kind: "tender",
      title: "Закупка аварийно-спасательного инструмента для региональных управлений",
      org: "Проект «Модернизация службы 112»",
      desc: "Гидравлический инструмент, осветительное оборудование. Условия участия и формы заявок — в тендерной документации.",
      deadline: "до 05.08.2026",
      open: true,
    },
    {
      kind: "tender",
      title: "Поставка ГСМ для автопарка Комитета на второе полугодие 2026 года",
      org: "Отдел государственных закупок",
      desc: "Дизельное топливо и бензин АИ-92/95 с доставкой в региональные управления.",
      deadline: "до 28.07.2026",
      open: true,
    },
    {
      kind: "tender",
      title: "Капитальный ремонт учебного корпуса Учебного центра",
      org: "Отдел государственных закупок",
      desc: "Итоги подведены 30.06.2026. Победитель — ООО «Сохтмонсервис». Протокол опубликован в разделе документов.",
      deadline: "итоги 30.06.2026",
      open: false,
    },
  ],
  info: [
    {
      title: "Как подать заявку",
      body: [
        {
          text: "Анкета кандидата на вакансию и тендерные заявки подаются через ",
        },
        { text: "электронную приёмную", href: routes.contacts },
        {
          text: " либо на бумажном носителе в отдел кадров Комитета. Подтверждение о получении направляется в режиме онлайн.",
        },
      ],
    },
    {
      title: "Требования к кандидатам",
      body: [
        {
          text: "Квалификационные требования к должностям государственной службы и образцы документов — в ",
        },
        { text: "каталоге документов", href: routes.documents },
        { text: "." },
      ],
    },
    {
      title: "Вопросы по тендерам",
      body: [
        { text: "Большинство тендеров проводится в рамках " },
        { text: "проектов и программ", href: routes.projects },
        { text: " Комитета. Отдел государственных закупок:" },
        { text: "+992 (37) 221-59-00", href: "tel:+992372215900", br: true },
        { text: " · tender@khf.tj" },
      ],
    },
  ],
};
