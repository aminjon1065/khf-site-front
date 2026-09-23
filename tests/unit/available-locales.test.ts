import { afterEach, describe, expect, it, vi } from "vitest";
import { availableLocalesOf } from "@/lib/api";

// Языки публикации материала (A-3): из `available_locales` детального ответа
// CMS, а если поля нет — по спискам slug'ов, как раньше.

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("availableLocalesOf", () => {
  it("takes the CMS list and maps tg to the portal's tj", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    await expect(
      availableLocalesOf({ available_locales: ["tg", "ru"] }, "news", "uchenia"),
    ).resolves.toEqual(["ru", "tj"]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("falls back to the slug lists when the CMS sends no list", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        const locale = new URL(url).searchParams.get("locale");

        return new Response(
          JSON.stringify({ data: locale === "en" ? [] : ["uchenia"] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }),
    );

    await expect(availableLocalesOf({}, "news", "uchenia")).resolves.toEqual([
      "ru",
      "tj",
    ]);
  });
});
