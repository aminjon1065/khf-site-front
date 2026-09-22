"use client";

import { useServerInsertedHTML } from "next/navigation";
import { THEME_INIT } from "@/lib/theme-init";

/**
 * Внедряет блокирующий скрипт инициализации темы в HTML во время SSR
 * через `useServerInsertedHTML`, не помещая сырой тег <script> в дерево
 * клиентских компонентов React 19.
 *
 * Это устраняет ошибку:
 * "Encountered a script tag while rendering React component"
 * при переходе между языками/маршрутами на клиенте и полностью
 * предотвращает мигание светлой темы (FOUC) при первой загрузке.
 */
export default function ThemeScript() {
  useServerInsertedHTML(() => (
    <script
      dangerouslySetInnerHTML={{
        __html: THEME_INIT,
      }}
    />
  ));

  return null;
}
