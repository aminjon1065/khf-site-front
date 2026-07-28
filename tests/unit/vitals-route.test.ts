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
