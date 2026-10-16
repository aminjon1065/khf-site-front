// RSS 2.0 для ленты предупреждений (/{locale}/alerts/rss.xml).

export interface RssItem {
  title: string;
  link: string;
  description: string;
  /** ISO-время; без него элемент выходит без pubDate. */
  publishedAt: string | null;
  category?: string;
}

export interface RssChannel {
  title: string;
  link: string;
  /** Адрес самой ленты (atom:link rel="self"). */
  feedUrl: string;
  description: string;
  /** Язык страницы в формате HTML lang (`ru`, `tg`, `en`). */
  language: string;
  items: RssItem[];
}

/**
 * Экранирование текста для XML. Заголовок предупреждения пишет оператор, и
 * `&` или `<` в нём («Сель & оползень») без этого ломали бы ленту целиком —
 * читатель RSS не показал бы ни одного предупреждения.
 */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    // Управляющие символы запрещены в XML 1.0 даже экранированными.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

function rfc822(iso: string | null): string | null {
  if (!iso) {
    return null;
  }
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date.toUTCString();
}

export function buildRss(channel: RssChannel): string {
  const items = channel.items
    .map((item) => {
      const published = rfc822(item.publishedAt);
      return [
        "    <item>",
        `      <title>${escapeXml(item.title)}</title>`,
        `      <link>${escapeXml(item.link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(item.link)}</guid>`,
        `      <description>${escapeXml(item.description)}</description>`,
        item.category ? `      <category>${escapeXml(item.category)}</category>` : null,
        published ? `      <pubDate>${published}</pubDate>` : null,
        "    </item>",
      ]
        .filter((line) => line !== null)
        .join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(channel.title)}</title>`,
    `    <link>${escapeXml(channel.link)}</link>`,
    `    <atom:link href="${escapeXml(channel.feedUrl)}" rel="self" type="application/rss+xml"/>`,
    `    <description>${escapeXml(channel.description)}</description>`,
    `    <language>${escapeXml(channel.language)}</language>`,
    // Читатели RSS опрашивают ленту не чаще, чем просит ttl (минуты): при ЧС
    // ждать дольше пяти минут нельзя.
    "    <ttl>5</ttl>",
    items,
    "  </channel>",
    "</rss>",
    "",
  ]
    .filter((line) => line !== "")
    .join("\n")
    .concat("\n");
}
