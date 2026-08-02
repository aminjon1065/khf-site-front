import { describe, expect, it } from "vitest";
import {
  evaluateFrontendBundle,
  evaluateLazyOnlyLibraries,
  FRONTEND_BUNDLE_BUDGETS,
  LAZY_ONLY_LIBRARIES,
} from "../../scripts/bundle-report.mjs";

describe("frontend bundle budgets", () => {
  it("accepts a bundle inside every budget", () => {
    const report = evaluateFrontendBundle(
      [
        {
          route: "/[locale]",
          firstLoadUncompressedJsBytes:
            FRONTEND_BUNDLE_BUDGETS.largestRouteBytes,
          firstLoadChunkPaths: [".next/static/chunks/app.js"],
        },
      ],
      [
        {
          path: ".next/static/chunks/app.js",
          bytes: FRONTEND_BUNDLE_BUDGETS.largestChunkBytes,
        },
      ],
    );

    expect(report.violations).toEqual([]);
  });

  it("reports the exact budget that regressed", () => {
    const report = evaluateFrontendBundle(
      [
        {
          route: "/[locale]/map",
          firstLoadUncompressedJsBytes:
            FRONTEND_BUNDLE_BUDGETS.largestRouteBytes + 1,
          firstLoadChunkPaths: [],
        },
      ],
      [],
    );

    expect(report.violations).toHaveLength(1);
    expect(report.violations[0]).toMatch(/^largestRouteBytes:/);
  });

  it("catches CSS growing past the §3.3 budget", () => {
    // Единственный бюджет из раздела 3.3, который до сих пор нигде не
    // проверялся: вес CSS. Сейчас запас четырёхкратный, но именно поэтому
    // рост легко не заметить — счётчик должен назвать метрику по имени.
    const report = evaluateFrontendBundle(
      [],
      [],
      [
        {
          path: ".next/static/chunks/a.css",
          bytes: 1,
          gzipBytes: FRONTEND_BUNDLE_BUDGETS.cssGzipBytes,
        },
        {
          path: ".next/static/chunks/b.css",
          bytes: 1,
          gzipBytes: 1,
        },
      ],
    );

    expect(report.metrics.cssGzipBytes).toBe(
      FRONTEND_BUNDLE_BUDGETS.cssGzipBytes + 1,
    );
    expect(report.violations).toHaveLength(1);
    expect(report.violations[0]).toMatch(/^cssGzipBytes:/);
  });

  it("sums every stylesheet, not just the first one", () => {
    const half = Math.floor(FRONTEND_BUNDLE_BUDGETS.cssGzipBytes / 2);
    const report = evaluateFrontendBundle(
      [],
      [],
      [
        { path: "a.css", bytes: 1, gzipBytes: half },
        { path: "b.css", bytes: 1, gzipBytes: half },
      ],
    );

    expect(report.metrics.cssGzipBytes).toBe(half * 2);
    expect(report.violations).toEqual([]);
  });
});

describe("lazy-only libraries", () => {
  const [mapLibrary] = LAZY_ONLY_LIBRARIES;
  const routes = [
    {
      route: "/[locale]",
      firstLoadChunkPaths: [".next/static/chunks/shell.js"],
    },
    {
      route: "/[locale]/map",
      firstLoadChunkPaths: [".next/static/chunks/shell.js"],
    },
  ];

  it("stays silent while the map libraries live in a chunk nobody loads upfront", () => {
    const violations = evaluateLazyOnlyLibraries(
      routes,
      new Map([[".next/static/chunks/shell.js", "export const a=1"]]),
    );

    expect(violations).toEqual([]);
  });

  it("catches the map libraries returning to the first-load graph", () => {
    // Ровно та регрессия, которую байтовый бюджет не ловит: ~50 KiB d3-geo и
    // topojson всё ещё умещаются в запас до largestRouteBytes.
    const violations = evaluateLazyOnlyLibraries(
      routes,
      new Map([
        [
          ".next/static/chunks/shell.js",
          'case"MultiPolygon":case"GeometryCollection":return t',
        ],
      ]),
    );

    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain(mapLibrary.name);
    expect(violations[0]).toContain("/[locale]");
  });

  it("does not fire when only one marker happens to appear", () => {
    const violations = evaluateLazyOnlyLibraries(
      routes,
      new Map([
        [".next/static/chunks/shell.js", 'const kind="MultiPolygon"'],
      ]),
    );

    expect(violations).toEqual([]);
  });
});
