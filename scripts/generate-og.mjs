#!/usr/bin/env node
// Генерация дефолтных OG-карточек портала (public/og/og-{ru,tj,en}.png).
//
// Карточка собирается теми же шрифтами (локальные WOFF2 из app/fonts) и
// гербом (public/assets), что и сам портал, — рендер делает headless Chromium
// из состава Playwright. Скрипт запускается вручную при изменении фирменных
// данных (`npm run og:generate`); результат коммитуется как статический
// ассет, поэтому в рантайме сайт не тянет ни next/og, ни шрифтовые рендеры.
//
// Названия берутся из словарей регуляркой — импортировать TS из .mjs нельзя,
// а дублировать строки руками опасно: тест og-cards.test.mjs сверяет файлы
// со словарями и ловит расхождение.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const LOCALES = ["ru", "tj", "en"];

function pick(source, key) {
  const match = source.match(new RegExp(`${key}:\\s*"([^"]+)"`));
  if (!match) {
    throw new Error(`generate-og: ключ «${key}» не найден в словаре`);
  }
  return match[1];
}

async function copy() {
  const common = await readFile(path.join(root, "lib/copy/common.ts"), "utf8");
  const dictionaries = {};
  for (const locale of ["tj", "en"]) {
    dictionaries[locale] = await readFile(
      path.join(root, `lib/i18n/dictionaries/${locale}.ts`),
      "utf8",
    );
  }

  return LOCALES.map((locale) => {
    const source = locale === "ru" ? common : dictionaries[locale];
    return {
      locale,
      short: pick(source, "siteShort"),
      name: pick(source, "siteName"),
      description: pick(source, "siteDescription"),
    };
  });
}

function cardHtml({ locale, short, name, description }) {
  const fontSans = pathToFileURL(
    path.join(root, "app/fonts/fira-sans-critical.woff2"),
  ).href;
  const fontCondensed = pathToFileURL(
    path.join(root, "app/fonts/fira-sans-condensed-critical.woff2"),
  ).href;
  const emblem = pathToFileURL(
    path.join(root, `public/assets/logo-kchs-${locale}.webp`),
  ).href;

  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face { font-family: "Fira Sans"; src: url("${fontSans}") format("woff2"); font-weight: 400; }
  @font-face { font-family: "Fira Sans Condensed"; src: url("${fontCondensed}") format("woff2"); font-weight: 600; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    font-family: "Fira Sans", system-ui, sans-serif;
    background: linear-gradient(180deg, #f5f7fa 0%, #e9eef4 100%);
    color: #161a1e;
    display: flex; flex-direction: column;
  }
  .flag { height: 10px; flex: none; background: linear-gradient(90deg, #cc0000 0 33.4%, #fff 33.4% 66.7%, #006600 66.7% 100%); }
  .content { flex: 1; display: flex; align-items: center; gap: 56px; padding: 0 72px; }
  .emblem { width: 168px; flex: none; }
  .text { min-width: 0; }
  .short {
    font-family: "Fira Sans Condensed", system-ui, sans-serif; font-weight: 600;
    font-size: 30px; letter-spacing: 0.14em; text-transform: uppercase;
    color: #416180; margin-bottom: 18px;
  }
  .name {
    font-family: "Fira Sans Condensed", system-ui, sans-serif; font-weight: 600;
    font-size: 63px; line-height: 1.1; letter-spacing: -0.01em;
    max-width: 820px; margin-bottom: 26px;
  }
  .rule { width: 96px; height: 4px; background: #416180; margin-bottom: 26px; }
  .description { font-size: 25px; line-height: 1.45; color: #42474d; max-width: 780px; }
  .footer {
    flex: none; background: #0e1a24; color: #e8eef3;
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 72px; font-size: 22px; letter-spacing: 0.04em;
  }
  .footer .dom { font-family: "Fira Sans Condensed", system-ui, sans-serif; font-weight: 600; font-size: 26px; }
</style></head>
<body>
  <div class="flag"></div>
  <div class="content">
    <img class="emblem" src="${emblem}" alt="">
    <div class="text">
      <div class="short">${short}</div>
      <div class="name">${name}</div>
      <div class="rule"></div>
      <div class="description">${description}</div>
    </div>
  </div>
  <div class="footer">
    <span>khf.tj</span>
    <span class="dom">112</span>
  </div>
</body></html>`;
}

async function main() {
  const cards = await copy();
  const outDir = path.join(root, "public/og");
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });

  try {
    for (const card of cards) {
      await page.setContent(cardHtml(card), { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(150);
      const png = await page.screenshot({ type: "png", fullPage: false });
      const out = path.join(outDir, `og-${card.locale}.png`);
      await writeFile(out, png);
      console.log(`[og] ${path.relative(root, out)} (${png.length} bytes)`);
    }
  } finally {
    await browser.close();
  }
}

// Проверка окружения до запуска: понятные сообщения вместо стека из кишок.
for (const file of [
  "app/fonts/fira-sans-critical.woff2",
  "app/fonts/fira-sans-condensed-critical.woff2",
  "public/assets/logo-kchs-ru.webp",
  "public/assets/logo-kchs-tj.webp",
  "public/assets/logo-kchs-en.webp",
]) {
  if (!existsSync(path.join(root, file))) {
    console.error(`[og] не найден ${file} — карточки собрать нельзя`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("[og] не получилось:", error);
  process.exit(1);
});
