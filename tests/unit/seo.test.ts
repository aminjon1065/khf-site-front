import { describe, expect, it } from "vitest";
import { buildAlternates, buildMetadata, siteUrl } from "@/lib/seo";

describe("buildAlternates", () => {
  it("returns canonical + hreflang keys for ru/tg/en plus x-default", () => {
    const alternates = buildAlternates("/news/some-slug", "ru");

    expect(alternates.canonical).toBe("/ru/news/some-slug");
    expect(alternates.languages).toEqual({
      ru: "/ru/news/some-slug",
      tg: "/tj/news/some-slug",
      en: "/en/news/some-slug",
      "x-default": "/ru/news/some-slug",
    });
  });

  it("keeps an indexable facet (category/type) in canonical and all alternates", () => {
    // Категория — полезная грань каталога: перевод той же грани не должен
    // претендовать на каноничность базовой страницы.
    const alternates = buildAlternates("/news", "ru", 2, { category: "sotrudnichestvo" });

    expect(alternates.canonical).toBe(
      "/ru/news?category=sotrudnichestvo&page=2",
    );
    expect(alternates.languages).toEqual({
      ru: "/ru/news?category=sotrudnichestvo&page=2",
      tg: "/tj/news?category=sotrudnichestvo&page=2",
      en: "/en/news?category=sotrudnichestvo&page=2",
      "x-default": "/ru/news?category=sotrudnichestvo&page=2",
    });
  });

  it("drops empty query values instead of producing ?category=", () => {
    expect(buildAlternates("/news", "ru", 1, { category: undefined }).canonical).toBe("/ru/news");
    expect(buildAlternates("/news", "ru", 1, { type: "" }).canonical).toBe("/ru/news");
  });

  it("announces only locales where the translation is actually published", () => {
    // /en-адрес русского fallback'а не должен получать hreflang "en",
    // которого не существует: список локалей фильтруется по данным CMS.
    const alternates = buildAlternates(
      "/news/test-news",
      "en",
      1,
      {},
      ["ru", "tj"],
    );

    expect(Object.keys(alternates.languages!)).toEqual(["ru", "tg", "x-default"]);
    expect(alternates.languages!.en).toBeUndefined();
    // x-default остаётся на реально доступном языке.
    expect(alternates.languages!["x-default"]).toBe("/ru/news/test-news");
    // Canonical — сам адрес: страница существует и честно помечена noindex.
    expect(alternates.canonical).toBe("/en/news/test-news");
  });

  it("uses the tg hreflang key (not tj) for the Tajik branch", () => {
    const alternates = buildAlternates("/", "tj");

    expect(alternates.canonical).toBe("/tj");
    expect(Object.keys(alternates.languages!)).toContain("tg");
    expect(Object.keys(alternates.languages!)).not.toContain("tj");
  });

  it("collapses the root path without a trailing path segment", () => {
    const alternates = buildAlternates("/", "en");

    expect(alternates.canonical).toBe("/en");
    expect(alternates.languages!.ru).toBe("/ru");
  });

  it("emits exactly the expected object for a nested path on the tj branch", () => {
    // Полное сравнение, а не выборочные поля: ловит и лишний ключ hreflang,
    // который в выборочных проверках выше прошёл бы незамеченным.
    expect(buildAlternates("/news/test-news", "tj")).toEqual({
      canonical: "/tj/news/test-news",
      languages: {
        ru: "/ru/news/test-news",
        tg: "/tj/news/test-news",
        en: "/en/news/test-news",
        "x-default": "/ru/news/test-news",
      },
    });
  });
});

describe("buildMetadata", () => {
  it("builds title/description/alternates/OpenGraph/Twitter", () => {
    const metadata = buildMetadata({
      locale: "ru",
      title: "Заголовок",
      description: "Описание",
      path: "/news/slug",
    });

    expect(metadata.title).toBe("Заголовок");
    expect(metadata.description).toBe("Описание");
    expect(metadata.alternates?.canonical).toBe("/ru/news/slug");
    expect(metadata.openGraph).toMatchObject({
      type: "website",
      title: "Заголовок",
      url: "/ru/news/slug",
      locale: "ru_RU",
    });
    // Без собственной обложки показывается общая OG-карточка портала —
    // пустого og:image больше не бывает.
    expect(metadata.openGraph?.images).toEqual([
      expect.objectContaining({
        url: "/og/og-ru.png",
        width: 1200,
        height: 630,
      }),
    ]);
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Заголовок",
    });
  });

  it("uses a large-image Twitter card and includes images when provided", () => {
    const metadata = buildMetadata({
      locale: "en",
      title: "Title",
      path: "/news/slug",
      images: ["https://cms.khf.tj/storage/cover.jpg"],
    });

    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
    expect((metadata.openGraph as Record<string, unknown>).images).toEqual([
      { url: "https://cms.khf.tj/storage/cover.jpg" },
    ]);
  });

  it("keeps a real CMS cover ahead of the default portal card", () => {
    // Реальная обложка приоритетна: дефолтная карточка — только для страниц
    // без собственного изображения (обе ветки рядом, чтобы «починить» одну
    // и не заметить вторую было нельзя).
    const withoutImage = buildMetadata({
      locale: "ru",
      title: "Новость",
      path: "/news/test-news",
    });
    const withImage = buildMetadata({
      locale: "ru",
      title: "Новость",
      path: "/news/test-news",
      images: ["https://cms.example/image.webp"],
    });

    expect(withoutImage.openGraph?.images).toEqual([
      expect.objectContaining({ url: "/og/og-ru.png" }),
    ]);
    expect(withImage.openGraph?.images).toEqual([
      { url: "https://cms.example/image.webp" },
    ]);
  });

  it("adds publishedTime/modifiedTime only for article type", () => {
    const article = buildMetadata({
      locale: "ru",
      title: "Новость",
      path: "/news/slug",
      type: "article",
      publishedTime: "2026-07-16T10:00:00+05:00",
      modifiedTime: "2026-07-17T10:00:00+05:00",
    });
    const page = buildMetadata({ locale: "ru", title: "Страница", path: "/about" });

    expect(article.openGraph).toMatchObject({
      publishedTime: "2026-07-16T10:00:00+05:00",
      modifiedTime: "2026-07-17T10:00:00+05:00",
    });
    expect(page.openGraph).not.toHaveProperty("publishedTime");
  });
});

describe("siteUrl", () => {
  it("falls back to localhost:3000 when NEXT_PUBLIC_SITE_URL is unset", () => {
    const original = process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;

    expect(siteUrl()).toBe("http://localhost:3000");

    if (original !== undefined) {
      process.env.NEXT_PUBLIC_SITE_URL = original;
    }
  });
});
