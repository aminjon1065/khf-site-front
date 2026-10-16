"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { ViewType } from "@/lib/page-views";

/**
 * Отметка «страницу материала открыли» для собственной статистики CMS. Один
 * раз за сеанс вкладки: перезагрузка и возврат назад не множат просмотры.
 * Ничего о читателе — только тип, адрес и язык страницы.
 */
export default function ViewBeacon({
  type,
  slug,
  locale,
}: {
  type: ViewType;
  slug: string;
  locale: Locale;
}) {
  useEffect(() => {
    const key = `viewed:${type}:${slug}:${locale}`;

    try {
      if (sessionStorage.getItem(key)) {
        return;
      }
      sessionStorage.setItem(key, "1");
    } catch {
      // Хранилище недоступно (приватный режим) — считаем, как есть.
    }

    const body = JSON.stringify({ type, slug, locale });
    const sent =
      typeof navigator.sendBeacon === "function" &&
      navigator.sendBeacon(
        "/api/views",
        new Blob([body], { type: "application/json" }),
      );

    if (!sent) {
      void fetch("/api/views", {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        credentials: "omit",
      }).catch(() => undefined);
    }
  }, [type, slug, locale]);

  return null;
}
