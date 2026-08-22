import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Регрессия на «портал показывает выдуманный контент».
//
// Главная умела подставлять из словаря три демонстрационные новости, шесть
// плиток инструкций с несуществующими адресами и статистику ведомства —
// когда CMS отдавала мало данных или не отвечала вовсе. Для государственного
// портала это худший класс ошибки: вымысел неотличим от официального
// сообщения, а ссылки ведут в 404.
//
// Словари теперь содержат только строки интерфейса. Любой адрес материала
// приходит из CMS, поэтому литеральный слаг в словаре — признак того, что
// демо-данные вернулись.

const DICTIONARY_FILES = [
  ...readdirSync("lib/copy").map((f) => join("lib/copy", f)),
  ...readdirSync("lib/i18n/dictionaries").map((f) =>
    join("lib/i18n/dictionaries", f),
  ),
].filter((f) => f.endsWith(".ts"));

/** routes.article("zamin-2026") и подобное — адрес материала, зашитый в текст. */
const LITERAL_SLUG =
  /routes\.(article|guide|project|announcement)\(\s*["'][^"']+["']\s*\)/g;

describe("словари не содержат выдуманного контента", () => {
  it("находит хотя бы один словарь (иначе проверка молча ничего не проверяет)", () => {
    expect(DICTIONARY_FILES.length).toBeGreaterThan(3);
  });

  for (const file of DICTIONARY_FILES) {
    it(`${file}: нет захардкоженных адресов материалов`, () => {
      const matches = readFileSync(file, "utf8").match(LITERAL_SLUG) ?? [];

      expect(matches).toEqual([]);
    });
  }

  it("маршруты требуют слаг и не подставляют демонстрационный по умолчанию", () => {
    const routes = readFileSync("lib/routes.ts", "utf8");

    expect(routes).not.toMatch(/\(\s*slug\s*=\s*["']/);
  });
});
