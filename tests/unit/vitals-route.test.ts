import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/vitals/route";

const payload = {
  id: "v4-test",
  name: "INP",
  value: 140,
  path: "/ru/news/test-news",
  locale: "ru",
  device: "mobile",
  navigation_type: "navigate",
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("RUM proxy route", () => {
  it("validates and forwards telemetry with the server-only secret", async () => {
    vi.stubEnv("API_URL", "https://cms.example.test/api/v1");
    vi.stubEnv("RUM_INGEST_SECRET", "shared-secret");
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({ accepted: true }, { status: 202 }),
    );
    vi.stubGlobal("fetch", fetcher);

    const response = await POST(
      new Request("https://site.example.test/api/vitals", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );

    expect(response.status).toBe(202);
    expect(fetcher).toHaveBeenCalledWith(
      "https://cms.example.test/api/v1/vitals",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RUM-Key": "shared-secret",
        },
      }),
    );
  });

  it("answers 429 once an address exceeds 60 requests a minute, before reading the body", async () => {
    // J-6: публичный POST не должен транслировать в CMS неограниченный поток.
    vi.stubEnv("RUM_INGEST_SECRET", "shared-secret");
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({ accepted: true }, { status: 202 }),
    );
    vi.stubGlobal("fetch", fetcher);
    const send = (forwardedFor: string, body = JSON.stringify(payload)) =>
      POST(
        new Request("https://site.example.test/api/vitals", {
          method: "POST",
          // Первый элемент — подделка клиента, последний дописал nginx.
          headers: { "x-forwarded-for": forwardedFor },
          body,
        }),
      );

    for (let i = 0; i < 60; i += 1) {
      expect((await send(`10.0.0.${i}, 198.51.100.23`)).status).toBe(202);
    }
    expect(fetcher).toHaveBeenCalledTimes(60);

    const limited = await send("10.0.0.99, 198.51.100.23", "{not json");
    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get("retry-after"))).toBeGreaterThanOrEqual(1);
    // Отказ — до разбора тела и без похода в CMS.
    expect(fetcher).toHaveBeenCalledTimes(60);

    // Соседний адрес лимит не делит.
    expect((await send("198.51.100.24")).status).toBe(202);
  });

  it("rejects malformed telemetry before contacting CMS", async () => {
    const fetcher = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetcher);

    const response = await POST(
      new Request("https://site.example.test/api/vitals", {
        method: "POST",
        body: JSON.stringify({ ...payload, name: "FCP" }),
      }),
    );

    expect(response.status).toBe(422);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
