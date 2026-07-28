const numberOfRuns = Number(process.env.LHCI_RUNS ?? 3);
const strictBudgets = process.env.LHCI_STRICT === "1";
const performanceBudget = strictBudgets ? 0.99 : 0.95;
const metricSeverity = strictBudgets ? "error" : "warn";
const lighthousePort = Number(process.env.LHCI_PORT ?? 3000);
const lighthouseUrl = `http://127.0.0.1:${lighthousePort}`;

module.exports = {
  ci: {
    collect: {
      numberOfRuns,
      startServerCommand:
        `npm run start -- --hostname 127.0.0.1 --port ${lighthousePort}`,
      startServerReadyPattern: "Ready in",
      url: [
        `${lighthouseUrl}/ru`,
        `${lighthouseUrl}/tj`,
        `${lighthouseUrl}/en`,
        `${lighthouseUrl}/ru/news`,
        `${lighthouseUrl}/ru/news/test-news`,
        `${lighthouseUrl}/ru/map`,
      ],
    },
    assert: {
      assertions: {
        "categories:accessibility": [
          "error",
          { aggregationMethod: "median", minScore: 1 },
        ],
        "categories:best-practices": [
          "error",
          { aggregationMethod: "median", minScore: 1 },
        ],
        "categories:performance": [
          "error",
          { aggregationMethod: "median", minScore: performanceBudget },
        ],
        "categories:seo": [
          "error",
          { aggregationMethod: "median", minScore: 1 },
        ],
        "cumulative-layout-shift": [
          metricSeverity,
          { aggregationMethod: "pessimistic", maxNumericValue: 0.02 },
        ],
        "first-contentful-paint": [
          metricSeverity,
          { aggregationMethod: "median", maxNumericValue: 1200 },
        ],
        "largest-contentful-paint": [
          metricSeverity,
          { aggregationMethod: "pessimistic", maxNumericValue: 1800 },
        ],
        "speed-index": [
          metricSeverity,
          { aggregationMethod: "median", maxNumericValue: 2000 },
        ],
        "total-blocking-time": [
          metricSeverity,
          { aggregationMethod: "median", maxNumericValue: 100 },
        ],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./lighthouse-results",
    },
  },
};
