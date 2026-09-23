import { reportCmsFailure } from "@/lib/cms-error-reporting.mjs";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import type { WebVitalPayload } from "@/lib/web-vitals";

const MAX_PAYLOAD_BYTES = 2048;

/**
 * Аудит J-6: каждый принятый замер уходит в CMS, и без лимита публичный POST
 * превращал сайт в усилитель нагрузки на неё. 60 запросов в минуту с адреса —
 * с запасом больше, чем шлёт посетитель (до трёх метрик на просмотр), и
 * слишком мало, чтобы через фронт завалить CMS. Проверка — до чтения тела:
 * отказ не должен стоить ни разбора JSON, ни похода в CMS.
 */
const vitalsRateLimit = createRateLimiter({
  limit: 60,
  windowMs: 60_000,
  maxKeys: 10_000,
});
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
  const decision = vitalsRateLimit.consume(clientKey(request.headers));
  if (!decision.allowed) {
    return Response.json(
      { error: "Too many requests." },
      {
        status: 429,
        headers: { "Retry-After": String(decision.retryAfterSeconds) },
      },
    );
  }

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
