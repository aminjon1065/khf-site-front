import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { common } from "@/lib/copy/common";

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

export const metadata: Metadata = {
  title: {
    default: common.siteName,
    template: `%s — ${common.siteShort}`,
  },
  description: common.siteDescription,
};

// Применяем сохранённую тему до первой отрисовки — без вспышки светлой темы.
const themeInit = `try{if(localStorage.getItem('kchs-theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
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
