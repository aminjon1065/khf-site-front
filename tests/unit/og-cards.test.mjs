import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Дефолтная OG-карточка портала (public/og/og-{ru,tj,en}.png) — статический
// ассет, который генерируется вручную (`npm run og:generate`) и коммитится.
// Именно поэтому нужен тест: файл не пересобирается на сборке, и расхождение
// с названием портала в словаре никак иначе не всплывёт — карточка просто
// будет годами показывать старое название в каждом мессенджере и соцсети.
//
// Скрипт generate-og.mjs ссылается на этот тест в своём заголовке.

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const LOCALES = ["ru", "tj", "en"];

function read(relative) {
  return readFileSync(path.join(root, relative));
}

/** Размеры PNG из заголовка IHDR (без декодирования пикселей). */
function pngSize(buffer) {
  const signature = buffer.subarray(0, 8).toString("latin1");
  return {
    isPng: signature === "\x89PNG\r\n\x1a\n",
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function pick(source, key) {
  const match = source.match(new RegExp(`${key}:\\s*"([^"]+)"`));
  return match ? match[1] : null;
}

describe("дефолтные OG-карточки портала", () => {
  it.each(LOCALES)("og-%s.png существует и имеет размер 1200×630", (locale) => {
    const file = read(`public/og/og-${locale}.png`);
    const { isPng, width, height } = pngSize(file);

    expect(isPng).toBe(true);
    // Размер, который ждут Open Graph и Twitter summary_large_image; он же
    // объявлен в defaultOgImage() (lib/seo.ts) — если разойдётся, соцсети
    // покажут карточку обрезанной.
    expect({ width, height }).toEqual({ width: 1200, height: 630 });
    // Пустой/битый рендер весит считаные байты, а слишком тяжёлый файл
    // отвергают краулеры превью.
    expect(file.length).toBeGreaterThan(10_000);
    expect(file.length).toBeLessThan(1_000_000);
  });

  it("lib/seo.ts ссылается ровно на те файлы, что лежат в public/og", () => {
    const seo = read("lib/seo.ts").toString("utf8");
    // Путь собирается шаблоном `/og/og-${locale}.png` — проверяем шаблон, а
    // не результат: так тест поймает и переименование каталога.
    expect(seo).toContain("`/og/og-${locale}.png`");
  });

  it("генератор и словари согласованы по названию портала", () => {
    // Скрипт вытаскивает подписи регуляркой из lib/copy/common.ts и словарей.
    // Если ключ переименуют, генерация упадёт — но карточки уже лежат в репо,
    // и молча устареют. Проверяем, что ключи на месте прямо сейчас.
    const sources = {
      ru: read("lib/copy/common.ts").toString("utf8"),
      tj: read("lib/i18n/dictionaries/tj.ts").toString("utf8"),
      en: read("lib/i18n/dictionaries/en.ts").toString("utf8"),
    };

    for (const locale of LOCALES) {
      for (const key of ["siteShort", "siteName", "siteDescription"]) {
        expect(
          pick(sources[locale], key),
          `${locale}: ключ ${key} должен быть доступен generate-og.mjs`,
        ).toBeTruthy();
      }
    }
  });
});
