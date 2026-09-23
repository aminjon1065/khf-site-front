// @vitest-environment jsdom
import { createElement, type ReactNode } from "react";
import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AlertsSection from "@/components/public/home/AlertsSection";
import NewsSection from "@/components/public/home/NewsSection";
import OfficialInfoSection from "@/components/public/home/OfficialInfoSection";
import QuickActions from "@/components/public/home/QuickActions";
import type {
  ApiAlert,
  ApiAnnouncement,
  ApiDocument,
  ApiInstruction,
  ApiNewsItem,
  ApiProject,
} from "@/lib/api";
import { HOME_BLOCK_MAX_ITEMS } from "@/lib/home-blocks";
import { ru } from "@/lib/i18n/dictionaries/ru";

// Секции главной показывают заголовок блока CMS и не больше материалов, чем
// вмещает их вёрстка, — даже если CMS пришлёт больше. И не рассчитывают на
// большее, чем получили. Без JSX: набор unit-тестов собирается из *.test.ts.

// Локализующая ссылка — клиентский компонент с usePathname(); для разметки
// секции достаточно обычного <a>.
vi.mock("@/components/i18n/LocaleLink", async () => {
  const react = await import("react");
  return {
    default: ({
      href,
      children,
      ...rest
    }: {
      href: string;
      children: ReactNode;
    }) => react.createElement("a", { href, ...rest }, children),
  };
});

afterEach(cleanup);

const home = ru.home;

const alerts = (n: number): ApiAlert[] =>
  Array.from({ length: n }, (_, i) => ({
    slug: `alert-${i}`,
    level: "warning",
    level_label: "Предупреждение",
    severity: "Средняя",
    status: "Активно",
    status_code: "active",
    is_active: true,
    hazard: "weather",
    hazard_label: "Непогода",
    title: `Предупреждение ${i}`,
    summary: "Сводка",
    region: "Душанбе",
    region_codes: ["dushanbe"],
    datetime: null,
    starts_at: null,
    ends_at: null,
    published_at: null,
    starts_at_iso: null,
    ends_at_iso: null,
  }));

const news = (n: number): ApiNewsItem[] =>
  Array.from({ length: n }, (_, i) => ({
    slug: `news-${i}`,
    title: `Новость ${i}`,
    excerpt: "Анонс",
    category: null,
    date: null,
    datetime: null,
    image: null,
    image_srcset: null,
    image_data: null,
    featured: false,
  }));

const instructions = (n: number): ApiInstruction[] =>
  Array.from({ length: n }, (_, i) => ({
    slug: `guide-${i}`,
    title: `Инструкция ${i}`,
    summary: "Кратко",
    hazard: null,
    hazard_label: null,
    hazard_icon: null,
    priority: false,
    image: null,
    image_srcset: null,
    image_data: null,
  }));

const documents = (n: number): ApiDocument[] =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    type: "Закон",
    type_value: "law",
    title: `Документ ${i}`,
    number: null,
    section: null,
    date: null,
    date_iso: null,
    lang: "РУ",
    size: null,
    href: `/documents/doc-${i}`,
    files: [],
  }));

const announcements = (n: number): ApiAnnouncement[] =>
  Array.from({ length: n }, (_, i) => ({
    slug: `ann-${i}`,
    kind: "tender",
    kind_label: "Тендер",
    title: `Объявление ${i}`,
    org: null,
    desc: "",
    deadline: "бессрочно",
    deadline_at: null,
    deadline_state: "unlimited",
    open: true,
    application_url: null,
  }));

const projects = (n: number): ApiProject[] =>
  Array.from({ length: n }, (_, i) => ({
    slug: `project-${i}`,
    title: `Проект ${i}`,
    status: "Реализуется",
    status_code: "active",
    status_tone: "success",
    years: null,
    partner: null,
    budget: null,
    desc: "",
    image: null,
    image_srcset: null,
    image_data: null,
  }));

function links(container: HTMLElement, prefix: string): HTMLElement[] {
  return within(container)
    .getAllByRole("link")
    .filter((link) => link.getAttribute("href")?.startsWith(prefix));
}

describe("AlertsSection", () => {
  it("показывает заголовок блока и не больше одного ряда карточек", () => {
    const { container } = render(
      createElement(AlertsSection, {
        items: alerts(5),
        title: "Действующие предупреждения",
        home,
        ariaLabel: "Последние предупреждения",
      }),
    );

    expect(
      within(container).getByRole("heading", { level: 2 }).textContent,
    ).toBe("Действующие предупреждения");
    expect(links(container, "/alerts/")).toHaveLength(
      HOME_BLOCK_MAX_ITEMS.active_alerts,
    );
  });

  it("с одним предупреждением рисует одну карточку", () => {
    const { container } = render(
      createElement(AlertsSection, {
        items: alerts(1),
        title: "Предупреждения",
        home,
        ariaLabel: "Последние предупреждения",
      }),
    );

    expect(links(container, "/alerts/")).toHaveLength(1);
  });
});

describe("NewsSection", () => {
  it("показывает главную новость и не больше четырёх строк списка", () => {
    const { container } = render(
      createElement(NewsSection, {
        news: news(7),
        title: "Главные новости",
        home,
        ariaLabel: "Новости",
      }),
    );

    expect(
      within(container).getByRole("heading", { level: 2 }).textContent,
    ).toBe("Главные новости");
    expect(links(container, "/news/")).toHaveLength(
      HOME_BLOCK_MAX_ITEMS.latest_news,
    );
  });

  it("с одной новостью рисует только её", () => {
    const { container } = render(
      createElement(NewsSection, {
        news: news(1),
        title: "Новости",
        home,
        ariaLabel: "Новости",
      }),
    );

    expect(links(container, "/news/")).toHaveLength(1);
  });
});

describe("QuickActions", () => {
  it("показывает заголовок блока и не больше трёх инструкций", () => {
    const { container } = render(
      createElement(QuickActions, {
        instructions: instructions(5),
        title: "Памятки населению",
        home,
        ariaLabel: "Быстрые действия",
      }),
    );

    expect(
      within(container).getByRole("heading", { level: 2 }).textContent,
    ).toBe("Памятки населению");
    expect(links(container, "/guides/")).toHaveLength(
      HOME_BLOCK_MAX_ITEMS.instructions,
    );
    // Навигационные плитки — всегда, они не зависят от CMS.
    expect(links(container, "/map")).toHaveLength(1);
  });

  it("без инструкций остаются только навигационные плитки", () => {
    const { container } = render(
      createElement(QuickActions, {
        instructions: [],
        title: "Что делать",
        home,
        ariaLabel: "Быстрые действия",
      }),
    );

    expect(links(container, "/guides/")).toHaveLength(0);
    expect(links(container, "/contacts")).toHaveLength(2);
  });
});

describe("OfficialInfoSection", () => {
  const titles = {
    documents: "Нормативные документы",
    announcements: "Вакансии и тендеры",
    projects: "Международные проекты",
  };

  it("подписывает колонки заголовками блоков и держит их вместимость", () => {
    const { container } = render(
      createElement(OfficialInfoSection, {
        documents: documents(7),
        announcements: announcements(7),
        projects: projects(4),
        showDocuments: true,
        showAnnouncements: true,
        showProjects: true,
        titles,
        home,
        ariaLabel: "Официальная информация",
      }),
    );

    expect(
      within(container)
        .getAllByRole("heading", { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual([titles.documents, titles.announcements, titles.projects]);
    expect(links(container, "/documents/doc-")).toHaveLength(
      HOME_BLOCK_MAX_ITEMS.documents,
    );
    expect(links(container, "/announcements/")).toHaveLength(
      HOME_BLOCK_MAX_ITEMS.announcements,
    );
    expect(links(container, "/projects/")).toHaveLength(
      HOME_BLOCK_MAX_ITEMS.projects,
    );
    // Обе стороны на месте — прежняя двухколоночная сетка.
    const section = container.querySelector("section")!;
    expect(section.className).toContain(
      "grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]",
    );
    expect(section.children).toHaveLength(2);
  });

  it("показывает только колонки включённых блоков", () => {
    const { container } = render(
      createElement(OfficialInfoSection, {
        documents: documents(2),
        announcements: announcements(2),
        projects: projects(2),
        showDocuments: false,
        showAnnouncements: false,
        showProjects: true,
        titles,
        home,
        ariaLabel: "Официальная информация",
      }),
    );

    expect(
      within(container)
        .getAllByRole("heading", { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual([titles.projects]);
    expect(links(container, "/documents/doc-")).toHaveLength(0);
    expect(links(container, "/announcements/")).toHaveLength(0);
    // Выключенная сторона не оставляет пустую колонку: проекты — во всю
    // ширину, карточки — в ряд.
    const section = container.querySelector("section")!;
    expect(section.className).not.toContain("grid-cols-[minmax");
    expect(section.children).toHaveLength(1);
    expect(section.querySelector(".grid-cols-3")).not.toBeNull();
  });

  it("без проектов списки документов занимают всю ширину", () => {
    const { container } = render(
      createElement(OfficialInfoSection, {
        documents: documents(2),
        announcements: [],
        projects: projects(2),
        showDocuments: true,
        showAnnouncements: true,
        showProjects: false,
        titles,
        home,
        ariaLabel: "Официальная информация",
      }),
    );

    const section = container.querySelector("section")!;
    expect(section.className).not.toContain("grid-cols-[minmax");
    expect(section.children).toHaveLength(1);
    expect(links(container, "/projects/")).toHaveLength(0);
    expect(links(container, "/documents/doc-")).toHaveLength(2);
  });
});
