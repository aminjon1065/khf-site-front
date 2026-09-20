import { createRequire } from "node:module";
import { afterEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const configPath = require.resolve("../../lighthouserc.cjs");

function loadConfig(strict: boolean, perfMin?: string) {
  process.env.LHCI_STRICT = strict ? "1" : "0";
  // Изолируемся от внешнего окружения (CI задаёт LHCI_PERF_MIN=0.70 на
  // уровне джобы) — дефолты проверяем без него, оверрайд — с ним.
  if (perfMin === undefined) {
    delete process.env.LHCI_PERF_MIN;
  } else {
    process.env.LHCI_PERF_MIN = perfMin;
  }
  delete require.cache[configPath];

  return require(configPath);
}

afterEach(() => {
  delete process.env.LHCI_STRICT;
  delete process.env.LHCI_PERF_MIN;
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

  it("honors the LHCI_PERF_MIN override for runner-hardware CI floors", () => {
    const ciConfig = loadConfig(false, "0.70");

    expect(ciConfig.ci.assert.assertions["categories:performance"]).toEqual([
      "error",
      { aggregationMethod: "median", minScore: 0.7 },
    ]);
  });
});
