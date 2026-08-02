#!/usr/bin/env node
// E-1: Lighthouse budgets for the pages PROJECT_PLAN.md names — performance
// >= 90, accessibility >= 95, mobile. Run against an already-running server
// (`npm run build && npm run start`, or `npm run dev`) — this script does
// not start one itself, so it can point at either.
//
// Usage: node scripts/lighthouse-budgets.mjs [baseUrl]
//   baseUrl defaults to http://localhost:3000

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";

const BUDGETS = { performance: 90, accessibility: 95 };

// A real news-article slug is resolved at runtime (below) rather than
// hardcoded, since slugs come from CMS content that changes.
const TARGETS = [
  { key: "home", path: "/ru" },
  { key: "news-list", path: "/ru/news" },
  { key: "news-article", path: null }, // filled in below
  { key: "risk-map", path: "/ru/map" },
];

async function resolveFirstNewsArticlePath(baseUrl) {
  const res = await fetch(`${baseUrl}/ru/news`);
  const html = await res.text();
  const match = html.match(/href="(\/ru\/news\/[a-z0-9-]+)"/);
  if (!match) {
    throw new Error("Could not find a news article link on /ru/news to audit.");
  }
  return match[1];
}

async function runLighthouse(url, port) {
  const result = await lighthouse(
    url,
    { port, output: "json", logLevel: "error" },
    // Explicit mobile form factor + throttling, rather than relying on
    // lighthouse:default's own default (which can drift between versions) —
    // PROJECT_PLAN.md's E-1 budget is specifically "на мобильном" (mobile).
    {
      extends: "lighthouse:default",
      settings: {
        formFactor: "mobile",
        screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 2.625, disabled: false },
        // Тот же метод троттлинга, что и в lighthouserc.cjs: иначе два
        // инструмента в одном репозитории мерили бы разное и спорили друг с
        // другом (модель Lantern завышает LCP этого сайта примерно на секунду
        // — см. комментарий там же).
        throttlingMethod: "devtools",
        onlyCategories: ["performance", "accessibility"],
      },
    },
  );
  return result.lhr;
}

function scoreOf(lhr, category) {
  return Math.round((lhr.categories[category]?.score ?? 0) * 100);
}

async function main() {
  const baseUrl = process.argv[2] ?? "http://localhost:3000";
  console.log(`Auditing ${baseUrl} (mobile) against budgets:`, BUDGETS);

  TARGETS.find((t) => t.key === "news-article").path = await resolveFirstNewsArticlePath(baseUrl);

  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new"] });
  const rows = [];
  let allPassed = true;

  try {
    for (const target of TARGETS) {
      const url = `${baseUrl}${target.path}`;
      process.stdout.write(`  ${target.key} (${target.path}) ... `);
      const lhr = await runLighthouse(url, chrome.port);
      const performance = scoreOf(lhr, "performance");
      const accessibility = scoreOf(lhr, "accessibility");
      const passed = performance >= BUDGETS.performance && accessibility >= BUDGETS.accessibility;
      allPassed = allPassed && passed;
      console.log(`perf=${performance} a11y=${accessibility} ${passed ? "OK" : "BELOW BUDGET"}`);
      rows.push({ ...target, url, performance, accessibility, passed });
    }
  } finally {
    // chrome.kill() is synchronous and its temp-profile cleanup can EPERM
    // on Windows if the just-killed Chrome process hasn't released its file
    // lock yet (a launcher-internal quirk) - a real try/catch, not a
    // promise .catch(), since kill() doesn't return a promise at all.
    try {
      chrome.kill();
    } catch (err) {
      console.warn(`(chrome-launcher cleanup warning, ignored: ${err.message})`);
    }
  }

  const timestamp = new Date().toISOString();
  const lines = [
    "# Lighthouse budgets — E-1 (PROJECT_PLAN.md)",
    "",
    `Budget: performance >= ${BUDGETS.performance}, accessibility >= ${BUDGETS.accessibility} (mobile).`,
    "",
    `Last run: ${timestamp}`,
    "",
    "| Page | URL | Performance | Accessibility | Status |",
    "|---|---|---|---|---|",
    ...rows.map(
      (r) =>
        `| ${r.key} | \`${r.path}\` | ${r.performance} | ${r.accessibility} | ${r.passed ? "✅" : "❌"} |`,
    ),
    "",
    "Regenerate: `node scripts/lighthouse-budgets.mjs [baseUrl]` against a running server (`npm run build && npm run start`, matches production more closely than `npm run dev`).",
    "",
  ];

  const docsPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "docs",
    "lighthouse-budgets.md",
  );
  await writeFile(docsPath, lines.join("\n"));
  console.log(`\nWrote ${docsPath}`);

  if (!allPassed) {
    console.error("\nOne or more pages are below budget.");
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
