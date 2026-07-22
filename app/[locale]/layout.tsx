import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { LOCALES, isLocale, htmlLang } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

// Barlow / Barlow Condensed покрывают латиницу; кириллица (основной язык
// портала) отрисовывается системным шрифтом через fallback в font-family —
// так же, как в дизайн-референсах.
const barlow = Barlow({
  variable: "--font-barlow",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  weight: ["400", "600"],
  subsets: ["latin"],
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
  return {
    title: {
      default: common.siteName,
      template: `%s — ${common.siteShort}`,
    },
    description: common.siteDescription,
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
      className={`${barlow.variable} ${barlowCondensed.variable}`}
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
