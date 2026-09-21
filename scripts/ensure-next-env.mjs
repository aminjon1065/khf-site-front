import {
  existsSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";

// `tsc --noEmit` запускается до первого `next dev`/`next build` (CI,
// свежий клон), когда next-env.d.ts ещё не существует и .gitignore
// намеренно его не трекает. Без него tsc не видит ambient-объявления
// next/image-types/global — и падают все статические импорты картинок
// (`*.png`, `*.webp`) с TS2307. Next перезапишет файл при первом
// dev/build, поэтому достаточно записать каноничный минимальный вариант.
const CANONICAL = [
  '/// <reference types="next" />',
  '/// <reference types="next/image-types/global" />',
  "",
  "// NOTE: This file should not be edited",
  "// see https://nextjs.org/docs/app/api-reference/config/typescript for more information",
  "",
].join("\n");

const envFile = new URL("../next-env.d.ts", import.meta.url);
const devDir = new URL("../.next/dev", import.meta.url);
const devTypesDir = new URL("types", devDir);
const buildId = new URL("../.next/BUILD_ID", import.meta.url);
const prodTypes = new URL("../.next/types/routes.d.ts", import.meta.url);

// Гонка dev-сервера и production-сборки в одном `.next` (запустили dev,
// поверх собрали build) оставляет `.next/dev/types` полустёртым: файлы
// существуют, но внутри — обрывки, и tsc падает с TS1109/TS1128 прямо в
// сгенерированных routes.d.ts. Дискриминатор: живой dev-сервер трогает
// свои типы постоянно, поэтому `.next/dev/types` старше BUILD_ID — это
// остатки до сборки, а не рабочие типы. Удаляем, чтобы include из
// tsconfig не тянул их в проверку.
if (existsSync(devTypesDir) && existsSync(buildId)) {
  if (statSync(devTypesDir).mtimeMs < statSync(buildId).mtimeMs) {
    rmSync(devDir, { recursive: true, force: true });
  }
}

if (!existsSync(envFile)) {
  writeFileSync(envFile, CANONICAL);
} else {
  // next-env.d.ts пишет последний запускавшийся режим: dev ссылается на
  // `.next/dev/types/routes.d.ts`, build — на `.next/types/routes.d.ts`.
  // Если ссылка вдруг ведёт на удалённую выше директорию, возвращаем файл
  // в валидное состояние: типы production-сборки, если есть, иначе канон.
  const env = readFileSync(envFile, "utf8");

  if (env.includes(".next/dev/types") && !existsSync(devTypesDir)) {
    writeFileSync(
      envFile,
      existsSync(prodTypes)
        ? [
            '/// <reference types="next" />',
            '/// <reference types="next/image-types/global" />',
            'import "./.next/types/routes.d.ts";',
            "",
            "// NOTE: This file should not be edited",
            "// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.",
            "",
          ].join("\n")
        : CANONICAL,
    );
  }
}
