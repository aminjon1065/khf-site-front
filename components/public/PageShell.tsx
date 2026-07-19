import type { CSSProperties, ReactNode } from "react";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import type { NavKey } from "@/lib/routes";

/**
 * Каркас публичной страницы: обёртка с фоном/цветом → шапка → (опц.) полоса над
 * контентом (статусные баннеры Home) → <main id="main"> → подвал.
 */
export default function PageShell({
  active = "",
  topSlot,
  children,
  mainClassName = "mx-auto w-full max-w-[1160px] px-6 pt-9 max-[920px]:px-4",
  mainStyle,
}: {
  active?: NavKey;
  topSlot?: ReactNode;
  children: ReactNode;
  mainClassName?: string;
  mainStyle?: CSSProperties;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        color: "var(--color-text)",
        fontFamily: "var(--font-body)",
      }}
    >
      <PublicHeader active={active} />
      {topSlot}
      <main id="main" className={mainClassName} style={mainStyle}>
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
