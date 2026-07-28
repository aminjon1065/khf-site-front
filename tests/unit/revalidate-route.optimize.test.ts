// Тесты из ветки optimize-run. Вынесены отдельным файлом при сведении двух
// линий работ: обе стороны писали свои наборы для одного модуля, и склеить
// их в один файл нельзя без ручной правки моков и describe-блоков. Покрытие
// сохранено полностью; объединить с соседним файлом — отдельной задачей.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildRevalidationTags,
  type CmsRevalidationPayload,
} from "@/lib/cache-tags";

const revalidateTag = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidateTag }));

import { POST } from "@/app/api/revalidate/route";

const payload: CmsRevalidationPayload = {
  type: "news",
  id: 42,
  slug: "storm-update",
  locales: ["ru", "tj"],
  event: "published",
  tags: buildRevalidationTags("news", "storm-update", ["ru", "tj"]),
};

function request(body: unknown, token = "test-secret"): Request {
  return new Request("https://front.example.test/api/revalidate", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("granular revalidation webhook", () => {
  beforeEach(() => {
    process.env.REVALIDATION_SECRET = "test-secret";
  });

  afterEach(() => {
    delete process.env.REVALIDATION_SECRET;
    revalidateTag.mockReset();
  });

  it("revalidates only the tags proven by the typed payload", async () => {
    const response = await POST(request(payload));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      revalidated: true,
      tags: payload.tags,
    });
    expect(revalidateTag.mock.calls).toEqual(
      payload.tags.map((tag) => [tag, { expire: 0 }]),
    );
    expect(revalidateTag).not.toHaveBeenCalledWith("cms", { expire: 0 });
  });

  it("rejects a payload whose tags do not match its content metadata", async () => {
    const response = await POST(
      request({ ...payload, tags: ["cms:shell:ru"] }),
    );

    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      revalidated: false,
      error: "invalid_contract",
    });
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects unauthorized requests before parsing the payload", async () => {
    const response = await POST(request(payload, "wrong-secret"));

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("returns 503 when the webhook secret is disabled", async () => {
    delete process.env.REVALIDATION_SECRET;

    const response = await POST(request(payload));

    expect(response.status).toBe(503);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
