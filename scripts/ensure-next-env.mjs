import { existsSync, writeFileSync } from "node:fs";

// `tsc --noEmit` запускается до первого `next dev`/`next build` (CI,
// свежий клон), когда next-env.d.ts ещё не существует и .gitignore
// намеренно его не трекает. Без него tsc не видит ambient-объявления
// next/image-types/global — и падают все статические импорты картинок
// (`*.png`, `*.webp`) с TS2307. Next перезапишет файл при первом
// dev/build, поэтому достаточно записать каноничный минимальный вариант.
const target = new URL("../next-env.d.ts", import.meta.url);

if (!existsSync(target)) {
  writeFileSync(
    target,
    [
      "/// <reference types=\"next\" />",
      "/// <reference types=\"next/image-types/global\" />",
      "",
      "// NOTE: This file should not be edited",
      "// see https://nextjs.org/docs/app/api-reference/config/typescript for more information",
      "",
    ].join("\n"),
  );
}
