#!/usr/bin/env node
// Запуск `next start` с доверием к локальному CA — тем же, что подключают
// `npm run dev` и `npm run build`.
//
// Зачем отдельный скрипт: `next start` рендерит динамические маршруты
// (`/[locale]/news`, `/search`, …) в момент запроса, то есть ходит в CMS из
// того же Node-процесса. Без NODE_EXTRA_CA_CERTS его `fetch` к локальной CMS
// по https падает на самоподписанном сертификате Laragon/mkcert — и страницы
// отдают состояние «данные временно недоступны», хотя CMS работает и `curl`
// её видит. Сборка при этом проходит успешно (у неё CA подключён), поэтому
// расхождение выглядит необъяснимым: собралось — не показывается.
//
// В CI и на боевом домене переменная не появляется: локального CA там нет,
// а настоящему сертификату Node доверяет и так (см. devEnv).

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { devEnv } from "./dev.mjs";

function main() {
  const env = devEnv(process.env);

  if (env.NODE_EXTRA_CA_CERTS && !process.env.NODE_EXTRA_CA_CERTS) {
    console.log(`[start] локальный CA подключён: ${env.NODE_EXTRA_CA_CERTS}`);
  }

  const require = createRequire(import.meta.url);
  const nextBin = require.resolve("next/dist/bin/next");

  const child = spawn(
    process.execPath,
    [nextBin, "start", ...process.argv.slice(2)],
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
