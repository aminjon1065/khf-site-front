import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  legacySource,
  resetLegacyRedirectCache,
  resolveLegacyPath,
} from "@/lib/legacy-redirect";

describe("legacySource", () => {
  it("reads an old khf.tj page, and a kchs.tj one forwarded under /ru", () => {
    expect(legacySource("/node/6112")).toBe("khf.tj/node/6112");
    expect(legacySource("/node/6112/")).toBe("khf.tj/node/6112");
    expect(legacySource("/ru/node/4167")).toBe("kchs.tj/node/4167");
    expect(legacySource("/taxonomy/term/72")).toBe("khf.tj/taxonomy/term/72");
  });

  it("leaves the new site's own addresses alone", () => {
    expect(legacySource("/ru/news/sel")).toBeNull();
    expect(legacySource("/tj/node/1")).toBeNull();
    expect(legacySource("/node/abc")).toBeNull();
    expect(legacySource("/node")).toBeNull();
  });
});

describe("resolveLegacyPath", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    resetLegacyRedirectCache();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("API_URL", "http://cms-web/api/v1");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("asks the CMS where the old page leads now", async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ data: { path: "/tj/news/sel" } }));

    expect(await resolveLegacyPath("khf.tj/node/6112")).toBe("/tj/news/sel");
    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://cms-web/api/v1/redirects/legacy?source=khf.tj%2Fnode%2F6112",
    );
  });

  it("remembers the answer so a crawler does not hammer the CMS", async () => {
    fetchMock.mockResolvedValue(Response.json({ data: { path: "/tj/news/sel" } }));

    await resolveLegacyPath("khf.tj/node/1");
    await resolveLegacyPath("khf.tj/node/1");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("gives up quietly when the address is unknown or the CMS is down", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 404 }));
    expect(await resolveLegacyPath("khf.tj/node/2")).toBeNull();

    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    expect(await resolveLegacyPath("khf.tj/node/3")).toBeNull();
  });

  it("never leads off the site", async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ data: { path: "//evil.example/x" } }));
    expect(await resolveLegacyPath("khf.tj/node/4")).toBeNull();

    fetchMock.mockResolvedValueOnce(Response.json({ data: { path: "https://evil.example" } }));
    expect(await resolveLegacyPath("khf.tj/node/5")).toBeNull();
  });
});
