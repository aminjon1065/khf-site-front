import "./globals.css";
import { cookies, headers } from "next/headers";
import localFont from "next/font/local";
import {
  LOCALE_COOKIE,
  PATHNAME_HEADER,
  htmlLang,
  isLocale,
  localeFromPathname,
  type Locale,
} from "@/lib/i18n/config";
import { getUiStrings } from "@/lib/i18n/ui-strings";

// Глобальный 404 для путей, не совпавших ни с одним маршрутом вообще (в т.ч.
// /{locale}/что-то-несуществующее). Next 16 обрабатывает этот файл на уровне
// роутинга, а не как обычную страницу — в отличие от классического
// app/not-found.tsx, который Next статически предрендерит один раз в общий
// `_not-found.html` при сборке (тогда локаль всегда откатывается на дефолтную).
//
// Серверный компонент: путь визита приходит заголовком `x-kchs-pathname`,
// который выставляет proxy.ts, поэтому язык страницы верен уже в исходном
// HTML. Раньше здесь стоял клиентский usePathname(), и первый байт ответа
// всегда был русским — тому, кто пришёл на /tj/…, правильный язык дорисовывала
// только гидратация, а краулер и читатель без JS видели не тот язык (см.
// PROGRESS.md, запись B-5).
//
// Обязателен полный документ (<html>/<body>) и собственный импорт шрифтов —
// этот файл рендерится в обход layout.tsx.
const sans = localFont({
  src: "./fonts/fira-sans-critical.woff2",
  variable: "--font-sans",
  weight: "400",
  display: "swap",
});
const condensed = localFont({
  src: "./fonts/fira-sans-condensed-critical.woff2",
  variable: "--font-condensed",
  weight: "600",
  display: "swap",
});

/**
 * Язык страницы 404. Основной источник — путь запроса от proxy.ts. Прокси не
 * работает на путях, которые сам же исключает (`/_next`, `/api`, файлы с
 * расширением), — там остаётся сохранённый выбор языка из cookie, и только
 * если нет и его, страница уходит на канонический русский.
 */
async function requestLocale(): Promise<Locale> {
  const pathname = (await headers()).get(PATHNAME_HEADER);

  if (pathname) {
    return localeFromPathname(pathname);
  }

  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;

  return isLocale(cookieLocale) ? cookieLocale : localeFromPathname("/");
}

export default async function GlobalNotFound() {
  const locale = await requestLocale();
  const t = getUiStrings(locale).notFound;

  return (
    <html
      lang={htmlLang(locale)}
      className={`${sans.variable} ${condensed.variable}`}
    >
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
          <a href={`/${locale}`} className="btn btn-primary">
            {t.back}
          </a>
        </div>
      </body>
    </html>
  );
}
