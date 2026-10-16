import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchAlertsActive, fetchHome } from "@/lib/api";
import {
  cmsFetch,
  LAST_KNOWN_GOOD_HEADER,
  lastKnownGoodSince,
  resetLastKnownGoodState,
  SITE_KEY_HEADER,
} from "@/lib/cms-fetch";

// ADR-001: при отказе CMS сайт отдаёт последний удачный ответ, а не заглушку.

const NEWS = "https://cms.example.org/api/v1/news/flood?locale=ru";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("cmsFetch", () => {
  let directory: string;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    directory = mkdtempSync(path.join(tmpdir(), "cms-lkg-"));
    vi.stubEnv("CMS_LAST_KNOWN_GOOD_DIR", directory);
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    resetLastKnownGoodState();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    rmSync(directory, { recursive: true, force: true });
  });

  it("serves the last good answer when the CMS is unreachable", async () => {
    fetchMock.mockResolvedValueOnce(json({ data: { title: "Паводок" } }));
    const live = await cmsFetch(NEWS);
    expect(lastKnownGoodSince(live)).toBeNull();

    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    const copy = await cmsFetch(NEWS);

    expect(copy.status).toBe(200);
    expect(await copy.json()).toEqual({ data: { title: "Паводок" } });
    expect(copy.headers.get(LAST_KNOWN_GOOD_HEADER)).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it.each([500, 502, 503, 429])(
    "serves the copy when the CMS answers %i",
    async (status) => {
      fetchMock.mockResolvedValueOnce(json({ data: { title: "Сель" } }));
      await cmsFetch(NEWS);

      fetchMock.mockResolvedValueOnce(json({ message: "down" }, status));
      const copy = await cmsFetch(NEWS);

      expect(copy.ok).toBe(true);
      expect(lastKnownGoodSince(copy)).not.toBeNull();
    },
  );

  it("keeps the old behaviour when there is no copy yet", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    await expect(cmsFetch(NEWS)).rejects.toThrow("fetch failed");

    fetchMock.mockResolvedValueOnce(json({ message: "down" }, 503));
    expect((await cmsFetch(NEWS)).status).toBe(503);
  });

  it("forgets an unpublished item so a later outage cannot bring it back", async () => {
    fetchMock.mockResolvedValueOnce(json({ data: { title: "Снято" } }));
    await cmsFetch(NEWS);
    fetchMock.mockResolvedValueOnce(json({ message: "Not found" }, 404));
    expect((await cmsFetch(NEWS)).status).toBe(404);

    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    await expect(cmsFetch(NEWS)).rejects.toThrow("fetch failed");
  });

  it("does not keep copies of search or free-text queries", async () => {
    // Адреса поиска задаёт посетитель: копия на каждый запрос заполнила бы диск.
    fetchMock.mockImplementation(async () => json({ data: [] }));
    await cmsFetch("https://cms.example.org/api/v1/search?q=flood");
    await cmsFetch("https://cms.example.org/api/v1/news?q=flood&locale=ru");

    expect(readdirSync(directory)).toEqual([]);
  });

  it("keeps nothing outside a production build unless a directory is set", async () => {
    vi.stubEnv("CMS_LAST_KNOWN_GOOD_DIR", "");
    fetchMock.mockResolvedValueOnce(json({ data: { title: "Тест" } }));
    await cmsFetch(NEWS);

    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    await expect(cmsFetch(NEWS)).rejects.toThrow("fetch failed");
  });

  it("presents the site server key only when it is configured", async () => {
    fetchMock.mockImplementation(async () => json({ data: {} }));

    await cmsFetch(NEWS);
    const anonymous = new Headers(fetchMock.mock.calls[0][1].headers);
    expect(anonymous.has(SITE_KEY_HEADER)).toBe(false);

    vi.stubEnv("SITE_API_KEY", "site-server-key");
    await cmsFetch(NEWS);
    const keyed = new Headers(fetchMock.mock.calls[1][1].headers);
    expect(keyed.get(SITE_KEY_HEADER)).toBe("site-server-key");
  });

  it("marks a situation summary from the copy as stale", async () => {
    const summary = {
      state: "warning",
      count: 1,
      updated_at: "2026-10-16T09:05:00+05:00",
      regions: [],
    };
    fetchMock.mockResolvedValueOnce(json({ data: summary }));
    expect(await fetchAlertsActive("ru")).toEqual(summary);

    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    const stale = await fetchAlertsActive("ru");

    // Время обстановки — прежнее, из CMS: копия не выдаёт себя за свежую.
    expect(stale?.updated_at).toBe(summary.updated_at);
    expect(stale?.staleSince).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("marks the home page from the copy as stale", async () => {
    const home = {
      blocks: [],
      alerts: { state: "calm", count: 0, updated_at: "2026-10-16T09:05:00+05:00", regions: [], items: [] },
      news: [],
      instructions: [],
      documents: [],
      announcements: [],
      projects: [],
      emergency_contacts: {},
    };
    fetchMock.mockResolvedValueOnce(json({ data: home }));
    await fetchHome("ru");

    fetchMock.mockResolvedValueOnce(json({ message: "down" }, 503));
    const stale = await fetchHome("ru");

    expect(stale?.alerts.count).toBe(0);
    expect(stale?.staleSince).toBeDefined();
  });
});

describe("cmsFetch under concurrent prerendering", () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(path.join(tmpdir(), "cms-lkg-"));
    vi.stubEnv("CMS_LAST_KNOWN_GOOD_DIR", directory);
    vi.stubGlobal("fetch", vi.fn(async () => json({ data: { title: "Паводок" } })));
    resetLastKnownGoodState();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    rmSync(directory, { recursive: true, force: true });
  });

  it("writes one copy when many pages request the same address at once", async () => {
    // `next build` пререндерит десятки страниц, и все они разом просят
    // настройки и меню: параллельные записи одной копии падали на rename.
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    await Promise.all(Array.from({ length: 20 }, () => cmsFetch(NEWS)));

    expect(errors).not.toHaveBeenCalled();
    expect(readdirSync(directory).filter((file) => file.endsWith(".json"))).toHaveLength(1);
    expect(readdirSync(directory).some((file) => file.endsWith(".tmp"))).toBe(false);
  });
});
