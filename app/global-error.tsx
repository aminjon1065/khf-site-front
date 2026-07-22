"use client";

import { useEffect } from "react";

// Граница ошибок верхнего уровня: срабатывает, когда падает сам корневой макет
// (app/[locale]/layout.tsx), поэтому обязана рендерить собственные <html>/<body>
// и не может опираться на globals.css, шрифты или локаль. Ошибки здесь редки и
// возникают до того, как известен язык — поэтому минимальный английский текст.
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 16,
          padding: 24,
          fontFamily: "system-ui, sans-serif",
          background: "#f2f2f3",
          color: "#1d1f20",
        }}
      >
        <title>Something went wrong</title>
        <h1 style={{ margin: 0, fontSize: 28 }}>Something went wrong</h1>
        <p style={{ margin: 0, maxWidth: "42ch", opacity: 0.7 }}>
          An unexpected error occurred. Please reload the page.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            cursor: "pointer",
            fontSize: 14,
            padding: "8px 16px",
            border: "1px solid #416180",
            background: "#5980a6",
            color: "#f2f2f3",
          }}
        >
          Reload page
        </button>
      </body>
    </html>
  );
}
