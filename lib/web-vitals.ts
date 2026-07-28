import type { WebVitalRequest } from "@/lib/api.generated";

export type CoreWebVitalName = WebVitalRequest["name"];

export interface WebVitalMetric {
  id: string;
  name: string;
  value: number;
  navigationType: WebVitalRequest["navigation_type"];
}

export type WebVitalPayload = WebVitalRequest;

const CORE_METRICS = new Set<CoreWebVitalName>(["LCP", "INP", "CLS"]);

export function parseWebVitalsSampleRate(value: string | undefined): number {
  const parsed = Number(value ?? "0");

  return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0;
}

export function shouldSampleWebVitals(
  rate: number,
  random: () => number = Math.random,
): boolean {
  return rate > 0 && random() < rate;
}

export function webVitalDevice(
  viewportWidth: number,
): WebVitalPayload["device"] {
  if (viewportWidth < 768) {
    return "mobile";
  }

  return viewportWidth < 1024 ? "tablet" : "desktop";
}

export function buildWebVitalPayload(
  metric: WebVitalMetric,
  context: { pathname: string; viewportWidth: number },
): WebVitalPayload | null {
  if (!CORE_METRICS.has(metric.name as CoreWebVitalName)) {
    return null;
  }

  const locale = context.pathname.split("/")[1];
  if (locale !== "ru" && locale !== "tj" && locale !== "en") {
    return null;
  }

  return {
    id: metric.id,
    name: metric.name as CoreWebVitalName,
    value: metric.value,
    path: context.pathname,
    locale,
    device: webVitalDevice(context.viewportWidth),
    navigation_type: metric.navigationType,
  };
}

export function transmitWebVital(
  payload: WebVitalPayload,
  runtime: Pick<typeof globalThis, "fetch"> & {
    navigator: Pick<Navigator, "sendBeacon">;
  },
): void {
  const body = JSON.stringify(payload);
  const blob = new Blob([body], { type: "application/json" });

  if (runtime.navigator.sendBeacon("/api/vitals", blob)) {
    return;
  }

  void runtime
    .fetch("/api/vitals", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      credentials: "omit",
    })
    .catch(() => undefined);
}
