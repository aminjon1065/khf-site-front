import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildRevalidationTags,
  CMS_REFERENCE_TYPES,
  parseRevalidationPayload,
  type CmsReferenceType,
} from "@/lib/cache-tags";
import {
  fetchCategories,
  fetchHome,
  fetchLeadership,
  fetchRegions,
  fetchRegionsDirectory,
  fetchStructureUnits,
} from "@/lib/api";
import { LOCALES, type Locale } from "@/lib/i18n/config";

// Контракт вебхука для справочных данных, согласованный с CMS
// (App\Support\FrontendRevalidation): тип → ровно один тег на локаль сайта.
// Тег ничего не стоит, если его не несёт ни один запрос сайта, поэтому здесь
// проверяются обе стороны — что вебхук принимает, и что фетчеры им помечены.
const CONTRACT: Record<CmsReferenceType, (locale: Locale) => string> = {
  home: (locale) => `cms:home:${locale}`,
  leadership: (locale) => `cms:leadership:${locale}`,
  structure: (locale) => `cms:structure:${locale}`,
  region: (locale) => `cms:regions:${locale}`,
  category: (locale) => `cms:categories:${locale}`,
};

/** Payload ровно в той форме, в какой его шлёт CMS. */
function referencePayload(type: CmsReferenceType, id: number | null = 7) {
  return {
    type,
    id,
    slug: null,
    locales: ["ru", "tj", "en"],
    event: "updated",
    tags: LOCALES.map(CONTRACT[type]),
  };
}

describe("теги справочных данных", () => {
  it("знает ровно пять справочных типов контракта", () => {
    expect([...CMS_REFERENCE_TYPES].sort()).toEqual(
      Object.keys(CONTRACT).sort(),
    );
  });

  it.each(Object.keys(CONTRACT) as CmsReferenceType[])(
    "%s → один тег на каждую локаль, без каскада на главную и sitemap",
    (type) => {
      expect(buildRevalidationTags(type, null, ["ru", "tj", "en"])).toEqual(
        LOCALES.map(CONTRACT[type]),
      );
    },
  );

  it.each(Object.keys(CONTRACT) as CmsReferenceType[])(
    "вебхук принимает payload %s в согласованной форме",
    (type) => {
      const payload = referencePayload(type);

      expect(parseRevalidationPayload(payload)).toEqual(payload);
    },
  );

  it("id справочника может быть null — например, блоки главной сохраняются одной формой", () => {
    expect(parseRevalidationPayload(referencePayload("home", null))).toEqual(
      referencePayload("home", null),
    );
  });

  it("отвергает справочник со slug'ом и некорректным id", () => {
    expect(
      parseRevalidationPayload({ ...referencePayload("region"), slug: "sughd" }),
    ).toBeNull();
    for (const id of [0, -3, 1.5, "7"]) {
      expect(
        parseRevalidationPayload({ ...referencePayload("leadership"), id }),
      ).toBeNull();
    }
  });

  it("отвергает теги, расходящиеся с контрактом", () => {
    // Лишний каскад, чужой ресурс и сплошной тег — всё мимо контракта.
    expect(
      parseRevalidationPayload({
        ...referencePayload("category"),
        tags: [...LOCALES.map(CONTRACT.category), "cms:sitemap"],
      }),
    ).toBeNull();
    expect(
      parseRevalidationPayload({
        ...referencePayload("region"),
        tags: LOCALES.map((locale) => `cms:region:${locale}`),
      }),
    ).toBeNull();
    expect(
      parseRevalidationPayload({ ...referencePayload("structure"), tags: ["cms"] }),
    ).toBeNull();
  });

  it("не меняет прежний контракт материалов и оболочки", () => {
    expect(buildRevalidationTags("news", "storm", ["ru"])).toEqual([
      "cms:news:ru",
      "cms:news:storm:ru",
      "cms:home:ru",
      "cms:sitemap",
    ]);
    expect(buildRevalidationTags("shell", null, ["ru", "en"])).toEqual([
      "cms:shell:ru",
      "cms:shell:en",
    ]);
    // У материала id по-прежнему обязателен, у оболочки — запрещён.
    expect(
      parseRevalidationPayload({
        type: "news",
        id: null,
        slug: "storm",
        locales: ["ru"],
        event: "published",
        tags: buildRevalidationTags("news", "storm", ["ru"]),
      }),
    ).toBeNull();
    expect(
      parseRevalidationPayload({
        type: "shell",
        id: 1,
        slug: null,
        locales: ["ru"],
        event: "updated",
        tags: ["cms:shell:ru"],
      }),
    ).toBeNull();
  });
});

describe("фетчеры справочников помечены тегами контракта", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn(async () => Response.json({ data: [] }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const tagsOfLastCall = (): string[] =>
    (fetchMock.mock.calls.at(-1)?.[1] as { next: { tags: string[] } }).next
      .tags;

  it.each(LOCALES)("вебхук каждого справочника доходит до его фетчера (%s)", async (locale) => {
    const fetchers: Record<CmsReferenceType, () => Promise<unknown>> = {
      home: () => fetchHome(locale),
      leadership: () => fetchLeadership(locale),
      structure: () => fetchStructureUnits(locale),
      region: () => fetchRegions(locale),
      category: () => fetchCategories({ type: "news", locale }),
    };

    for (const [type, load] of Object.entries(fetchers)) {
      await load();
      expect(tagsOfLastCall(), type).toContain(
        CONTRACT[type as CmsReferenceType](locale),
      );
    }

    await fetchRegionsDirectory(locale);
    expect(tagsOfLastCall()).toEqual([CONTRACT.region(locale)]);
  });

  it("точные наборы тегов: справочник не тянет сплошной тег `cms`", async () => {
    await fetchLeadership("tj");
    expect(tagsOfLastCall()).toEqual(["cms:leadership:tj"]);

    await fetchStructureUnits("en");
    expect(tagsOfLastCall()).toEqual(["cms:structure:en"]);

    await fetchCategories({ locale: "tj" });
    expect(tagsOfLastCall()).toEqual(["cms:categories:tj"]);
    // Без локали запрос уходит в русскую версию — и тег у неё русский.
    await fetchCategories();
    expect(tagsOfLastCall()).toEqual(["cms:categories:ru"]);

    await fetchHome("tj");
    expect(tagsOfLastCall()).toEqual(["cms:home:tj"]);

    // Статусы регионов зависят и от предупреждений.
    await fetchRegions("en");
    expect(tagsOfLastCall()).toEqual(["cms:alerts:en", "cms:regions:en"]);
  });
});
