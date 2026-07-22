// Контент страницы «Объявления». Лента объявлений приходит из CMS; здесь только
// подписи интерфейса, локализованные для ru/tj/en. Представление (серверная
// страница и клиентский фильтр) читает контент через селекторы getX(locale).
import type { Locale } from "@/lib/i18n/config";
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
  info: InfoCard[];
}

/** Вид объявления → подпись тега и класс оформления (класс — общий для локалей). */
type KindMeta = Record<AnnouncementKind, { label: string; tagClass: string }>;

const kindMetaByLocale: Record<Locale, KindMeta> = {
  ru: {
    vacancy: { label: "Вакансия", tagClass: "tag-accent" },
    tender: { label: "Тендер", tagClass: "tag-outline" },
  },
  tj: {
    vacancy: { label: "Ҷойи холӣ", tagClass: "tag-accent" },
    tender: { label: "Тендер", tagClass: "tag-outline" },
  },
  en: {
    vacancy: { label: "Vacancy", tagClass: "tag-accent" },
    tender: { label: "Tender", tagClass: "tag-outline" },
  },
};

export function getKindMeta(locale: Locale): KindMeta {
  return kindMetaByLocale[locale];
}

/** Статус приёма заявок → подпись и цвета тега (цвета — общие для локалей). */
interface StatusMeta {
  open: { label: string; bg: string; fg: string };
  closed: { label: string; bg: string; fg: string };
}

const OPEN_COLORS = { bg: "var(--hz-success-bg)", fg: "var(--hz-success)" };
const CLOSED_COLORS = { bg: "var(--color-neutral-100)", fg: "var(--color-neutral-800)" };

const statusMetaByLocale: Record<Locale, StatusMeta> = {
  ru: {
    open: { label: "Приём заявок", ...OPEN_COLORS },
    closed: { label: "Завершён", ...CLOSED_COLORS },
  },
  tj: {
    open: { label: "Қабули дархостҳо", ...OPEN_COLORS },
    closed: { label: "Анҷомёфт", ...CLOSED_COLORS },
  },
  en: {
    open: { label: "Accepting applications", ...OPEN_COLORS },
    closed: { label: "Closed", ...CLOSED_COLORS },
  },
};

export function getStatusMeta(locale: Locale): StatusMeta {
  return statusMetaByLocale[locale];
}

/** Строка счётчика со склонением по правилам локали. */
export function announcementsCount(n: number, locale: Locale): string {
  if (locale === "tj") {
    return `${n} эълон`;
  }
  if (locale === "en") {
    return `${n} ${n === 1 ? "announcement" : "announcements"}`;
  }
  const word = n === 1 ? "объявление" : n < 5 ? "объявления" : "объявлений";
  return `${n} ${word}`;
}

const ru: AnnouncementsContent = {
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
  info: [
    {
      title: "Как подать заявку",
      body: [
        { text: "Анкета кандидата на вакансию и тендерные заявки подаются через " },
        { text: "электронную приёмную", href: routes.contacts },
        { text: " либо на бумажном носителе в отдел кадров Комитета. Подтверждение о получении направляется в режиме онлайн." },
      ],
    },
    {
      title: "Требования к кандидатам",
      body: [
        { text: "Квалификационные требования к должностям государственной службы и образцы документов — в " },
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

const tj: AnnouncementsContent = {
  breadcrumbs: [
    { label: "Асосӣ", href: routes.home },
    { label: "Эълонҳо" },
  ],
  title: "Эълонҳо",
  subtitle: "Ҷойҳои холии хидмати давлатӣ ва тендерҳо",
  filterGroupLabel: "Навъи эълон",
  filters: [
    { key: "all", label: "Ҳама" },
    { key: "vacancy", label: "Ҷойҳои холӣ" },
    { key: "tender", label: "Тендерҳо" },
  ],
  feedLabel: "Рӯйхати эълонҳо",
  info: [
    {
      title: "Чӣ гуна дархост додан",
      body: [
        { text: "Анкетаи номзад ба ҷойи холӣ ва дархостҳои тендерӣ тавассути " },
        { text: "қабулгоҳи электронӣ", href: routes.contacts },
        { text: " ё дар шакли коғазӣ ба шӯъбаи кадрҳои Кумита пешниҳод мешаванд. Тасдиқи гирифтан ба таври онлайн фиристода мешавад." },
      ],
    },
    {
      title: "Талабот ба номзадҳо",
      body: [
        { text: "Талаботи тахассусӣ ба вазифаҳои хидмати давлатӣ ва намунаҳои ҳуҷҷатҳо — дар " },
        { text: "феҳристи ҳуҷҷатҳо", href: routes.documents },
        { text: "." },
      ],
    },
    {
      title: "Саволҳо оид ба тендерҳо",
      body: [
        { text: "Аксари тендерҳо дар доираи " },
        { text: "лоиҳаҳо ва барномаҳо", href: routes.projects },
        { text: " -и Кумита баргузор мешаванд. Шӯъбаи хариди давлатӣ:" },
        { text: "+992 (37) 221-59-00", href: "tel:+992372215900", br: true },
        { text: " · tender@khf.tj" },
      ],
    },
  ],
};

const en: AnnouncementsContent = {
  breadcrumbs: [
    { label: "Home", href: routes.home },
    { label: "Announcements" },
  ],
  title: "Announcements",
  subtitle: "Civil service vacancies and tenders",
  filterGroupLabel: "Announcement type",
  filters: [
    { key: "all", label: "All" },
    { key: "vacancy", label: "Vacancies" },
    { key: "tender", label: "Tenders" },
  ],
  feedLabel: "Announcements list",
  info: [
    {
      title: "How to apply",
      body: [
        { text: "Candidate application forms and tender bids are submitted through the " },
        { text: "electronic reception", href: routes.contacts },
        { text: " or on paper to the Committee's HR department. Confirmation of receipt is sent online." },
      ],
    },
    {
      title: "Candidate requirements",
      body: [
        { text: "Qualification requirements for civil service positions and sample documents are in the " },
        { text: "document catalogue", href: routes.documents },
        { text: "." },
      ],
    },
    {
      title: "Tender enquiries",
      body: [
        { text: "Most tenders are held within the Committee's " },
        { text: "projects and programmes", href: routes.projects },
        { text: ". Public Procurement Department:" },
        { text: "+992 (37) 221-59-00", href: "tel:+992372215900", br: true },
        { text: " · tender@khf.tj" },
      ],
    },
  ],
};

/** Текстовый контент страницы объявлений для активной локали. */
export function getAnnouncementsContent(locale: Locale): AnnouncementsContent {
  return { ru, tj, en }[locale];
}
