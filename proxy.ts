import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";

// В Next.js 16 middleware переименован в `proxy` (файл proxy.ts в корне).
// Задача: любой публичный путь без префикса локали (`/news`) увести на
// `/{locale}/news`, где locale берётся из cookie выбора языка, затем из
// Accept-Language, иначе — русский.

function pathnameHasLocale(pathname: string): boolean {
  return LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

/** Локаль из cookie NEXT_LOCALE, если она валидна. */
function localeFromCookie(request: NextRequest): Locale | null {
  const value = request.cookies.get(LOCALE_COOKIE)?.value;
  return value && (LOCALES as readonly string[]).includes(value)
    ? (value as Locale)
    : null;
}

/**
 * Локаль из заголовка Accept-Language. Лёгкий разбор без зависимостей: берём
 * языковые теги с их q-весами, сортируем и возвращаем первый поддерживаемый
 * (сравниваем по первичному субтегу: `en-US` → `en`).
 */
function localeFromHeader(request: NextRequest): Locale | null {
  const header = request.headers.get("accept-language");
  if (!header) {
    return null;
  }

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="));
      const weight = q ? Number.parseFloat(q.slice(2)) : 1;
      return { tag: tag.toLowerCase(), weight: Number.isNaN(weight) ? 0 : weight };
    })
    .sort((a, b) => b.weight - a.weight);

  for (const { tag } of ranked) {
    const primary = tag.split("-")[0];
    // Портальный `tj` соответствует стандартному тегу `tg`.
    const candidate = primary === "tg" ? "tj" : primary;
    if ((LOCALES as readonly string[]).includes(candidate)) {
      return candidate as Locale;
    }
  }

  return null;
}

function resolveLocale(request: NextRequest): Locale {
  return localeFromCookie(request) ?? localeFromHeader(request) ?? DEFAULT_LOCALE;
}

const COOKIE_OPTIONS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax",
} as const;

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Путь уже с префиксом локали: пропускаем, но запоминаем текущий язык в cookie,
  // чтобы следующий заход на `/` открыл его же. Так переключатель языка в шапке
  // лишь навигирует, а состояние выбора живёт на сервере (без правки document.cookie).
  if (pathnameHasLocale(pathname)) {
    const current = pathname.split("/")[1] as Locale;
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, current, COOKIE_OPTIONS);
    return response;
  }

  const locale = resolveLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(request.nextUrl);
  response.cookies.set(LOCALE_COOKIE, locale, COOKIE_OPTIONS);
  return response;
}

export const config = {
  // Пропускаем внутренние пути Next, API и файлы с расширением (ассеты).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
