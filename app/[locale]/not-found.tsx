"use client";

import { usePathname } from "next/navigation";
import LocaleLink from "@/components/i18n/LocaleLink";
import { localeFromPathname } from "@/lib/i18n/config";
import { getUiStrings } from "@/lib/i18n/ui-strings";

// Граница not-found локализованного сегмента (рендерится внутри
// app/[locale]/layout.tsx — <html>/<body> уже есть). Клиентский компонент:
// локаль берём из URL (usePathname). Из-за динамического корневого сегмента
// [locale] Next может пре-рендерить эту границу с дефолтной локалью — для
// редких несуществующих путей это допустимо (страница noindex).
export default function NotFound() {
  const t = getUiStrings(localeFromPathname(usePathname())).notFound;

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "14px",
        padding: "48px 16px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: 72,
          lineHeight: 1,
          fontWeight: 700,
          margin: 0,
          color: "var(--color-accent-700)",
        }}
      >
        404
      </p>
      <h1 style={{ margin: 0 }}>{t.title}</h1>
      <p style={{ maxWidth: "42ch", margin: 0, color: "var(--color-text)" }}>
        {t.text}
      </p>
      <LocaleLink href="/" className="btn btn-primary">
        {t.back}
      </LocaleLink>
    </div>
  );
}
