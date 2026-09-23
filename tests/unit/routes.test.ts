import { describe, expect, it } from "vitest";
import {
  CMS_PAGE_ROUTES,
  cmsPagePath,
  isCanonicalCmsPage,
  routes,
} from "@/lib/routes";

// Контракт с CMS: страницы about/leadership/structure/symbols живут в
// собственных разделах, все остальные — по /pages/{slug}. По этой же таблице
// CMS строит ссылки «Открыть на сайте», поэтому она зафиксирована тестом.
describe("CMS page routes", () => {
  it("maps the four «About us» pages to their own sections", () => {
    expect(CMS_PAGE_ROUTES).toEqual({
      about: "/about",
      leadership: "/leadership",
      structure: "/structure",
      symbols: "/symbols",
    });
    expect(routes.about).toBe("/about");
  });

  it("gives canonical pages their section and every other slug /pages/{slug}", () => {
    expect(cmsPagePath("about")).toBe("/about");
    expect(cmsPagePath("leadership")).toBe("/leadership");
    expect(routes.page("symbols")).toBe("/symbols");
    expect(routes.page("privacy")).toBe("/pages/privacy");
    expect(routes.page("sos")).toBe("/pages/sos");
  });

  it("does not treat Object.prototype keys as canonical pages", () => {
    // `"toString" in CMS_PAGE_ROUTES` — true; такой slug не должен получить
    // «раздел» в виде функции вместо пути.
    expect(isCanonicalCmsPage("toString")).toBe(false);
    expect(isCanonicalCmsPage("__proto__")).toBe(false);
    expect(cmsPagePath("constructor")).toBe("/pages/constructor");
  });
});
