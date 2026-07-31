#!/usr/bin/env node
// Запуск `next dev` с доверием к локальному CA.
//
// Зачем: в dev-среде на macOS (lerd/Herd) CMS отдаётся по https на домене
// `.test` с сертификатом mkcert. Браузер ему доверяет — системное хранилище
// содержит корневой сертификат mkcert, — а Node НЕТ: у него собственный
// вшитый набор CA. Поэтому серверные `fetch` из Server Components падают с
// `UNABLE_TO_VERIFY_LEAF_SIGNATURE`, страницы отдаются пустыми (мягкая
// деградация), и выглядит это как «CMS не отвечает», хотя curl работает.
//
// Раньше это лечила шелл-подстановка прямо в npm-скрипте
// (`NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/rootCA.pem" next dev`), но она не
// работает в PowerShell на рабочем ПК. Здесь та же логика, но кроссплатформенно
// и молча выключается там, где mkcert не нужен (http-доступ к CMS на Windows,
// CI, боевой домен с настоящим сертификатом).

import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Путь к корневому сертификату mkcert, если он установлен.
 * Вынесено параметром ради тестируемости: в тесте подменяется заглушкой.
 */
export function mkcertRootCa({ run = spawnSync, exists = existsSync } = {}) {
  try {
    const result = run("mkcert", ["-CAROOT"], { encoding: "utf8" });

    if (result?.status !== 0 || typeof result.stdout !== "string") {
      return null;
    }

    const caRoot = result.stdout.trim();

    if (caRoot === "") {
      return null;
    }

    const pem = join(caRoot, "rootCA.pem");

    return exists(pem) ? pem : null;
  } catch {
    // mkcert не установлен — это нормально, просто идём дальше.
    return null;
  }
}

/**
 * Окружение для дочернего процесса: добавляем NODE_EXTRA_CA_CERTS, только если
 * его не задали снаружи и локальный CA действительно есть.
 */
export function devEnv(baseEnv, lookup = mkcertRootCa) {
  if (baseEnv.NODE_EXTRA_CA_CERTS) {
    return { ...baseEnv };
  }

  const rootCa = lookup();

  return rootCa ? { ...baseEnv, NODE_EXTRA_CA_CERTS: rootCa } : { ...baseEnv };
}

function main() {
  const env = devEnv(process.env);

  if (env.NODE_EXTRA_CA_CERTS && !process.env.NODE_EXTRA_CA_CERTS) {
    console.log(`[dev] локальный CA mkcert подключён: ${env.NODE_EXTRA_CA_CERTS}`);
  }

  const require = createRequire(import.meta.url);
  const nextBin = require.resolve("next/dist/bin/next");

  const child = spawn(
    process.execPath,
    [nextBin, "dev", ...process.argv.slice(2)],
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
