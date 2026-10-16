import { reportCmsFailure } from "@/lib/cms-error-reporting.mjs";
import {
  createViewBuffer,
  isBot,
  isPageView,
  type PageViewCount,
} from "@/lib/page-views";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";

const MAX_PAYLOAD_BYTES = 512;

/**
 * Читатель отмечает страницу один раз за сеанс; 120 отметок в минуту с адреса —
 * с запасом для живого человека и мало для накрутки.
 */
const viewsRateLimit = createRateLimiter({
  limit: 120,
  windowMs: 60_000,
  maxKeys: 10_000,
});

function cmsViewsEndpoint(): string {
  const base =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8848/api/v1";

  return `${base.replace(/\/+$/, "")}/views`;
}

async function sendToCms(views: PageViewCount[]): Promise<void> {
  const secret = process.env.RUM_INGEST_SECRET;
  if (!secret) {
    // Без ключа CMS пачку не примет: не копить отметки впустую.
    reportCmsFailure(
      "recordPageViews",
      new Error("RUM_INGEST_SECRET is not configured."),
    );
    return;
  }

  try {
    const response = await fetch(cmsViewsEndpoint(), {
      method: "POST",
      body: JSON.stringify({ views }),
      headers: {
        "Content-Type": "application/json",
        "X-RUM-Key": secret,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`CMS views endpoint returned ${response.status}.`);
    }
  } catch (error) {
    reportCmsFailure("recordPageViews", error);
    throw error;
  }
}

/** Один на процесс сервера сайта: отметки всех читателей — в общую пачку. */
const buffer = createViewBuffer({ send: sendToCms });

export async function POST(request: Request): Promise<Response> {
  const decision = viewsRateLimit.consume(clientKey(request.headers));
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

  if (!isPageView(payload)) {
    return Response.json({ error: "Invalid page view." }, { status: 422 });
  }

  if (!isBot(request.headers.get("user-agent"))) {
    buffer.add({ type: payload.type, slug: payload.slug, locale: payload.locale });
  }

  return new Response(null, { status: 202 });
}
