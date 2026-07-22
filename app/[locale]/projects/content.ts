// Контент страницы «Проекты и программы» (заглушка CMS). Представление
// (app/projects/page.tsx) читает только отсюда — никаких строк в JSX.
import type { ProjectItem, ProjectStatus } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";
import { routes } from "@/lib/routes";

export interface CrumbItem {
  label: string;
  href?: string;
}

export interface ProjectsContent {
  breadcrumbs: CrumbItem[];
  title: string;
  intro: string;
  /** Подписи метаданных в футере карточки. */
  cardLabels: { partner: string; budget: string };
  /** Нижний блок со ссылками на смежные разделы. */
  related: {
    aria: string;
    text: string;
    tenders: string;
    reports: string;
  };
  projects: ProjectItem[];
}

/** Цвета статус-тега проекта — из семантической шкалы опасности (токены). */
export const projectStatusColors: Record<ProjectStatus, { bg: string; fg: string }> = {
  Реализуется: { bg: "var(--hz-success-bg)", fg: "var(--hz-success)" },
  Подготовка: { bg: "var(--hz-info-bg)", fg: "var(--hz-info)" },
  Завершён: { bg: "var(--color-neutral-100)", fg: "var(--color-neutral-800)" },
};

const ru: ProjectsContent = {
  breadcrumbs: [
    { label: "Главная", href: routes.home },
    { label: "Проекты" },
  ],
  title: "Проекты и программы",
  intro:
    "Государственные программы и проекты технической помощи, заказчиком или исполнителем которых является Комитет: цели, сроки, источники финансирования и ход реализации. Закупки и тендеры проводятся в рамках этих проектов.",
  cardLabels: {
    partner: "Партнёр:",
    budget: "Бюджет:",
  },
  related: {
    aria: "Связанные разделы",
    text:
      "Закупки товаров и услуг в рамках проектов проводятся на конкурсной основе. Действующие тендеры публикуются в разделе объявлений.",
    tenders: "Тендеры и объявления",
    reports: "Отчёты по проектам →",
  },
  projects: [
    {
      slug: "early-warning-system",
      title: "Модернизация системы раннего оповещения населения",
      status: "Реализуется",
      years: "2026–2030",
      partner: "УСРБ ООН, Всемирный банк",
      budget: "18,4 млн долл. США",
      desc:
        "Сирены и ячейковое вещание в 47 селеопасных джамоатах, интеграция с гидрометеослужбой и службой 112.",
    },
    {
      slug: "panj-river-drr",
      title: "Снижение риска бедствий в бассейне реки Пяндж",
      status: "Реализуется",
      years: "2024–2028",
      partner: "Фонд Ага Хана, Правительство Швейцарии",
      budget: "9,6 млн долл. США",
      desc:
        "Берегоукрепление, селеотводные каналы и обучение добровольных команд реагирования в 60 кишлаках ГБАО и Хатлона.",
    },
    {
      slug: "rescue-112-modernization",
      title: "Модернизация единой службы спасения 112",
      status: "Реализуется",
      years: "2025–2027",
      partner: "Европейский союз",
      budget: "6,2 млн евро",
      desc:
        "Новый центр обработки вызовов, цифровая радиосвязь и аварийно-спасательный инструмент для региональных управлений.",
    },
    {
      slug: "seismic-safety-schools",
      title: "Сейсмоустойчивость школ и больниц",
      status: "Подготовка",
      years: "2027–2031",
      partner: "Всемирный банк, JICA",
      budget: "оценка — 25 млн долл. США",
      desc:
        "Обследование и усиление 120 социальных объектов в зонах сейсмичности 8–9 баллов, типовые проекты безопасных школ.",
    },
  ],
};

const tj: ProjectsContent = {
  breadcrumbs: [
    { label: "Асосӣ", href: routes.home },
    { label: "Лоиҳаҳо" },
  ],
  title: "Лоиҳаҳо ва барномаҳо",
  intro:
    "Барномаҳои давлатӣ ва лоиҳаҳои кӯмаки техникӣ, ки фармоишгар ё иҷрокунандаи онҳо Кумита мебошад: ҳадафҳо, мӯҳлатҳо, манбаъҳои маблағгузорӣ ва рафти иҷро. Харидҳо ва тендерҳо дар доираи ин лоиҳаҳо гузаронида мешаванд.",
  cardLabels: {
    partner: "Шарик:",
    budget: "Буҷа:",
  },
  related: {
    aria: "Бахшҳои алоқаманд",
    text:
      "Хариди молу хидматҳо дар доираи лоиҳаҳо дар асоси озмун гузаронида мешавад. Тендерҳои амалкунанда дар бахши эълонҳо нашр мешаванд.",
    tenders: "Тендерҳо ва эълонҳо",
    reports: "Ҳисоботҳо оид ба лоиҳаҳо →",
  },
  projects: [
    {
      slug: "early-warning-system",
      title: "Навсозии низоми огоҳонии барвақтии аҳолӣ",
      status: "Реализуется",
      years: "2026–2030",
      partner: "СММ оид ба БОХ, Бонки Ҷаҳонӣ",
      budget: "18,4 млн доллари ИМА",
      desc:
        "Сиренаҳо ва пахши ячейкавӣ дар 47 ҷамоати селхатар, ҳамгироӣ бо хидмати гидрометеорологӣ ва хидмати 112.",
    },
    {
      slug: "panj-river-drr",
      title: "Коҳиши хатари офат дар ҳавзаи дарёи Панҷ",
      status: "Реализуется",
      years: "2024–2028",
      partner: "Бунёди Оғохон, Ҳукумати Швейтсария",
      budget: "9,6 млн доллари ИМА",
      desc:
        "Мустаҳкамкунии соҳил, каналҳои селгардон ва омӯзиши гурӯҳҳои ихтиёрии вокуниш дар 60 деҳаи ВМКБ ва Хатлон.",
    },
    {
      slug: "rescue-112-modernization",
      title: "Навсозии хидмати ягонаи наҷоти 112",
      status: "Реализуется",
      years: "2025–2027",
      partner: "Иттиҳоди Аврупо",
      budget: "6,2 млн евро",
      desc:
        "Маркази нави коркарди зангҳо, алоқаи рақамии радио ва асбоби аварияию наҷот барои идораҳои минтақавӣ.",
    },
    {
      slug: "seismic-safety-schools",
      title: "Устувории сейсмикии мактабҳо ва беморхонаҳо",
      status: "Подготовка",
      years: "2027–2031",
      partner: "Бонки Ҷаҳонӣ, JICA",
      budget: "арзёбӣ — 25 млн доллари ИМА",
      desc:
        "Тафтиш ва мустаҳкамкунии 120 иншооти иҷтимоӣ дар минтақаҳои сейсмикии 8–9 балла, лоиҳаҳои намунавии мактабҳои бехатар.",
    },
  ],
};

const en: ProjectsContent = {
  breadcrumbs: [
    { label: "Home", href: routes.home },
    { label: "Projects" },
  ],
  title: "Projects and programmes",
  intro:
    "State programmes and technical-assistance projects for which the Committee acts as client or implementer: objectives, timelines, funding sources and implementation progress. Procurement and tenders are carried out within these projects.",
  cardLabels: {
    partner: "Partner:",
    budget: "Budget:",
  },
  related: {
    aria: "Related sections",
    text:
      "Procurement of goods and services within projects is carried out on a competitive basis. Active tenders are published in the announcements section.",
    tenders: "Tenders and announcements",
    reports: "Project reports →",
  },
  projects: [
    {
      slug: "early-warning-system",
      title: "Modernisation of the public early-warning system",
      status: "Реализуется",
      years: "2026–2030",
      partner: "UNDRR, World Bank",
      budget: "USD 18.4M",
      desc:
        "Sirens and cell broadcast in 47 mudflow-prone jamoats, integration with the hydrometeorological service and the 112 service.",
    },
    {
      slug: "panj-river-drr",
      title: "Disaster risk reduction in the Panj River basin",
      status: "Реализуется",
      years: "2024–2028",
      partner: "Aga Khan Foundation, Government of Switzerland",
      budget: "USD 9.6M",
      desc:
        "Bank reinforcement, mudflow-diversion channels and training of volunteer response teams in 60 villages of GBAO and Khatlon.",
    },
    {
      slug: "rescue-112-modernization",
      title: "Modernisation of the 112 unified rescue service",
      status: "Реализуется",
      years: "2025–2027",
      partner: "European Union",
      budget: "EUR 6.2M",
      desc:
        "A new call-handling centre, digital radio communications and emergency-rescue equipment for regional offices.",
    },
    {
      slug: "seismic-safety-schools",
      title: "Seismic resilience of schools and hospitals",
      status: "Подготовка",
      years: "2027–2031",
      partner: "World Bank, JICA",
      budget: "estimate — USD 25M",
      desc:
        "Survey and reinforcement of 120 social facilities in seismic zones of intensity 8–9, standard designs for safe schools.",
    },
  ],
};

/** Контент «Проекты и программы» для активной локали. */
export function getProjectsContent(locale: Locale): ProjectsContent {
  return { ru, tj, en }[locale];
}
