import { beforeEach, describe, expect, it, vi } from "vitest";

const permanentRedirect = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ permanentRedirect }));

import { isSameSlug, redirectToCurrentSlug } from "@/lib/canonical-slug";
import { routes } from "@/lib/routes";

// Прежний адрес материала: CMS отвечает 301 на текущий, fetch следует за ним,
// и страница получает материал с другим slug'ом — посетителя отправляем на
// канонический адрес в той же локали.

describe("redirectToCurrentSlug", () => {
  beforeEach(() => {
    permanentRedirect.mockReset();
  });

  it("sends a former address to the current one in the same locale", () => {
    redirectToCurrentSlug("staryj-adres", "novyj-adres", "tj", routes.article);

    expect(permanentRedirect).toHaveBeenCalledWith("/tj/news/novyj-adres");
  });

  it("leaves the current address alone", () => {
    redirectToCurrentSlug("novyj-adres", "novyj-adres", "ru", routes.article);
    redirectToCurrentSlug("novyj-adres", undefined, "ru", routes.article);

    expect(permanentRedirect).not.toHaveBeenCalled();
  });

  it("sends a renamed page to its section when it has one", () => {
    redirectToCurrentSlug("o-komitete", "about", "en", routes.page);

    expect(permanentRedirect).toHaveBeenCalledWith("/en/about");
  });
});

describe("isSameSlug", () => {
  it("treats a percent-encoded address as the same slug", () => {
    expect(isSameSlug("%D0%B0%D0%B1%D0%B2", "абв")).toBe(true);
    expect(isSameSlug("%E0%A4%A", "a")).toBe(false);
  });
});
