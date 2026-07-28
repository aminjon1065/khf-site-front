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

const RESOURCE_BY_TYPE: Record<Exclude<CmsContentType, "shell">, string> = {
  alert: "alerts",
  announcement: "announcements",
  document: "documents",
  instruction: "guides",
  news: "news",
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
  "instruction",
  "news",
  "page",
  "project",
]);

export interface CmsRevalidationPayload {
  type: CmsContentType;
  id: number | null;
  slug: string | null;
  locales: Locale[];
  event: string;
  tags: string[];
}

export const cmsCacheTags = {
  shell: (locale: Locale): string => `cms:shell:${locale}`,
  home: (locale: Locale): string => `cms:home:${locale}`,
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
  if (slug) {
    tags.push(cmsCacheTags.detail(type, slug, locale));
  }
  return tags;
}

export function buildRevalidationTags(
  type: CmsContentType,
  slug: string | null,
  locales: Locale[],
): string[] {
  if (type === "shell") {
    return locales.map(cmsCacheTags.shell);
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
    !(CMS_CONTENT_TYPES as readonly string[]).includes(type) ||
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

  const contentType = type as CmsContentType;
  if (
    (contentType === "shell" && (id !== null || slug !== null)) ||
    (contentType !== "shell" &&
      (typeof id !== "number" || !Number.isInteger(id) || id < 1))
  ) {
    return null;
  }

  const locales = payload.locales;
  const expectedTags = buildRevalidationTags(contentType, slug, locales);
  if (
    expectedTags.length !== tags.length ||
    expectedTags.some((tag, index) => tag !== tags[index])
  ) {
    return null;
  }

  return {
    type: contentType,
    id: contentType === "shell" ? null : (id as number),
    slug,
    locales,
    event,
    tags: expectedTags,
  };
}
