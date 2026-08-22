import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import {
  DOCUMENT_TYPE_VALUES,
  getDocuments,
} from "@/app/[locale]/documents/content";

// Фронт предлагал 5 типов документа из 9, которые есть в CMS: «План», «Норматив»,
// «Открытые данные» и «Форма» отфильтровать было нельзя, хотя сервер по ним
// фильтрует. Плюс подписи брались из массива по индексу, и слаг `instruction`
// оказался подписан «Памятка» вместо «Инструкция».

/** Перечень из OpenAPI-схемы: `type_value` документа. */
function schemaTypeValues(): string[] {
  const source = readFileSync("lib/api-types.generated.ts", "utf8");
  const line = source
    .split("\n")
    .find((l) => l.includes("type_value:") && l.includes("|"));

  expect(line, "в схеме не найдено поле type_value").toBeTruthy();

  return [...line!.matchAll(/"([a-z_]+)"/g)].map((m) => m[1]);
}

describe("типы документов синхронны со схемой CMS", () => {
  it("список фронта совпадает с перечнем в OpenAPI", () => {
    expect([...DOCUMENT_TYPE_VALUES].sort()).toEqual(schemaTypeValues().sort());
  });

  for (const locale of LOCALES as readonly Locale[]) {
    it(`${locale}: у каждого типа есть непустая подпись`, () => {
      const { types } = getDocuments(locale);

      for (const value of DOCUMENT_TYPE_VALUES) {
        expect(types[value]?.trim().length ?? 0).toBeGreaterThan(0);
      }
    });
  }

  it("подписи не совпадают между локалями — значит они переведены", () => {
    const ru = getDocuments("ru").types;
    const en = getDocuments("en").types;

    expect(en.law).not.toBe(ru.law);
    expect(en.report).not.toBe(ru.report);
  });
});
