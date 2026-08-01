import { describe, expect, it } from "vitest";
// Локальные модули импортируются напрямую, в обход `lib/i18n/dictionaries.ts`:
// тот помечен `server-only` и обычный импорт из Node/Vitest отвергает.
import { en } from "@/lib/i18n/dictionaries/en";
import { ru } from "@/lib/i18n/dictionaries/ru";
import { tj } from "@/lib/i18n/dictionaries/tj";

// Сведено из двух линий работ (dictionaries.test.ts + dictionaries.optimize.
// test.ts). Обе сравнивали словари между собой, но по-разному: одна — набор
// путей до ключей, другая — вложенную структуру вместе с типами листьев.
// Вторая строго сильнее (ловит ещё и разъехавшийся тип значения, и разную
// длину массивов), поэтому оставлена она; от первой сохранена защита от
// «пустой» проверки.

/** Структура значения: ключи по алфавиту, у листьев — тип, у массивов — поэлементно. */
function objectShape(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(objectShape);
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, objectShape(child)]),
    );
  }

  return typeof value;
}

/** Число листьев — только чтобы проверка не оказалась истинной на пустом словаре. */
function leafCount(value: unknown): number {
  if (Array.isArray(value)) {
    return value.reduce<number>((total, child) => total + leafCount(child), 0);
  }

  if (typeof value === "object" && value !== null) {
    return Object.values(value).reduce<number>(
      (total, child) => total + leafCount(child),
      0,
    );
  }

  return 1;
}

describe("localized dictionaries", () => {
  it("keep the same nested structure in tj as in ru", () => {
    expect(objectShape(tj)).toEqual(objectShape(ru));
  });

  it("keep the same nested structure in en as in ru", () => {
    expect(objectShape(en)).toEqual(objectShape(ru));
  });

  it("is not vacuously true (the dictionary actually has content)", () => {
    expect(leafCount(ru)).toBeGreaterThan(20);
  });
});
