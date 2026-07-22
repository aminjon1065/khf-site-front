import "./globals.css";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { getUiStrings } from "@/lib/i18n/ui-strings";

// Корневой not-found: ловит нелокализованные 404 (пути вне сегмента [locale]).
// Корневой макет живёт в app/[locale]/layout.tsx, поэтому здесь нет родительского
// <html>/<body> — рендерим документ сами. Обычно сюда почти не попадают: proxy.ts
// уводит любой путь без префикса на /{locale}. Тексты — на каноничном РУ, ссылка
// ведёт на /ru.
export default function RootNotFound() {
  const t = getUiStrings(DEFAULT_LOCALE).notFound;

  return (
    <html lang="ru">
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
          <a href={`/${DEFAULT_LOCALE}`} className="btn btn-primary">
            {t.back}
          </a>
        </div>
      </body>
    </html>
  );
}
