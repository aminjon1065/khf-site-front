import type { CSSProperties, ReactNode } from "react";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { fetchMenu, fetchSettings } from "@/lib/api";
import type { NavKey } from "@/lib/routes";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

/**
 * Каркас публичной страницы: обёртка с фоном/цветом → шапка → (опц.) полоса над
 * контентом (статусные баннеры Home) → <main id="main"> → подвал.
 * Настройки и меню (шапка/подвал) приходят из CMS на активном языке.
 */
export default async function PageShell({
  active = "",
  topSlot,
  children,
  mainClassName = "mx-auto w-full max-w-[1160px] px-6 pt-9 max-[920px]:px-4",
  mainStyle,
  locale,
}: {
  active?: NavKey;
  topSlot?: ReactNode;
  children: ReactNode;
  mainClassName?: string;
  mainStyle?: CSSProperties;
  locale: Locale;
}) {
  const [settings, menu] = await Promise.all([
    fetchSettings(locale),
    fetchMenu(locale),
  ]);
  const { common } = getDictionary(locale);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        color: "var(--color-text)",
        fontFamily: "var(--font-body)",
      }}
    >
      <PublicHeader
        active={active}
        trustPhone={settings?.org.trust_phone}
        locale={locale}
        copy={common}
      />
      {topSlot}
      <main id="main" className={mainClassName} style={mainStyle}>
        {children}
      </main>
      <PublicFooter settings={settings} footerMenu={menu.footer} copy={common} />
    </div>
  );
}
