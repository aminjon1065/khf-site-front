"use client";

import { useReportWebVitals } from "next/web-vitals";
import {
  buildWebVitalPayload,
  parseWebVitalsSampleRate,
  shouldSampleWebVitals,
  transmitWebVital,
} from "@/lib/web-vitals";

const sampleRate = parseWebVitalsSampleRate(
  process.env.NEXT_PUBLIC_RUM_SAMPLE_RATE,
);
let sampledPage: boolean | undefined;

const reportWebVital: Parameters<typeof useReportWebVitals>[0] = (metric) => {
  sampledPage ??= shouldSampleWebVitals(sampleRate);
  if (!sampledPage) {
    return;
  }

  const payload = buildWebVitalPayload(metric, {
    pathname: window.location.pathname,
    viewportWidth: window.innerWidth,
  });

  if (payload !== null) {
    transmitWebVital(payload, { fetch: window.fetch, navigator: window.navigator });
  }
};

export function WebVitalsReporter() {
  useReportWebVitals(reportWebVital);

  return null;
}
