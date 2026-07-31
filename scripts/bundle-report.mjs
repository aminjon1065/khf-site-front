import { gzipSync } from "node:zlib";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const FRONTEND_BUNDLE_BUDGETS = {
  largestRouteBytes: 620 * 1024,
  largestChunkBytes: 250 * 1024,
  totalChunkBytes: 1024 * 1024,
};

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
  const chunks = await Promise.all(
    chunkPaths.map(async (path) => {
      const absolutePath = join(root, path);
      const contents = await readFile(absolutePath);
      const details = await stat(absolutePath);

      return {
        path,
        bytes: details.size,
        gzipBytes: gzipSync(contents).byteLength,
      };
    }),
  );

  return {
    generatedAt: new Date().toISOString(),
    routes: routes.toSorted(
      (left, right) =>
        right.firstLoadUncompressedJsBytes -
        left.firstLoadUncompressedJsBytes,
    ),
    chunks: chunks.toSorted((left, right) => right.bytes - left.bytes),
    ...evaluateFrontendBundle(routes, chunks),
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
