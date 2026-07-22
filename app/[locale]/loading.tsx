import type { CSSProperties } from "react";

// Скелет-заглушка, показываемый Suspense-границей во время навигации между
// сегментами. Ширина повторяет <main> из PageShell, чтобы блоки не «прыгали»
// при появлении реального контента. Текст не нужен — блок помечен aria-hidden.
const block = (style: CSSProperties): CSSProperties => ({
  background: "color-mix(in srgb, var(--color-text) 10%, transparent)",
  borderRadius: "var(--radius-md)",
  ...style,
});

export default function Loading() {
  return (
    <div
      aria-hidden
      className="mx-auto w-full max-w-[1160px] px-6 pt-9 max-[920px]:px-4 animate-pulse"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div style={block({ height: 44, width: "45%" })} />
        <div style={block({ height: 18, width: "80%" })} />
        <div style={block({ height: 18, width: "68%" })} />
        <div style={block({ height: 260, width: "100%", marginTop: "var(--space-4)" })} />
        <div style={block({ height: 18, width: "90%", marginTop: "var(--space-4)" })} />
        <div style={block({ height: 18, width: "75%" })} />
        <div style={block({ height: 18, width: "82%" })} />
      </div>
    </div>
  );
}
