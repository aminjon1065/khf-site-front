import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import {
  countLabel,
  legendItems,
  levelBadges,
  levelStatusTexts,
  regionNames,
  regionShorts,
} from "@/lib/levels";

// Шкала опасности раньше была русскими константами: на /tj и /en рядом с
// локализованным названием региона из CMS стоял русский бейдж «опасно», а в
// легенде карты — «Предупреждение». Подписи уровня обязаны быть на языке
// страницы: уровень всегда дублируется текстом, и непонятный текст лишает
// дублирование смысла.

describe("подписи шкалы опасности локализованы", () => {
  it("levels.ts не содержит кириллических литералов", () => {
    const source = readFileSync("lib/levels.ts", "utf8");
    // Комментарии на русском допустимы, строковые литералы — нет.
    const literals = source.match(/"[^"]*"/g) ?? [];

    expect(literals.filter((s) => /[А-Яа-яЁё]/.test(s))).toEqual([]);
  });

  for (const locale of LOCALES as readonly Locale[]) {
    it(`${locale}: все уровни и регионы имеют непустую подпись`, () => {
      const badges = levelBadges(locale);
      const statuses = levelStatusTexts(locale);
      const names = regionNames(locale);
      const shorts = regionShorts(locale);

      for (const value of [
        ...Object.values(badges),
        ...Object.values(statuses),
        ...Object.values(names),
        ...Object.values(shorts),
      ]) {
        expect(value.trim().length).toBeGreaterThan(0);
      }

      expect(legendItems(locale)).toHaveLength(5);
    });
  }

  it("нерусские локали не показывают русский текст", () => {
    for (const locale of ["tj", "en"] as const) {
      expect(levelBadges(locale).danger).not.toBe(levelBadges("ru").danger);
      expect(regionNames(locale).sughd).not.toBe(regionNames("ru").sughd);
    }
  });
});

describe("countLabel склоняет слово по правилам локали", () => {
  // Русский: три формы с исключением на 11–14. Правило берётся у
  // Intl.PluralRules, поэтому проверяем именно граничные числа.
  it.each([
    [1, "событие"],
    [2, "события"],
    [4, "события"],
    [5, "событий"],
    [11, "событий"],
    [14, "событий"],
    [21, "событие"],
    [22, "события"],
    [25, "событий"],
    [0, "событий"],
  ])("ru: %i → %s", (n, expected) => {
    expect(countLabel("ru", n)).toBe(expected);
  });

  it.each([
    [1, "event"],
    [2, "events"],
    [0, "events"],
  ])("en: %i → %s", (n, expected) => {
    expect(countLabel("en", n)).toBe(expected);
  });

  it("tj: форма одна и не пустая при любом числе", () => {
    for (const n of [0, 1, 2, 5, 11, 21]) {
      expect(countLabel("tj", n)).toBe("ҳодиса");
    }
  });
});
