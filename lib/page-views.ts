import type { Locale } from "@/lib/i18n/config";

/**
 * Собственный учёт просмотров (решение владельца, 2026-10-16: статистика без
 * Google Analytics). Браузер отмечает страницу материала один раз за сеанс,
 * сервер сайта копит отметки и раз в полминуты отправляет в CMS одной пачкой:
 * при всплеске читателей во время ЧС это один запрос в полминуты, а не запрос
 * на каждого читателя. О читателе не передаётся ничего — только тип, адрес и
 * язык страницы.
 */

export const VIEW_TYPES = [
  "news",
  "alert",
  "instruction",
  "project",
  "announcement",
  "page",
] as const;

export type ViewType = (typeof VIEW_TYPES)[number];

export interface PageView {
  type: ViewType;
  slug: string;
  locale: Locale;
}

export interface PageViewCount extends PageView {
  count: number;
}

const LOCALES = new Set(["ru", "tj", "en"]);
const SLUG = /^[\p{L}\p{N}_-]{1,180}$/u;

export function isPageView(value: unknown): value is PageView {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const view = value as Record<string, unknown>;

  return (
    typeof view.type === "string" &&
    (VIEW_TYPES as readonly string[]).includes(view.type) &&
    typeof view.slug === "string" &&
    SLUG.test(view.slug) &&
    typeof view.locale === "string" &&
    LOCALES.has(view.locale)
  );
}

/**
 * Поисковые роботы и проверки доступности в статистику читателей не входят.
 * Превью ссылок в мессенджерах JavaScript не исполняют и сюда не доходят.
 */
const BOT = /bot|crawl|spider|slurp|preview|monitor|lighthouse|pingdom|uptime/i;

export function isBot(userAgent: string | null): boolean {
  return userAgent === null || userAgent.trim() === "" || BOT.test(userAgent);
}

export interface ViewBufferOptions {
  send: (views: PageViewCount[]) => Promise<void>;
  /** Через сколько после первой отметки отправлять пачку. */
  flushAfterMs?: number;
  /** Столько разных страниц — и пачка уходит сразу. */
  maxBatch?: number;
  /**
   * Потолок неотправленного, пока CMS недоступна: дальше новые страницы
   * отбрасываются, чтобы память сервера сайта не росла без предела.
   */
  maxPending?: number;
  schedule?: (callback: () => void, ms: number) => unknown;
}

export interface ViewBuffer {
  add(view: PageView): void;
  flush(): Promise<void>;
  /** Сколько разных страниц ждут отправки (для тестов). */
  size(): number;
}

export function createViewBuffer({
  send,
  flushAfterMs = 30_000,
  maxBatch = 500,
  maxPending = 5_000,
  schedule = (callback, ms) => {
    const timer = setTimeout(callback, ms);
    // Таймер не должен держать процесс при остановке сервера.
    (timer as { unref?: () => void }).unref?.();
    return timer;
  },
}: ViewBufferOptions): ViewBuffer {
  const pending = new Map<string, PageViewCount>();
  let scheduled = false;

  const merge = (view: PageView, count: number): void => {
    const key = `${view.type}|${view.slug}|${view.locale}`;
    const known = pending.get(key);

    if (known) {
      known.count += count;
    } else if (pending.size < maxPending) {
      pending.set(key, { ...view, count });
    }
  };

  const flush = async (): Promise<void> => {
    scheduled = false;
    if (pending.size === 0) {
      return;
    }

    const batch = [...pending.values()].slice(0, maxBatch);
    for (const view of batch) {
      pending.delete(`${view.type}|${view.slug}|${view.locale}`);
    }

    try {
      await send(batch);
    } catch (error) {
      // CMS недоступна — вернуть отметки и попробовать в следующий раз.
      for (const view of batch) {
        merge(view, view.count);
      }
      throw error;
    } finally {
      if (pending.size > 0 && !scheduled) {
        scheduled = true;
        schedule(() => void flush().catch(() => undefined), flushAfterMs);
      }
    }
  };

  return {
    add(view) {
      merge(view, 1);

      if (pending.size >= maxBatch) {
        void flush().catch(() => undefined);
      } else if (!scheduled) {
        scheduled = true;
        schedule(() => void flush().catch(() => undefined), flushAfterMs);
      }
    },
    flush,
    size: () => pending.size,
  };
}
