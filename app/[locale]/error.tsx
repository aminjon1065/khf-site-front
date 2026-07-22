"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { localeFromPathname } from "@/lib/i18n/config";
import { getUiStrings } from "@/lib/i18n/ui-strings";

// Граница ошибок локализованного сегмента. Рендерится внутри
// app/[locale]/layout.tsx (<html>/<body> уже на месте). Границы ошибок обязаны
// быть клиентскими, поэтому строки берём из client-safe ui-strings.ts.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Отправка в сервис логирования ошибок (пока — консоль).
    console.error(error);
  }, [error]);

  const t = getUiStrings(localeFromPathname(usePathname())).errorPage;

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "var(--space-4)",
        padding: "var(--space-8) var(--space-4)",
      }}
    >
      <h1 style={{ margin: 0 }}>{t.title}</h1>
      <p className="text-muted" style={{ maxWidth: "42ch", margin: 0 }}>
        {t.text}
      </p>
      <button type="button" className="btn btn-primary" onClick={() => reset()}>
        {t.retry}
      </button>
    </div>
  );
}
