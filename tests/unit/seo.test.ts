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
    expect(metadata.twitter).toMatchObject({ card: "summary", title: "Заголовок" });
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
      "https://cms.khf.tj/storage/cover.jpg",
    ]);
  });

  it("uses a large Twitter card only when an image exists", () => {
    // Обе ветки рядом: иначе легко «починить» одну и не заметить, что вторая
    // теперь отдаёт тот же самый card.
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

    expect(withoutImage.twitter).toMatchObject({ card: "summary" });
    expect(withImage.twitter).toMatchObject({ card: "summary_large_image" });
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
