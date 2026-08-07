#!/usr/bin/env node
// Запуск `next build` с доверием к локальному CA.
//
// Зачем: та же проблема, что и в `dev.mjs`, но проявляется раньше и жёстче.
// Перед компиляцией `next.config.ts` дёргает GET {API_URL}/ready, и если CMS
// отдаётся по https на домене `.test` с сертификатом mkcert, Node этому
// сертификату не доверяет. Сборка падает не «пустыми страницами», а сразу —
// `CmsReadinessError: unavailable` с причиной `UNABLE_TO_VERIFY_LEAF_SIGNATURE`,
// то есть выглядит как «CMS недоступна», хотя curl её открывает.
//
// Логика подключения CA переиспользуется из `dev.mjs` целиком: там она уже
// кроссплатформенная (важно для PowerShell на рабочем ПК) и молча выключается
// там, где mkcert не нужен — на http-доступе к CMS, в CI и на боевом домене
// с настоящим сертификатом.

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { devEnv } from "./dev.mjs";

function main() {
  const env = devEnv(process.env);

  if (env.NODE_EXTRA_CA_CERTS && !process.env.NODE_EXTRA_CA_CERTS) {
    console.log(`[build] локальный CA mkcert подключён: ${env.NODE_EXTRA_CA_CERTS}`);
  }

  const require = createRequire(import.meta.url);
  const nextBin = require.resolve("next/dist/bin/next");

  const child = spawn(
    process.execPath,
    [nextBin, "build", ...process.argv.slice(2)],
    { env, stdio: "inherit" },
  );

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);

      return;
    }

    process.exit(code ?? 0);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
