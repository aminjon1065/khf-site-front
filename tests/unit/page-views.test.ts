import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createViewBuffer,
  isBot,
  isPageView,
  type PageViewCount,
} from "@/lib/page-views";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

const view = { type: "news", slug: "pavodok", locale: "tj" } as const;

function manualBuffer(send: (views: PageViewCount[]) => Promise<void>) {
  const timers: (() => void)[] = [];
  const buffer = createViewBuffer({
    send,
    maxBatch: 3,
    maxPending: 4,
    schedule: (callback) => timers.push(callback),
  });
  return { buffer, timers };
}

describe("page view buffer", () => {
  it("sums the views of one page and sends them in one batch later", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const { buffer, timers } = manualBuffer(send);

    buffer.add(view);
    buffer.add(view);
    buffer.add({ ...view, locale: "ru" });

    expect(send).not.toHaveBeenCalled();
    expect(timers).toHaveLength(1);

    await buffer.flush();

    expect(send).toHaveBeenCalledWith([
      { ...view, count: 2 },
      { ...view, locale: "ru", count: 1 },
    ]);
    expect(buffer.size()).toBe(0);
  });

  it("sends at once when a batch is full", () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const { buffer } = manualBuffer(send);

    buffer.add({ ...view, slug: "a" });
    buffer.add({ ...view, slug: "b" });
    buffer.add({ ...view, slug: "c" });

    expect(send).toHaveBeenCalledTimes(1);
  });

  it("keeps the views while the CMS is down, within a ceiling", async () => {
    const send = vi.fn().mockRejectedValue(new Error("CMS down"));
    const { buffer, timers } = manualBuffer(send);

    buffer.add({ ...view, slug: "a" });
    buffer.add({ ...view, slug: "b" });
    await expect(buffer.flush()).rejects.toThrow("CMS down");

    expect(buffer.size()).toBe(2);
    // A retry is scheduled.
    expect(timers.length).toBeGreaterThanOrEqual(2);

    buffer.add({ ...view, slug: "c" });
    buffer.add({ ...view, slug: "d" });
    buffer.add({ ...view, slug: "e" });
    expect(buffer.size()).toBeLessThanOrEqual(4);
  });
});

describe("page view payload", () => {
  it("takes a material page and nothing else", () => {
    expect(isPageView(view)).toBe(true);
    expect(isPageView({ ...view, type: "document" })).toBe(false);
    expect(isPageView({ ...view, locale: "tg" })).toBe(false);
    expect(isPageView({ ...view, slug: "../admin" })).toBe(false);
    expect(isPageView({ ...view, slug: "x".repeat(181) })).toBe(false);
  });

  it("leaves robots and uptime checks out of the readers", () => {
    expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    expect(isBot("UptimeRobot/2.0")).toBe(true);
    expect(isBot(null)).toBe(true);
    expect(
      isBot("Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/126 Mobile Safari/537.36"),
    ).toBe(false);
  });
});

describe("page views route", () => {
  it("accepts a reader's view and forwards the batch with the server-only key", async () => {
    vi.useFakeTimers();
    vi.stubEnv("API_URL", "https://cms.example.test/api/v1");
    vi.stubEnv("RUM_INGEST_SECRET", "shared-secret");
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({ recorded: 1 }, { status: 202 }),
    );
    vi.stubGlobal("fetch", fetcher);
    const { POST } = await import("@/app/api/views/route");

    const response = await POST(
      new Request("https://site.example.test/api/views", {
        method: "POST",
        body: JSON.stringify(view),
        headers: { "user-agent": "Mozilla/5.0 Chrome/126" },
      }),
    );

    expect(response.status).toBe(202);
    expect(fetcher).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(30_000);

    expect(fetcher).toHaveBeenCalledWith(
      "https://cms.example.test/api/v1/views",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ views: [{ ...view, count: 1 }] }),
        headers: expect.objectContaining({ "X-RUM-Key": "shared-secret" }),
      }),
    );
    vi.useRealTimers();
  });

  it("rejects what is not a page view", async () => {
    const { POST } = await import("@/app/api/views/route");

    const response = await POST(
      new Request("https://site.example.test/api/views", {
        method: "POST",
        body: JSON.stringify({ type: "user", slug: "x", locale: "ru" }),
      }),
    );

    expect(response.status).toBe(422);
  });
});
