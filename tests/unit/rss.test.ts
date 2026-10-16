import { describe, expect, it } from "vitest";
import { buildRss, escapeXml } from "@/lib/rss";

describe("escapeXml", () => {
  it("escapes markup an operator may type in a title", () => {
    // «Сель & оползень» без экранирования ломал бы ленту целиком.
    expect(escapeXml(`Сель & оползень <срочно> "Варзоб" 'ночью'`)).toBe(
      "Сель &amp; оползень &lt;срочно&gt; &quot;Варзоб&quot; &apos;ночью&apos;",
    );
  });

  it("drops control characters XML 1.0 forbids", () => {
    expect(escapeXml("Ливень\u0007 в Хатлоне\u001F")).toBe("Ливень в Хатлоне");
  });
});

describe("buildRss", () => {
  const channel = {
    title: "КЧС РТ — Предупреждения",
    link: "https://khf.tj/ru/alerts",
    feedUrl: "https://khf.tj/ru/alerts/rss.xml",
    description: "Действующие предупреждения",
    language: "ru",
  };

  it("lists every alert with a permanent link and RFC 822 date", () => {
    const xml = buildRss({
      ...channel,
      items: [
        {
          title: "Сель & оползень",
          link: "https://khf.tj/ru/alerts/sel-varzob",
          description: "Опасно · Душанбе",
          publishedAt: "2026-10-16T09:05:00+05:00",
          category: "Сель",
        },
      ],
    });

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain("<title>Сель &amp; оползень</title>");
    expect(xml).toContain('<guid isPermaLink="true">https://khf.tj/ru/alerts/sel-varzob</guid>');
    expect(xml).toContain("<pubDate>Fri, 16 Oct 2026 04:05:00 GMT</pubDate>");
    expect(xml).toContain('<atom:link href="https://khf.tj/ru/alerts/rss.xml" rel="self"');
    expect(xml).toContain("<ttl>5</ttl>");
  });

  it("is a valid empty channel when nothing is sent to RSS", () => {
    const xml = buildRss({ ...channel, items: [] });

    expect(xml).toContain("<channel>");
    expect(xml).not.toContain("<item>");
    expect(xml.trimEnd().endsWith("</rss>")).toBe(true);
  });

  it("omits pubDate when the alert has no valid time", () => {
    const xml = buildRss({
      ...channel,
      items: [{ title: "A", link: "https://khf.tj/ru/alerts/a", description: "", publishedAt: "not a date" }],
    });

    expect(xml).not.toContain("<pubDate>");
  });
});
