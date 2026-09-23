import { LOCALES, type Locale } from "@/lib/i18n/config";

export const CMS_CONTENT_TYPES = [
  "alert",
  "announcement",
  "document",
  "instruction",
  "news",
  "page",
  "project",
  "shell",
] as const;

export type CmsContentType = (typeof CMS_CONTENT_TYPES)[number];

/**
 * Справочные данные CMS: настройки блоков главной, руководство, структура,
 * регионы, категории. У них нет slug'а и собственных детальных страниц, поэтому
 * правка обновляет ровно один тег на локаль — `cms:<ресурс>:<локаль>`, без
 * каскада на главную и карту сайта. Контракт общий с CMS
 * (`App\Support\FrontendRevalidation`); таблица — в README, «Ревалидация по
 * вебхуку».
 */
export const CMS_REFERENCE_TYPES = [
  "category",
  "home",
  "leadership",
  "region",
  "structure",
] as const;

export type CmsReferenceType = (typeof CMS_REFERENCE_TYPES)[number];

/** Всё, что CMS может прислать в поле `type` вебхука. */
export type CmsRevalidationType = CmsContentType | CmsReferenceType;

const REFERENCE_RESOURCE_BY_TYPE: Record<CmsReferenceType, string> = {
  category: "categories",
  home: "home",
  leadership: "leadership",
  region: "regions",
  structure: "structure",
};

export function isReferenceType(type: string): type is CmsReferenceType {
  return (CMS_REFERENCE_TYPES as readonly string[]).includes(type);
}

function referenceTag(type: CmsReferenceType, locale: Locale): string {
  return `cms:${REFERENCE_RESOURCE_BY_TYPE[type]}:${locale}`;
}

const RESOURCE_BY_TYPE: Record<Exclude<CmsContentType, "shell">, string> = {
  alert: "alerts",
  announcement: "announcements",
  document: "documents",
  instruction: "guides",
  news: "news",
  // `cms:pages:*` покрывает не только /pages/{slug}, но и собственные разделы
  // CMS-страниц (/about, /leadership, /structure, /symbols — CMS_PAGE_ROUTES):
  // они читают страницу тем же fetchPage, а ревалидация здесь — по тегам, не
  // по путям, так что отдельной карты «slug → путь» вебхуку не нужно.
  page: "pages",
  project: "projects",
};

const HOME_TYPES = new Set<CmsContentType>([
  "alert",
  "announcement",
  "document",
  "instruction",
  "news",
  "project",
]);

const SITEMAP_TYPES = new Set<CmsContentType>([
  "alert",
  "announcement",
  "instruction",
  "news",
  "page",
  "project",
]);

/**
 * Максимальная длина slug'а, которую контракт с CMS считает допустимой.
 *
 * Число не взято с потолка: ровно его уже проверяет `parseRevalidationPayload`
 * у входящего вебхука — то есть 180 символов и есть договорённость сторон.
 * Оно же с запасом удерживает три жёстких границы, о которые slug длиннее
 * разбивается:
 *
 *  - тег кэша `cms:announcements:<slug>:<locale>` — у Next.js лимит 256
 *    символов, иначе `fetch` печатает «invalid tags passed to fetch» и
 *    адресная ревалидация для материала молча не работает;
 *  - имя файла в `.next/server/app/.../<slug>.segments` — 255 БАЙТ на
 *    компонент пути и в NTFS, и в ext4 (это не лимит Windows MAX_PATH,
 *    его не обойти ни длинными путями, ни коротким distDir): такой slug
 *    роняет весь production-билд с ENOENT на mkdir;
 *  - `?page=`/`?category=` в canonical и hreflang — длина URL у поисковиков.
 *
 * Материал с более длинным slug'ом остаётся полностью рабочим: он просто не
 * пре-рендерится на сборке (отдаётся по запросу) и обновляется по таймеру ISR,
 * а не по вебхуку. Настоящее исправление — на стороне CMS (ограничить длину
 * slug при генерации из заголовка); см. docs/CMS_CONTRACT_REQUESTS.md.
 */
export const MAX_CMS_SLUG_LENGTH = 180;

/**
 * Можно ли безопасно пре-рендерить и адресно ревалидировать этот slug.
 * Пустая строка — не адрес: такой записи в маршруте всё равно не бывает.
 */
export function isAddressableSlug(slug: string): boolean {
  return slug.length > 0 && slug.length <= MAX_CMS_SLUG_LENGTH;
}

export interface CmsRevalidationPayload {
  type: CmsRevalidationType;
  id: number | null;
  slug: string | null;
  locales: Locale[];
  event: string;
  tags: string[];
}

export const cmsCacheTags = {
  shell: (locale: Locale): string => `cms:shell:${locale}`,
  /**
   * Главная: и настройки её блоков (вебхук `home`), и материалы, которые на
   * ней показаны (каскад HOME_TYPES ниже).
   */
  home: (locale: Locale): string => referenceTag("home", locale),
  /** Справочник: `cms:categories|home|leadership|regions|structure:<локаль>`. */
  reference: referenceTag,
  list: (type: Exclude<CmsContentType, "shell">, locale: Locale): string =>
    `cms:${RESOURCE_BY_TYPE[type]}:${locale}`,
  detail: (
    type: Exclude<CmsContentType, "shell">,
    slug: string,
    locale: Locale,
  ): string => `cms:${RESOURCE_BY_TYPE[type]}:${slug}:${locale}`,
  sitemap: "cms:sitemap",
};

export function cmsRequestTags(
  type: Exclude<CmsContentType, "shell">,
  locale: Locale,
  slug?: string,
): string[] {
  const tags = [cmsCacheTags.list(type, locale)];
  // Тег длиннее 256 символов Next.js отвергает целиком, с предупреждением в
  // лог сборки. Лучше отдать только списочный тег (он валиден и всё равно
  // обновит материал вместе с разделом), чем передать заведомо битый набор.
  if (slug && isAddressableSlug(slug)) {
    tags.push(cmsCacheTags.detail(type, slug, locale));
  }
  return tags;
}

export function buildRevalidationTags(
  type: CmsRevalidationType,
  slug: string | null,
  locales: Locale[],
): string[] {
  if (type === "shell") {
    return locales.map(cmsCacheTags.shell);
  }
  if (isReferenceType(type)) {
    return locales.map((locale) => referenceTag(type, locale));
  }

  const tags: string[] = [];
  for (const locale of locales) {
    tags.push(cmsCacheTags.list(type, locale));
    if (slug) {
      tags.push(cmsCacheTags.detail(type, slug, locale));
    }
    if (HOME_TYPES.has(type)) {
      tags.push(cmsCacheTags.home(locale));
    }
  }
  if (SITEMAP_TYPES.has(type)) {
    tags.push(cmsCacheTags.sitemap);
  }
  return [...new Set(tags)];
}

function isLocaleArray(value: unknown): value is Locale[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= LOCALES.length &&
    value.every(
      (locale) =>
        typeof locale === "string" &&
        (LOCALES as readonly string[]).includes(locale),
    ) &&
    new Set(value).size === value.length
  );
}

export function parseRevalidationPayload(
  value: unknown,
): CmsRevalidationPayload | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const payload = value as Record<string, unknown>;
  const type = payload.type;
  const id = payload.id;
  const slug = payload.slug;
  const event = payload.event;
  const tags = payload.tags;

  if (
    typeof type !== "string" ||
    !(
      (CMS_CONTENT_TYPES as readonly string[]).includes(type) ||
      isReferenceType(type)
    ) ||
    !isLocaleArray(payload.locales) ||
    typeof event !== "string" ||
    event.length < 1 ||
    event.length > 64 ||
    (slug !== null &&
      (typeof slug !== "string" || slug.length < 1 || slug.length > 180)) ||
    !Array.isArray(tags) ||
    tags.length < 1 ||
    tags.length > 32 ||
    !tags.every((tag) => typeof tag === "string" && tag.length <= 256)
  ) {
    return null;
  }

  const revalidationType = type as CmsRevalidationType;
  const positiveId =
    typeof id === "number" && Number.isInteger(id) && id >= 1;
  if (revalidationType === "shell") {
    if (id !== null || slug !== null) {
      return null;
    }
  } else if (isReferenceType(revalidationType)) {
    // Справочник адресуется целиком: slug'а у него нет. `id` — запись,
    // которую тронули, или null для правки набора целиком (блоки главной
    // сохраняются одной формой); на теги он не влияет.
    if (slug !== null || (id !== null && !positiveId)) {
      return null;
    }
  } else if (!positiveId) {
    return null;
  }

  const locales = payload.locales;
  const expectedTags = buildRevalidationTags(revalidationType, slug, locales);
  if (
    expectedTags.length !== tags.length ||
    expectedTags.some((tag, index) => tag !== tags[index])
  ) {
    return null;
  }

  return {
    type: revalidationType,
    id: positiveId ? (id as number) : null,
    slug,
    locales,
    event,
    tags: expectedTags,
  };
}
