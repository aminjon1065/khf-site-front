// Запрос к CMS с «последней удачной копией» (ADR-001, 2026-10-16).
//
// Без неё отказ CMS дольше окна ISR (60 с) превращал уже опубликованные
// страницы в заглушки: страница при перепроверке успешно рендерилась с
// «данные недоступны», и именно это попадало в кэш. Замер: через 65 с после
// остановки CMS главная, /alerts и /map показывали «Данные об обстановке
// временно недоступны», новость — «Что-то пошло не так». Для сайта ЧС это
// худший сценарий: CMS ложится под наплывом людей во время ЧС — и в ту же
// минуту с сайта пропадает действующее предупреждение.
//
// Теперь каждый удачный ответ CMS запоминается на диске, а при сбое (сеть,
// таймаут, 5xx, 429) отдаётся последний удачный — с заголовком
// LAST_KNOWN_GOOD_HEADER, чтобы страница могла честно сказать, что сведения
// могли устареть. Время обстановки остаётся тем, что сообщила CMS, — копия не
// выдаёт себя за свежую. 404 копию удаляет: снятый с публикации материал не
// должен вернуться на сайт при следующем сбое.

import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { reportCmsFailure } from "@/lib/cms-error-reporting.mjs";

/** Ответ взят из последней удачной копии; значение — когда она сохранена. */
export const LAST_KNOWN_GOOD_HEADER = "x-khf-last-known-good";

/** Ключ сервера сайта: CMS не применяет к нему лимит запросов по IP. */
export const SITE_KEY_HEADER = "X-Site-Key";

/**
 * Не больше этого числа копий. Адресов у сайта — тысячи, а не миллионы;
 * предел страхует от адресов, которые может придумать посетитель
 * (`?page=999999`), — диск сервера не должен заполниться копиями.
 */
export const MAX_ENTRIES = 5000;

/** Одну копию перезаписываем не чаще раза в окно ISR. */
const WRITE_INTERVAL_MS = 60_000;

interface Entry {
  url: string;
  savedAt: string;
  body: string;
}

/**
 * Каталог копий. Только в production-сборке (и при `next build`: пререндер
 * сразу наполняет копии по всем страницам, и свежий контейнер получает их
 * вместе с образом). В разработке и тестах — выключено, если каталог не задан
 * явно.
 */
function storeDirectory(): string | null {
  if (process.env.CMS_LAST_KNOWN_GOOD_DIR) {
    return process.env.CMS_LAST_KNOWN_GOOD_DIR;
  }
  if (process.env.NODE_ENV !== "production") {
    return null;
  }
  return path.join(
    process.cwd(),
    process.env.NEXT_DIST_DIR || ".next",
    "cache",
    "cms-last-known-good",
  );
}

/**
 * Что запоминать. Поиск и списки с текстом запроса (`q`) — нет: их адреса
 * задаёт посетитель, и копия по каждому запросу была бы способом заполнить
 * диск. Сайт без поиска переживёт сбой, без новостей и обстановки — нет.
 */
function rememberable(url: string): boolean {
  try {
    const { pathname, searchParams } = new URL(url);
    return !pathname.endsWith("/search") && !searchParams.has("q");
  } catch {
    return false;
  }
}

function fileFor(directory: string, url: string): string {
  return path.join(
    directory,
    `${createHash("sha256").update(url).digest("hex")}.json`,
  );
}

const lastWrittenAt = new Map<string, number>();
let entryCount: Promise<number> | null = null;

function countEntries(directory: string): Promise<number> {
  entryCount ??= readdir(directory)
    .then((files) => files.filter((file) => file.endsWith(".json")).length)
    .catch(() => 0);
  return entryCount;
}

async function remember(url: string, body: string): Promise<void> {
  const directory = storeDirectory();
  if (!directory || !rememberable(url)) {
    return;
  }

  const file = fileFor(directory, url);
  const now = Date.now();
  const previous = lastWrittenAt.get(file);
  if (previous !== undefined && now - previous < WRITE_INTERVAL_MS) {
    return;
  }
  if (previous === undefined && (await countEntries(directory)) >= MAX_ENTRIES) {
    return;
  }

  const entry: Entry = { url, savedAt: new Date(now).toISOString(), body };
  try {
    await mkdir(directory, { recursive: true });
    // Атомарно: читатель при параллельном сбое не увидит половину файла.
    const temporary = `${file}.${process.pid}.${now}.tmp`;
    await writeFile(temporary, JSON.stringify(entry));
    await rename(temporary, file);
    if (previous === undefined && entryCount) {
      entryCount = entryCount.then((count) => count + 1);
    }
    lastWrittenAt.set(file, now);
  } catch (error) {
    // Копия — страховка, а не условие работы: сбой записи не должен ронять
    // страницу, которая только что получила настоящий ответ CMS.
    console.error("cms last-known-good: write failed", error);
  }
}

async function forget(url: string): Promise<void> {
  const directory = storeDirectory();
  if (!directory) {
    return;
  }
  const file = fileFor(directory, url);
  lastWrittenAt.delete(file);
  await rm(file, { force: true }).catch(() => {});
}

async function recall(url: string): Promise<Response | null> {
  const directory = storeDirectory();
  if (!directory || !rememberable(url)) {
    return null;
  }
  try {
    const entry = JSON.parse(
      await readFile(fileFor(directory, url), "utf8"),
    ) as Entry;
    if (entry.url !== url) {
      return null;
    }
    return new Response(entry.body, {
      status: 200,
      headers: {
        "content-type": "application/json",
        [LAST_KNOWN_GOOD_HEADER]: entry.savedAt,
      },
    });
  } catch {
    return null;
  }
}

/** Сбой, при котором уместна копия: CMS не ответила или не справилась. */
function isOutage(status: number): boolean {
  return status >= 500 || status === 429;
}

/**
 * `fetch` к CMS для серверного рендера. Добавляет ключ сервера сайта (CMS не
 * считает его запросы лимитом по IP: все они идут с одного адреса), а при
 * сбое CMS возвращает последнюю удачную копию ответа, если она есть. Без
 * копии поведение прежнее: исключение или ответ с ошибкой.
 */
export async function cmsFetch(
  url: string,
  init: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const siteKey = process.env.SITE_API_KEY;
  if (siteKey) {
    headers.set(SITE_KEY_HEADER, siteKey);
  }

  let response: Response;
  try {
    response = await fetch(url, { ...init, headers });
  } catch (error) {
    const copy = await recall(url);
    if (copy) {
      // Сбой всё равно должен остаться в журнале: копия скрывает его от
      // читателя, но не от дежурного.
      reportCmsFailure("cms last-known-good", error);
      return copy;
    }
    throw error;
  }

  if (response.ok) {
    await remember(url, await response.clone().text());
    return response;
  }
  if (response.status === 404 || response.status === 410) {
    await forget(url);
    return response;
  }
  if (isOutage(response.status)) {
    const copy = await recall(url);
    if (copy) {
      reportCmsFailure(
        "cms last-known-good",
        new Error(`API ${response.status}`),
      );
      return copy;
    }
  }
  return response;
}

/** Время сохранения копии, если ответ взят из неё. */
export function lastKnownGoodSince(response: Response): string | null {
  return response.headers.get(LAST_KNOWN_GOOD_HEADER);
}

/** Только для тестов: сбросить счётчики между сценариями. */
export function resetLastKnownGoodState(): void {
  lastWrittenAt.clear();
  entryCount = null;
}
