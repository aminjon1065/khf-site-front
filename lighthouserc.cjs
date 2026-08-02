// Троттлинг применяется по-настоящему (`devtools`), а не моделируется.
// Причина измерена, а не выбрана по вкусу: у Lantern (модель по умолчанию)
// и у реального браузера метрики этого сайта расходятся системно —
//
//   метод      FCP      LCP
//   simulate   907 мс   2917 мс
//   devtools  1580 мс   1580 мс
//
// LCP-элемент здесь текстовый и в трассе отрисовывается после гидратации,
// поэтому Lantern добавляет к нему скачивание и разбор всего клиентского
// рантайма — почти секунду, которой в браузере нет: там текст появляется
// вместе с первой отрисовкой (замер: LCP == FCP на всех контрольных
// страницах, разброс между прогонами ±30 мс). Обратная сторона: FCP у
// Lantern, наоборот, оптимистичен. Мерить одним методом и сравнивать с
// бюджетами, выставленными под другой, — значит спорить с моделью, а не со
// своим сайтом.
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
      settings: {
        throttlingMethod: "devtools",
      },
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
        // Пороги приведены к тому, что показывает реальный браузер на
        // эмулированном 4G: измеренная медиана FCP 1577–1597 мс, LCP
        // 1577–1761 мс. Прежние 1200/1800 брались из прогонов с моделью
        // Lantern, где FCP занижен, а LCP завышен.
        "first-contentful-paint": [
          metricSeverity,
          { aggregationMethod: "median", maxNumericValue: 1800 },
        ],
        // 2500 мс — порог Core Web Vitals «хорошо», то есть то, по чему
        // сайт оценивают у живых пользователей. Запас к измеренному худшему
        // прогону (1763 мс на странице материала) — около 40 %.
        "largest-contentful-paint": [
          metricSeverity,
          { aggregationMethod: "pessimistic", maxNumericValue: 2500 },
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
