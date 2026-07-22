import type { Metadata } from "next";
import { Fira_Sans, Fira_Sans_Condensed } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { LOCALES, isLocale, htmlLang } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata, siteUrl } from "@/lib/seo";

// Fira Sans / Fira Sans Condensed покрывают латиницу И кириллицу, включая
// cyrillic-ext (таджикские ҳ ҷ ӣ ӯ қ ғ). Поэтому русский, таджикский и английский
// рендерятся одним шрифтом с единой жирностью — раньше кириллица падала на
// системный шрифт, из-за чего начертание РУ/ТҶ отличалось от EN.
const sans = Fira_Sans({
  variable: "--font-sans",
  weight: ["400", "500", "700"],
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

const condensed = Fira_Sans_Condensed({
  variable: "--font-condensed",
  weight: ["400", "600"],
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
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
        <a href="#main" className="skip-link">
          {common.skipToContent}
        </a>
        {children}
      </body>
    </html>
  );
}
