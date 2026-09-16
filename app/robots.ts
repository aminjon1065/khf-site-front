import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

// robots.txt: закрыт только служебный API.
//
// Локализованный поиск (`/ru/search`, …) НЕ disallow: его страницы отдают
// noindex через meta robots, а для применения noindex краулер обязан уметь
// прочитать HTML страницы (Google: "noindex не будет применён, если доступ
// к странице закрыт в robots.txt"). Исключение поиска из sitemap сохранилось
// в app/sitemap.ts — в карту он по-прежнему не попадает.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
