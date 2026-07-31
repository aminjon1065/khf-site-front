import type { Metadata } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import "../globals.css";
import { LOCALES, isLocale, htmlLang } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata, siteUrl } from "@/lib/seo";
import { cmsDiagnosticEnabled } from "@/lib/cms-readiness.mjs";
import { WebVitalsReporter } from "@/components/public/WebVitalsReporter";
import NavigationProgress from "@/components/public/NavigationProgress";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { OrganizationJsonLd } from "@/components/public/JsonLd";
import { fetchMenu, fetchSettings } from "@/lib/api";

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
  // Оболочка (шапка, подвал, их данные из CMS) живёт в layout, а не в странице:
  // так она переживает переход между маршрутами — не размонтируется, не
  // перезапрашивает /settings и /menu при каждом переходе.
  const [settings, menu] = await Promise.all([
    fetchSettings(locale),
    fetchMenu(locale),
  ]);
  // `fetchSettings` возвращает null только когда CMS не ответила (сетевая
  // ошибка или не-2xx) — это и есть признак резервного режима: страница
  // показывает пустые списки вместо данных.
  const degraded = settings === null;

  return (
    <html
      lang={htmlLang(locale)}
      suppressHydrationWarning
      className={`${sans.variable} ${condensed.variable}`}
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <WebVitalsReporter />
        {/* useSearchParams внутри требует Suspense-границы при статическом
            пре-рендере, иначе весь маршрут уходит в динамический рендер. */}
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <a href="#main" className="skip-link">
          {common.skipToContent}
        </a>
        {cmsDiagnosticEnabled(process.env, { degraded }) && (
          <aside
            aria-live="polite"
            className="border-b border-[var(--hz-warning)] bg-[var(--hz-warning-bg)] px-4 py-2 text-center text-sm font-semibold text-[var(--color-text)]"
            data-testid="cms-diagnostic-banner"
            role="status"
          >
            {degraded
              ? "CMS недоступна: показан резервный контент, данные могут быть неполными."
              : "Сборка режима preview: проверка готовности CMS пропущена, в артефакте допускается резервный контент — в production не выкладывать."}
          </aside>
        )}
        <div
          style={{
            minHeight: "100vh",
            background: "var(--color-bg)",
            color: "var(--color-text)",
            fontFamily: "var(--font-body)",
          }}
        >
          <OrganizationJsonLd settings={settings} locale={locale} />
          <PublicHeader
            trustPhone={settings?.org.trust_phone}
            locale={locale}
            copy={common}
            mainMenu={menu.main}
          />
          <main id="main">{children}</main>
          <PublicFooter
            settings={settings}
            footerMenu={menu.footer}
            copy={common}
          />
        </div>
      </body>
    </html>
  );
}
