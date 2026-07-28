import { describe, expect, it } from "vitest";
import { buildAlternates, buildMetadata } from "@/lib/seo";

describe("SEO metadata", () => {
  it("emits canonical and every supported hreflang", () => {
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

  it("uses a large Twitter card only when an image exists", () => {
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
});
