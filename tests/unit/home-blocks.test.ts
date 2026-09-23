import { describe, expect, it } from "vitest";
import type { ApiHomeBlock } from "@/lib/api";
import {
  hasHomeBlock,
  HOME_BLOCK_MAX_ITEMS,
  homeBlockTitle,
  homeSections,
  UNAVAILABLE_HOME_SECTIONS,
} from "@/lib/home-blocks";

// Главная следует блокам CMS: CMS отдаёт только включённые блоки в порядке
// редактора, а заголовок — на языке запроса.
const block = (type: string, title = ""): ApiHomeBlock => ({
  type,
  title,
  config: {},
});

describe("homeSections", () => {
  it("выстраивает секции в порядке блоков редактора", () => {
    expect(
      homeSections([
        block("latest_news"),
        block("regions_map"),
        block("instructions"),
        block("indicators"),
        block("active_alerts"),
      ]),
    ).toEqual(["news", "regions", "quickActions", "indicators", "alerts"]);
  });

  it("ставит «Официальную информацию» один раз — на место первого из трёх блоков", () => {
    expect(
      homeSections([
        block("active_alerts"),
        block("projects"),
        block("latest_news"),
        block("documents"),
        block("announcements"),
      ]),
    ).toEqual(["alerts", "officialInfo", "news"]);
  });

  it("пропускает emergency_contacts и незнакомые типы, не ломаясь", () => {
    expect(
      homeSections([
        block("emergency_contacts"),
        block("weather_widget"),
        block("toString"),
        block("latest_news"),
        { type: null, title: "", config: {} } as unknown as ApiHomeBlock,
      ]),
    ).toEqual(["news"]);
  });

  it("без блоков — только верх страницы: выключенные секции не рисуются", () => {
    expect(homeSections([])).toEqual([]);
  });

  it("резервная раскладка без CMS — прежняя: плитки «Что делать» без инструкций", () => {
    expect(UNAVAILABLE_HOME_SECTIONS).toEqual(["quickActions"]);
  });
});

describe("hasHomeBlock", () => {
  it("видит только присланные (включённые) блоки", () => {
    const blocks = [block("documents"), block("projects")];

    expect(hasHomeBlock(blocks, "documents")).toBe(true);
    expect(hasHomeBlock(blocks, "announcements")).toBe(false);
  });
});

describe("homeBlockTitle", () => {
  it("берёт заголовок блока на языке страницы", () => {
    expect(
      homeBlockTitle(
        [block("latest_news", "  Главные новости ")],
        "latest_news",
      ),
    ).toBe("Главные новости");
  });

  it("пустой или отсутствующий заголовок — null, секция возьмёт словарный", () => {
    const blocks = [
      block("latest_news", ""),
      block("regions_map", "   "),
      { type: "documents", title: null, config: {} } as unknown as ApiHomeBlock,
    ];

    expect(homeBlockTitle(blocks, "latest_news")).toBeNull();
    expect(homeBlockTitle(blocks, "regions_map")).toBeNull();
    expect(homeBlockTitle(blocks, "documents")).toBeNull();
    expect(homeBlockTitle(blocks, "projects")).toBeNull();
  });
});

describe("HOME_BLOCK_MAX_ITEMS", () => {
  it("фиксирует вместимость секций — CMS ограничивает поле «Количество» теми же числами", () => {
    expect(HOME_BLOCK_MAX_ITEMS).toEqual({
      latest_news: 5,
      instructions: 3,
      active_alerts: 3,
      documents: 5,
      announcements: 5,
      projects: 3,
    });
  });
});
