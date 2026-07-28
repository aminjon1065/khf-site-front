import type { Metadata } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import "../globals.css";
import { LOCALES, isLocale, htmlLang } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata, siteUrl } from "@/lib/seo";
import { cmsDiagnosticEnabled } from "@/lib/cms-readiness.mjs";
import { WebVitalsReporter } from "@/components/public/WebVitalsReporter";

// Локальные subsets сохраняют Fira Sans для латиницы и расширенной кириллицы
// (включая таджикские ҳ ҷ ӣ ӯ қ ғ), но сокращают критический путь до двух WOFF2.
const sans = localFont({
  src: "../fonts/fira-sans-critical.woff2",
  variable: "--font-sans",
  weight: "400",
  display: "swap",
  preload: true,
});

const condensed = localFont({
  src: "../fonts/fira-sans-condensed-critical.woff2",
  variable: "--font-condensed",
  weight: "600",
  display: "swap",
  preload: true,
});

// Статически генерируем по одной ветке на каждый язык (/ru, /tj, /en).
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }
  const { common } = getDictionary(locale);
  // База метаданных + дефолты для главной ("/"): canonical/hreflang/OG/Twitter.
  // Дочерние страницы переопределяют их своим buildMetadata с нужным path.
  const meta = buildMetadata({
    locale,
    title: common.siteName,
    description: common.siteDescription,
    path: "/",
    siteName: common.siteShort,
    type: "website",
  });
  return {
    ...meta,
    metadataBase: new URL(siteUrl()),
    title: {
      default: common.siteName,
      template: `%s — ${common.siteShort}`,
    },
  };
}

// Применяем сохранённую тему до первой отрисовки — без вспышки светлой темы.
const themeInit = `try{if(localStorage.getItem('kchs-theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}`;

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const { common } = getDictionary(locale);

  return (
    <html
      lang={htmlLang(locale)}
      suppressHydrationWarning
      className={`${sans.variable} ${condensed.variable}`}
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <WebVitalsReporter />
        <a href="#main" className="skip-link">
          {common.skipToContent}
        </a>
        {cmsDiagnosticEnabled() && (
          <aside
            aria-live="polite"
            className="border-b border-[var(--hz-warning)] bg-[var(--hz-warning-bg)] px-4 py-2 text-center text-sm font-semibold text-[var(--color-text)]"
            data-testid="cms-diagnostic-banner"
            role="status"
          >
            CMS diagnostic mode: fallback content is allowed; this build must not be
            promoted to production.
          </aside>
        )}
        {children}
      </body>
    </html>
  );
}
