import { gzipSync } from "node:zlib";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const FRONTEND_BUNDLE_BUDGETS = {
  largestRouteBytes: 620 * 1024,
  largestChunkBytes: 250 * 1024,
  totalChunkBytes: 1024 * 1024,
};

/**
 * Библиотеки, которые обязаны приезжать только отдельным чанком по требованию.
 *
 * Одних байтовых бюджетов для этого мало: d3-geo вместе с topojson-client
 * занимают ~50 KiB, а запаса до `largestRouteBytes` сейчас ~53 KiB. То есть
 * если карта снова станет статическим импортом, все маршруты с картой
 * потяжелеют на 50 KiB и всё равно пролезут под бюджет — регрессия пройдёт
 * незамеченной. Поэтому проверяем не только вес, но и сам факт: попала ли
 * библиотека в граф первой загрузки хоть одного маршрута.
 *
 * Маркеры — строковые литералы, которые переживают минификацию (имена
 * идентификаторов она переписывает, строки в разборе типов геометрии — нет).
 * Требуем совпадения ВСЕХ маркеров сразу, чтобы случайное употребление одного
 * слова в другом коде не давало ложную тревогу.
 */
export const LAZY_ONLY_LIBRARIES = [
  {
    name: "d3-geo + topojson-client (карта регионов)",
    markers: ["MultiPolygon", "GeometryCollection"],
  },
];

/**
 * @param {Array<{route: string, firstLoadChunkPaths: string[]}>} routes
 * @param {Map<string, string>} chunkContents — содержимое чанков первой загрузки
 * @returns {string[]} нарушения
 */
export function evaluateLazyOnlyLibraries(routes, chunkContents) {
  const violations = [];

  for (const library of LAZY_ONLY_LIBRARIES) {
    const offenders = new Map();

    for (const route of routes) {
      for (const path of route.firstLoadChunkPaths) {
        const contents = chunkContents.get(path);
        if (
          contents !== undefined &&
          library.markers.every((marker) => contents.includes(marker))
        ) {
          offenders.set(route.route, path);
        }
      }
    }

    if (offenders.size > 0) {
      const [route, path] = [...offenders.entries()][0];
      violations.push(
        `lazyOnly:${library.name}: попала в первую загрузку ${offenders.size} маршрут(ов), например ${route} через ${path}`,
      );
    }
  }

  return violations;
}

export function evaluateFrontendBundle(routes, chunks) {
  const largestRoute = routes.toSorted(
    (left, right) =>
      right.firstLoadUncompressedJsBytes - left.firstLoadUncompressedJsBytes,
  )[0];
  const largestChunk = chunks.toSorted(
    (left, right) => right.bytes - left.bytes,
  )[0];
  const metrics = {
    largestRouteBytes: largestRoute?.firstLoadUncompressedJsBytes ?? 0,
    largestChunkBytes: largestChunk?.bytes ?? 0,
    totalChunkBytes: chunks.reduce((total, chunk) => total + chunk.bytes, 0),
  };
  const violations = Object.entries(FRONTEND_BUNDLE_BUDGETS)
    .filter(([metric, budget]) => metrics[metric] > budget)
    .map(
      ([metric, budget]) =>
        `${metric}: ${metrics[metric]} bytes exceeds ${budget} bytes`,
    );

  return {
    budgets: FRONTEND_BUNDLE_BUDGETS,
    metrics,
    violations,
    largest: {
      route: largestRoute ?? null,
      chunk: largestChunk ?? null,
    },
  };
}

async function createFrontendBundleReport(root) {
  const diagnosticsPath = join(
    root,
    ".next/diagnostics/route-bundle-stats.json",
  );
  const routes = JSON.parse(await readFile(diagnosticsPath, "utf8"));
  const chunkPaths = [
    ...new Set(routes.flatMap((route) => route.firstLoadChunkPaths)),
  ];
  const chunkContents = new Map();
  const chunks = await Promise.all(
    chunkPaths.map(async (path) => {
      const absolutePath = join(root, path);
      const contents = await readFile(absolutePath);
      const details = await stat(absolutePath);

      chunkContents.set(path, contents.toString("utf8"));

      return {
        path,
        bytes: details.size,
        gzipBytes: gzipSync(contents).byteLength,
      };
    }),
  );
  const budgets = evaluateFrontendBundle(routes, chunks);

  return {
    generatedAt: new Date().toISOString(),
    routes: routes.toSorted(
      (left, right) =>
        right.firstLoadUncompressedJsBytes -
        left.firstLoadUncompressedJsBytes,
    ),
    chunks: chunks.toSorted((left, right) => right.bytes - left.bytes),
    ...budgets,
    violations: [
      ...budgets.violations,
      ...evaluateLazyOnlyLibraries(routes, chunkContents),
    ],
  };
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

function markdown(report) {
  const routeRows = report.routes
    .slice(0, 15)
    .map(
      (route) =>
        `| \`${route.route}\` | ${formatBytes(route.firstLoadUncompressedJsBytes)} | ${route.firstLoadChunkPaths.length} |`,
    )
    .join("\n");
  const chunkRows = report.chunks
    .slice(0, 15)
    .map(
      (chunk) =>
        `| \`${chunk.path}\` | ${formatBytes(chunk.bytes)} | ${formatBytes(chunk.gzipBytes)} |`,
    )
    .join("\n");

  return `# Frontend bundle report

Generated: ${report.generatedAt}

| Budget | Current | Limit |
| --- | ---: | ---: |
| Largest route first-load JS | ${formatBytes(report.metrics.largestRouteBytes)} | ${formatBytes(report.budgets.largestRouteBytes)} |
| Largest client chunk | ${formatBytes(report.metrics.largestChunkBytes)} | ${formatBytes(report.budgets.largestChunkBytes)} |
| Total route client chunks | ${formatBytes(report.metrics.totalChunkBytes)} | ${formatBytes(report.budgets.totalChunkBytes)} |

## Largest routes

| Route | First-load JS | Chunks |
| --- | ---: | ---: |
${routeRows}

## Largest chunks

| Chunk | Raw | Gzip |
| --- | ---: | ---: |
${chunkRows}
`;
}

async function main() {
  const currentFile = fileURLToPath(import.meta.url);
  const root = resolve(dirname(currentFile), "..");
  const report = await createFrontendBundleReport(root);
  const outputDirectory = join(root, "bundle-reports");

  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(
      join(outputDirectory, "frontend.json"),
      `${JSON.stringify(report, null, 2)}\n`,
    ),
    writeFile(join(outputDirectory, "frontend.md"), markdown(report)),
  ]);

  console.log(
    `Frontend bundle: largest route ${formatBytes(report.metrics.largestRouteBytes)}, largest chunk ${formatBytes(report.metrics.largestChunkBytes)}, total chunks ${formatBytes(report.metrics.totalChunkBytes)}.`,
  );

  if (report.violations.length > 0) {
    throw new Error(
      `Frontend bundle budgets failed:\n${report.violations.join("\n")}`,
    );
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
