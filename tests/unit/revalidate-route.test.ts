import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTagMock = vi.fn();
vi.mock("next/cache", () => ({
  revalidateTag: (...args: unknown[]) => revalidateTagMock(...args),
}));

import { POST } from "@/app/api/revalidate/route";

function request(authorization?: string): Request {
  const headers: Record<string, string> = {};
  if (authorization !== undefined) {
    headers.authorization = authorization;
  }
  return new Request("http://localhost/api/revalidate", { method: "POST", headers });
}

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    revalidateTagMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 503 and does not revalidate when REVALIDATION_SECRET is not configured", async () => {
    vi.stubEnv("REVALIDATION_SECRET", "");

    const res = await POST(request("Bearer anything"));

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ revalidated: false, error: "revalidation_not_configured" });
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it("returns 401 and does not revalidate when the Bearer token is missing", async () => {
    vi.stubEnv("REVALIDATION_SECRET", "top-secret");

    const res = await POST(request());

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ revalidated: false, error: "unauthorized" });
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it("returns 401 and does not revalidate when the Bearer token is wrong", async () => {
    vi.stubEnv("REVALIDATION_SECRET", "top-secret");

    const res = await POST(request("Bearer wrong-secret"));

    expect(res.status).toBe(401);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it("returns 401 for a token of a different length than the configured secret", async () => {
    // Regression guard for the constant-time comparison: timingSafeEqual
    // throws on mismatched buffer lengths if not guarded, which would leak
    // a 500 instead of a clean 401.
    vi.stubEnv("REVALIDATION_SECRET", "top-secret");

    const res = await POST(request("Bearer short"));

    expect(res.status).toBe(401);
  });

  it("revalidates the cms tag immediately (not stale-while-revalidate) on a valid request", async () => {
    // E-4: a webhook from the CMS needs the very next visit to see fresh
    // content, not the old cached page — { expire: 0 }, not "max".
    vi.stubEnv("REVALIDATION_SECRET", "top-secret");

    const res = await POST(request("Bearer top-secret"));

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ revalidated: true, tag: "cms" });
    expect(revalidateTagMock).toHaveBeenCalledTimes(1);
    expect(revalidateTagMock).toHaveBeenCalledWith("cms", { expire: 0 });
  });
});
