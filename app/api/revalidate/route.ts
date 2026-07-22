import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

// Приёмник вебхука ревалидации от CMS. При публикации/обновлении контента
// Laravel-джоба App\Jobs\RevalidateFrontend шлёт:
//   POST /api/revalidate
//   Authorization: Bearer <FRONTEND_REVALIDATION_SECRET>
//   { "tag": "cms" }
// Секрет фронта (REVALIDATION_SECRET) должен совпадать с CMS-овским
// FRONTEND_REVALIDATION_SECRET. Все fetch в lib/api.ts помечены tags:["cms"].

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

  // Помечаем весь CMS-контент как устаревший (stale-while-revalidate): при
  // следующем заходе страница отдаст закэшированное и обновится в фоне.
  revalidateTag("cms", "max");

  return NextResponse.json({ revalidated: true, tag: "cms", now: Date.now() });
}
