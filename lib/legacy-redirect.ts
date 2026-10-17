// Старые адреса прежних сайтов Комитета (Drupal) → страница материала сейчас.
//
// khf.tj (таджикский) открывал материалы по /node/6112, kchs.tj (русский) —
// по такому же /node/…; когда kchs.tj переадресует на новый сайт, адрес
// приходит с префиксом /ru (Caddyfile стека). Номера узлов двух сайтов
// пересекаются, поэтому CMS ищет по хосту и пути: khf.tj/node/6112.

/** Хосты прежних сайтов — исторический факт, а не настройка. */
const TAJIK_SITE = "khf.tj";
const RUSSIAN_SITE = "kchs.tj";

const LEGACY_PATH = /^(?:\/(ru))?\/((?:node|taxonomy\/term)\/\d+)\/?$/;

/** Ждать CMS дольше нельзя: человек открыл ссылку и ждёт страницу. */
const TIMEOUT_MS = 2_000;
const HIT_TTL_MS = 10 * 60_000;
const MISS_TTL_MS = 60_000;
const MAX_CACHED = 2000;

/**
 * Адрес прежнего сайта (`khf.tj/node/6112`) по пути запроса или null, если
 * путь — не старый адрес.
 */
export function legacySource(pathname: string): string | null {
  const match = LEGACY_PATH.exec(pathname);
  if (!match) {
    return null;
  }
  const [, russian, rest] = match;
  return `${russian ? RUSSIAN_SITE : TAJIK_SITE}/${rest}`;
}

const cache = new Map<string, { path: string | null; until: number }>();

function remember(source: string, path: string | null): void {
  if (cache.size >= MAX_CACHED) {
    // Map хранит порядок вставки: первым уходит самый старый ответ.
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) {
      cache.delete(oldest);
    }
  }
  cache.set(source, {
    path,
    until: Date.now() + (path ? HIT_TTL_MS : MISS_TTL_MS),
  });
}

/**
 * Путь на сайте (`/tj/news/…`), куда теперь ведёт старый адрес, или null:
 * адрес неизвестен, материал снят или CMS не ответила вовремя — тогда сайт
 * ведёт себя как раньше (страница «не найдено» на языке посетителя).
 */
export async function resolveLegacyPath(source: string): Promise<string | null> {
  const cached = cache.get(source);
  if (cached && cached.until > Date.now()) {
    return cached.path;
  }

  const base =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8848/api/v1";
  const headers: Record<string, string> = { Accept: "application/json" };
  if (process.env.SITE_API_KEY) {
    headers["X-Site-Key"] = process.env.SITE_API_KEY;
  }

  try {
    const response = await fetch(
      `${base}/redirects/legacy?source=${encodeURIComponent(source)}`,
      { headers, signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" },
    );
    if (response.status === 404) {
      remember(source, null);
      return null;
    }
    if (!response.ok) {
      // Сбой CMS не запоминаем: через минуту адрес должен заработать сам.
      return null;
    }
    const body = (await response.json()) as { data?: { path?: unknown } };
    const path = body.data?.path;
    // Только путь своего сайта: ответ CMS не должен увести посетителя на
    // чужой домен (`//evil.example`).
    const safe = typeof path === "string" && /^\/(?!\/)/.test(path) ? path : null;
    remember(source, safe);
    return safe;
  } catch {
    return null;
  }
}

/** Только для тестов. */
export function resetLegacyRedirectCache(): void {
  cache.clear();
}
