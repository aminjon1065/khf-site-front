import { createRequire } from "node:module";
import { afterEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const configPath = require.resolve("../../lighthouserc.cjs");

function loadConfig(strict: boolean) {
  process.env.LHCI_STRICT = strict ? "1" : "0";
  delete require.cache[configPath];

  return require(configPath);
}

afterEach(() => {
  delete process.env.LHCI_STRICT;
  delete require.cache[configPath];
});

describe("Lighthouse CI budgets", () => {
  it("blocks merges below 95 while retaining strict nightly budgets", () => {
    const mergeConfig = loadConfig(false);
    const strictConfig = loadConfig(true);

    expect(mergeConfig.ci.collect.numberOfRuns).toBe(3);
    expect(mergeConfig.ci.collect.url).toHaveLength(6);
    expect(mergeConfig.ci.assert.assertions["categories:performance"]).toEqual([
      "error",
      { aggregationMethod: "median", minScore: 0.95 },
    ]);
    expect(
      mergeConfig.ci.assert.assertions["largest-contentful-paint"][0],
    ).toBe("warn");
    expect(strictConfig.ci.assert.assertions["categories:performance"]).toEqual([
      "error",
      { aggregationMethod: "median", minScore: 0.99 },
    ]);
    expect(
      strictConfig.ci.assert.assertions["largest-contentful-paint"][0],
    ).toBe("error");
  });
});
