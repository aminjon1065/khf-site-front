import { describe, expect, it, vi } from "vitest";
import {
  checkCmsReadiness,
  cmsBuildMode,
  cmsDiagnosticEnabled,
  cmsReadinessTimeout,
  cmsReadinessUrl,
} from "../../lib/cms-readiness.mjs";
import { createCmsErrorReporter } from "../../lib/cms-error-reporting.mjs";

const readyPayload = {
  status: "ready",
  checks: {
    database: true,
    storage: true,
    scheduler: true,
    queue_connection: "database",
  },
};

describe("CMS build modes", () => {
  it("defaults to production and enables diagnostics only for fallback modes", () => {
    expect(cmsBuildMode({})).toBe("production");

    // Сам по себе режим разработки — не повод для предупреждения: с живой CMS
    // страницы наполнены настоящими данными, и вечная плашка только мешает.
    expect(cmsDiagnosticEnabled({ NODE_ENV: "development" })).toBe(false);
    expect(cmsDiagnosticEnabled({ NODE_ENV: "production" })).toBe(false);

    // Повод первый: сборка, где gate готовности CMS осознанно пропущен.
    expect(
      cmsDiagnosticEnabled({ NODE_ENV: "production", CMS_BUILD_MODE: "preview" }),
    ).toBe(true);

    // Повод второй: CMS недоступна прямо сейчас и показан резервный контент.
    expect(
      cmsDiagnosticEnabled({ NODE_ENV: "development" }, { degraded: true }),
    ).toBe(true);
    expect(() => cmsBuildMode({ CMS_BUILD_MODE: "staging" })).toThrowError(
      expect.objectContaining({ code: "invalid_build_mode" }),
    );
  });
});

describe("CMS readiness contract", () => {
  it("preserves the API v1 base path", () => {
    expect(cmsReadinessUrl("https://cms.example/api/v1")).toBe(
      "https://cms.example/api/v1/ready",
    );
    expect(cmsReadinessUrl("https://cms.example/api/v1/")).toBe(
      "https://cms.example/api/v1/ready",
    );
  });

  it("accepts the complete readiness contract", async () => {
    await expect(
      checkCmsReadiness({
        apiUrl: "https://cms.example/api/v1",
        fetchImpl: async () => Response.json(readyPayload),
      }),
    ).resolves.toMatchObject({
      url: "https://cms.example/api/v1/ready",
    });
  });

  it("rejects non-success responses", async () => {
    await expect(
      checkCmsReadiness({
        apiUrl: "https://cms.example/api/v1",
        fetchImpl: async () =>
          Response.json({ status: "not_ready" }, { status: 503 }),
      }),
    ).rejects.toMatchObject({ code: "http_status" });
  });

  it.each([
    {
      name: "invalid JSON",
      response: new Response("<!doctype html>"),
      code: "invalid_json",
    },
    {
      name: "incomplete contract",
      response: Response.json({
        status: "ready",
        checks: { database: true, storage: true, scheduler: false },
      }),
      code: "invalid_contract",
    },
  ])("rejects $name", async ({ response, code }) => {
    await expect(
      checkCmsReadiness({
        apiUrl: "https://cms.example/api/v1",
        fetchImpl: async () => response,
      }),
    ).rejects.toMatchObject({ code });
  });

  it("classifies network failures", async () => {
    await expect(
      checkCmsReadiness({
        apiUrl: "https://cms.example/api/v1",
        fetchImpl: async () => {
          throw new TypeError("fetch failed");
        },
      }),
    ).rejects.toMatchObject({ code: "unavailable" });
  });

  it("aborts readiness requests after the configured timeout", async () => {
    const keepEventLoopAlive = setTimeout(() => {}, 200);

    try {
      await expect(
        checkCmsReadiness({
          apiUrl: "https://cms.example/api/v1",
          timeoutMs: 100,
          fetchImpl: async (_url, { signal }) =>
            new Promise((_resolve, reject) => {
              signal.addEventListener("abort", () => reject(signal.reason), {
                once: true,
              });
            }),
        }),
      ).rejects.toMatchObject({ code: "timeout" });
    } finally {
      clearTimeout(keepEventLoopAlive);
    }
  });

  it("validates timeout boundaries", () => {
    expect(cmsReadinessTimeout({})).toBe(5_000);
    expect(cmsReadinessTimeout({ CMS_READINESS_TIMEOUT_MS: "100" })).toBe(100);
    expect(() =>
      cmsReadinessTimeout({ CMS_READINESS_TIMEOUT_MS: "0" }),
    ).toThrowError(expect.objectContaining({ code: "invalid_timeout" }));
  });
});

describe("CMS outage logging", () => {
  it("aggregates duplicate failures within the reporting window", () => {
    const logger = vi.fn();
    let currentTime = 1_000;
    const report = createCmsErrorReporter({
      logger,
      now: () => currentTime,
      deduplicationWindowMs: 60_000,
    });
    const connectionFailure = new TypeError("fetch failed", {
      cause: Object.assign(new Error("connect ECONNREFUSED 127.0.0.1"), {
        code: "ECONNREFUSED",
      }),
    });

    report("fetchNews", connectionFailure);
    report("fetchMenu", connectionFailure);
    report("fetchSettings", connectionFailure);

    expect(logger).toHaveBeenCalledTimes(1);
    expect(logger).toHaveBeenLastCalledWith(
      "[cms-api:degraded]",
      expect.objectContaining({ code: "ECONNREFUSED" }),
    );

    currentTime += 60_000;
    report("fetchHome", connectionFailure);

    expect(logger).toHaveBeenCalledTimes(2);
    expect(logger).toHaveBeenLastCalledWith(
      "[cms-api:degraded]",
      expect.objectContaining({ previous_duplicates_suppressed: 2 }),
    );
  });
});
