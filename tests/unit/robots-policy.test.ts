import { describe, expect, it } from "vitest";
import robots from "@/app/robots";

// Согласованность robots.txt и meta robots.
//
// Разобранное противоречие: `/ru/search` был закрыт в robots.txt через
// Disallow, и одновременно сама страница отдавала `noindex`. Директиву
// noindex робот может применить, только прочитав страницу, — а Disallow
// именно чтение и запрещает. Итог: адрес остаётся кандидатом на индекс
// (Google прямо описывает этот случай), а вложенный в него noindex не
// действует. Правильная пара — доступ к HTML + noindex; из sitemap поиск
// по-прежнему исключён (app/sitemap.ts).
describe("robots.txt", () => {
  const rules = robots().rules as {
    userAgent: string;
    allow: string;
    disallow: string[];
  };

  it("не закрывает локализованный поиск: иначе noindex на нём не сработает", () => {
    expect(rules.disallow).not.toContain("/*/search");
    expect(rules.disallow.some((path) => path.includes("search"))).toBe(false);
  });

  it("продолжает закрывать служебный API", () => {
    expect(rules.disallow).toContain("/api/");
  });

  it("оставляет остальной сайт открытым", () => {
    expect(rules.userAgent).toBe("*");
    expect(rules.allow).toBe("/");
  });

  it("объявляет абсолютные sitemap и host", () => {
    const result = robots();

    expect(String(result.sitemap)).toMatch(/^https?:\/\/.+\/sitemap\.xml$/);
    expect(result.host).toBeTruthy();
  });
});
