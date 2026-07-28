import { describe, expect, it, vi } from "vitest";
import {
  buildWebVitalPayload,
  parseWebVitalsSampleRate,
  shouldSampleWebVitals,
  transmitWebVital,
  webVitalDevice,
} from "@/lib/web-vitals";

describe("Web Vitals reporting", () => {
  it("builds an anonymous payload for the three supported locales", () => {
    expect(
      buildWebVitalPayload(
        {
          id: "v4-test",
          name: "LCP",
          value: 1800,
          navigationType: "navigate",
        },
        { pathname: "/tj/news/article-slug", viewportWidth: 390 },
      ),
    ).toEqual({
      id: "v4-test",
      name: "LCP",
      value: 1800,
      path: "/tj/news/article-slug",
      locale: "tj",
      device: "mobile",
      navigation_type: "navigate" as const,
    });

    expect(
      buildWebVitalPayload(
        {
          id: "custom",
          name: "FCP",
          value: 500,
          navigationType: "navigate",
        },
        { pathname: "/ru", viewportWidth: 1280 },
      ),
    ).toBeNull();
  });

  it("clamps sample rates and classifies viewport sizes", () => {
    expect(parseWebVitalsSampleRate(undefined)).toBe(0);
    expect(parseWebVitalsSampleRate("1.5")).toBe(1);
    expect(parseWebVitalsSampleRate("-1")).toBe(0);
    expect(parseWebVitalsSampleRate("invalid")).toBe(0);
    expect(shouldSampleWebVitals(0.1, () => 0.05)).toBe(true);
    expect(shouldSampleWebVitals(0.1, () => 0.5)).toBe(false);
    expect(webVitalDevice(767)).toBe("mobile");
    expect(webVitalDevice(768)).toBe("tablet");
    expect(webVitalDevice(1024)).toBe("desktop");
  });

  it("prefers sendBeacon and falls back to a keepalive request", () => {
    const payload = {
      id: "v4-test",
      name: "CLS" as const,
      value: 0.05,
      path: "/en",
      locale: "en" as const,
      device: "desktop" as const,
      navigation_type: "navigate" as const,
    };
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response());
    const sendBeacon = vi.fn().mockReturnValue(true);

    transmitWebVital(payload, {
      fetch: fetcher,
      navigator: { sendBeacon },
    });

    expect(sendBeacon).toHaveBeenCalledOnce();
    expect(fetcher).not.toHaveBeenCalled();

    sendBeacon.mockReturnValue(false);
    transmitWebVital(payload, {
      fetch: fetcher,
      navigator: { sendBeacon },
    });

    expect(fetcher).toHaveBeenCalledWith(
      "/api/vitals",
      expect.objectContaining({
        method: "POST",
        keepalive: true,
        credentials: "omit",
      }),
    );
  });
});
