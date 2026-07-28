import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { parseRevalidationPayload } from "@/lib/cache-tags";

// Приёмник вебхука ревалидации от CMS. При публикации/обновлении контента
// Laravel-джоба App\Jobs\RevalidateFrontend шлёт:
//   POST /api/revalidate
//   Authorization: Bearer <FRONTEND_REVALIDATION_SECRET>
//   { "type": "news", "id": 42, "slug": "storm", "locales": ["ru"], ... }
// Секрет фронта (REVALIDATION_SECRET) должен совпадать с CMS-овским
// FRONTEND_REVALIDATION_SECRET.

/** Сравнение секретов за постоянное время (защита от timing-атак). */
function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.REVALIDATION_SECRET;
  if (!secret) {
    // Секрет не настроен — не ревалидируем (и не выдаём себя за рабочий эндпоинт).
    return NextResponse.json(
      { revalidated: false, error: "revalidation_not_configured" },
      { status: 503 },
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!secretMatches(token, secret)) {
    return NextResponse.json(
      { revalidated: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { revalidated: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  const payload = parseRevalidationPayload(json);
  if (!payload) {
    return NextResponse.json(
      { revalidated: false, error: "invalid_contract" },
      { status: 422 },
    );
  }

  // { expire: 0 } — немедленная инвалидация, а не stale-while-revalidate
  // ("max"). Это вебхук от CMS, а не обычный визит: следующий же заход должен
  // увидеть свежий контент, а не отдать старую версию и обновиться в фоне
  // (тот самый сценарий, для которого Next документирует именно { expire: 0 } —
  // см. revalidateTag.md, раздел "webhooks or third-party services that need
  // immediate expiration").
  for (const tag of payload.tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return NextResponse.json({
    revalidated: true,
    tags: payload.tags,
    now: Date.now(),
  });
}
