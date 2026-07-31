import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Регрессия на «сайт перезагружается при каждом переходе».
//
// Внутренние ссылки должны быть <Link> (next/link или наша обёртка LocaleLink):
// обычный <a> уводит браузер на полную перезагрузку документа — теряются
// состояние, позиция скролла и весь смысл App Router. Так уже ломались шапка
// (локальный шим `function NextLink(props) { return <a {...props} /> }`) и
// список новостей (карточки, фильтр категорий, пагинация).
//
// Внешние адреса, tel:/mailto: и якоря (#main) — наоборот, обязаны быть <a>.

const ROOTS = ["app", "components"];

/** Все .tsx-файлы проекта. */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);

    if (statSync(path).isDirectory()) {
      return sourceFiles(path);
    }

    return path.endsWith(".tsx") ? [path] : [];
  });
}

/**
 * Открывающие теги <a …> вместе с их атрибутами (тег может быть многострочным).
 */
function anchorTags(source: string): string[] {
  return source.match(/<a(?:[\s][^>]*?)?>/g) ?? [];
}

/** Ссылка ведёт внутрь портала? */
function isInternal(tag: string): boolean {
  const href = tag.match(/href=(?:"([^"]*)"|\{([\s\S]*?)\})/);

  if (!href) {
    return false;
  }

  const literal = href[1];
  const expression = href[2];

  if (literal !== undefined) {
    // "#main", "tel:…", "mailto:…", "https://…" — законные <a>.
    return literal.startsWith("/");
  }

  if (expression === undefined) {
    return false;
  }

  // Выражения: локализованные маршруты — внутренние; телефон/почта — нет.
  return /withLocale|routes\.|`\/\$\{/.test(expression) && !/tel:|mailto:/.test(expression);
}

describe("внутренние ссылки не должны быть обычными <a>", () => {
  const offenders = ROOTS.flatMap(sourceFiles)
    .filter((file) => !file.endsWith("global-not-found.tsx"))
    .flatMap((file) =>
      anchorTags(readFileSync(file, "utf8"))
        .filter(isInternal)
        .map((tag) => `${file}: ${tag.replace(/\s+/g, " ").slice(0, 90)}`),
    );

  it("во всех .tsx нет внутренних ссылок через <a>", () => {
    expect(offenders).toEqual([]);
  });
});
