"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import localFont from "next/font/local";
import { htmlLang, localeFromPathname } from "@/lib/i18n/config";
import { getUiStrings } from "@/lib/i18n/ui-strings";

// Глобальный 404 для путей, не совпавших ни с одним маршрутом вообще (в т.ч.
// /{locale}/что-то-несуществующее). Next 16 обрабатывает этот файл на уровне
// роутинга, а не как обычную страницу — в отличие от классического
// app/not-found.tsx, который Next статически предрендерит один раз в общий
// `_not-found.html` при сборке (тогда usePathname() во время сборки не видит
// реальный путь визита, и локаль всегда откатывается на дефолтную). См.
// PROGRESS.md, запись B-5 — там же почему инлайн-вариант с headers() не
// подходит (прод-500 в projects/[slug], Dynamic server usage при
// статик-рендере) — вместо него берём локаль клиентским usePathname(), как и
// в app/[locale]/not-found.tsx.
//
// Обязателен полный документ (<html>/<body>) и собственный импорт шрифтов —
// этот файл рендерится в обход layout.tsx.
const sans = localFont({
  src: "./fonts/fira-sans-critical.woff2",
  variable: "--font-sans",
  weight: "400",
  display: "swap",
});
const condensed = localFont({
  src: "./fonts/fira-sans-condensed-critical.woff2",
  variable: "--font-condensed",
  weight: "600",
  display: "swap",
});

export default function GlobalNotFound() {
  const locale = localeFromPathname(usePathname());
  const t = getUiStrings(locale).notFound;

  return (
    <html
      lang={htmlLang(locale)}
      className={`${sans.variable} ${condensed.variable}`}
    >
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: "var(--space-4)",
            padding: "var(--space-8) var(--space-4)",
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
          <p className="text-muted" style={{ maxWidth: "42ch", margin: 0 }}>
            {t.text}
          </p>
          <a href={`/${locale}`} className="btn btn-primary">
            {t.back}
          </a>
        </div>
      </body>
    </html>
  );
}
