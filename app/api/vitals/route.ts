import { reportCmsFailure } from "@/lib/cms-error-reporting.mjs";
import type { WebVitalPayload } from "@/lib/web-vitals";

const MAX_PAYLOAD_BYTES = 2048;
const VALID_METRICS = new Set(["LCP", "INP", "CLS"]);
const VALID_LOCALES = new Set(["ru", "tj", "en"]);
const VALID_DEVICES = new Set(["mobile", "tablet", "desktop"]);

export function isWebVitalPayload(value: unknown): value is WebVitalPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.id === "string" &&
    payload.id.length > 0 &&
    payload.id.length <= 100 &&
    typeof payload.name === "string" &&
    VALID_METRICS.has(payload.name) &&
    typeof payload.value === "number" &&
    Number.isFinite(payload.value) &&
    payload.value >= 0 &&
    typeof payload.path === "string" &&
    payload.path.startsWith("/") &&
    payload.path.length <= 500 &&
    typeof payload.locale === "string" &&
    VALID_LOCALES.has(payload.locale) &&
    typeof payload.device === "string" &&
    VALID_DEVICES.has(payload.device) &&
    typeof payload.navigation_type === "string"
  );
}

function cmsVitalsEndpoint(): string {
  const base =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8848/api/v1";

  return `${base.replace(/\/+$/, "")}/vitals`;
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_PAYLOAD_BYTES) {
    return Response.json({ error: "Payload is too large." }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!isWebVitalPayload(payload)) {
    return Response.json({ error: "Invalid Web Vitals payload." }, { status: 422 });
  }

  const secret = process.env.RUM_INGEST_SECRET;
  if (!secret) {
    reportCmsFailure(
      "reportWebVital",
      new Error("RUM_INGEST_SECRET is not configured."),
    );

    return new Response(null, { status: 202 });
  }

  try {
    const response = await fetch(cmsVitalsEndpoint(), {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        "X-RUM-Key": secret,
      },
      signal: AbortSignal.timeout(2000),
    });

    if (!response.ok) {
      throw new Error(`CMS RUM endpoint returned ${response.status}.`);
    }
  } catch (error) {
    reportCmsFailure("reportWebVital", error);
  }

  return new Response(null, { status: 202 });
}
