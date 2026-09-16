import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.{ts,mjs}"],
    restoreMocks: true,
    server: {
      deps: {
        // CLI-скрипты (`scripts/*.mjs`) начинаются с shebang — это валидный
        // модуль для Node, но не для оболочки, в которой Vitest выполняет
        // инлайненный исходник: `#!/usr/bin/env node` там даёт
        // «SyntaxError: Invalid or unexpected token», и весь файл теста
        // молча не собирается. Отдаём их родному загрузчику Node.
        external: [/[\\/]scripts[\\/][^\\/]+\.mjs$/],
      },
    },
  },
});
