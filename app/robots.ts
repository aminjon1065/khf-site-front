import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

// robots.txt: пускаем краулеров везде, кроме служебного API и локализованного
// поиска (`/ru/search`, `/tj/search`, …). Sitemap и host — абсолютные, из siteUrl().
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/*/search"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
