import { fetchAlerts } from "@/lib/api";
import { htmlLang, isLocale, LOCALES } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { buildRss } from "@/lib/rss";
import { siteUrl } from "@/lib/seo";

/**
 * RSS-лента предупреждений: то, что оператор в мастере CMS отправил в канал
 * «RSS». Раньше галочка была, а ленты не было — оператор считал, что
 * предупреждение ушло подписчикам, а оно не уходило никуда. Обновляется так
 * же, как страница /alerts: по вебхуку CMS и не реже раза в минуту.
 */
export const revalidate = 60;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
): Promise<Response> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return new Response("Not found", { status: 404 });
  }

  const alerts = await fetchAlerts(locale, { channel: "rss" });
  if (alerts === null) {
    // Пустая лента выдала бы молчание CMS за «предупреждений нет».
    return new Response("Alerts are temporarily unavailable", {
      status: 503,
      headers: { "Retry-After": "60" },
    });
  }

  const { common, pages } = getDictionary(locale);
  const origin = siteUrl().replace(/\/+$/, "");
  const alertsPath = `/${locale}${routes.alert}`;

  const xml = buildRss({
    title: `${common.siteShort} — ${pages.alertsList.heading}`,
    link: `${origin}${alertsPath}`,
    feedUrl: `${origin}${alertsPath}/rss.xml`,
    description: pages.alertsList.rssDescription,
    language: htmlLang(locale),
    items: alerts.map((alert) => ({
      title: alert.title,
      link: `${origin}${alertsPath}/${encodeURIComponent(alert.slug)}`,
      description: [alert.level_label, alert.region, alert.summary]
        .filter(Boolean)
        .join(" · "),
      publishedAt: alert.published_at ?? alert.starts_at_iso,
      category: alert.hazard_label,
    })),
  });

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
