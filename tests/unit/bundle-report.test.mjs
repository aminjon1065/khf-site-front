import { describe, expect, it } from "vitest";
import {
  evaluateFrontendBundle,
  FRONTEND_BUNDLE_BUDGETS,
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
});
