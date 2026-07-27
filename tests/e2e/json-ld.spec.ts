import { test, expect, type Page } from "@playwright/test";

// E-3: structured data, scoped per PROJECT_PLAN.md E-3 — GovernmentOrganization
// (global), NewsArticle (news detail), BreadcrumbList (every page with visual
// breadcrumbs). Regression guard against a broken/empty settings fetch
// silently producing no script tag (JsonLd.tsx returns null on that), and
// against any future edit producing malformed JSON.
async function jsonLdBlocks(page: Page): Promise<unknown[]> {
  const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
  return raw.map((text) => JSON.parse(text));
}

test("home page has a valid GovernmentOrganization block", async ({ page }) => {
  await page.goto("/ru");
  const blocks = await jsonLdBlocks(page);
  const org = blocks.find(
    (b): b is Record<string, unknown> =>
      typeof b === "object" && b !== null && (b as Record<string, unknown>)["@type"] === "GovernmentOrganization",
  );

  expect(org).toBeTruthy();
  expect(org!["@context"]).toBe("https://schema.org");
  expect(typeof org!.name).toBe("string");
  expect(org!.name).not.toBe("");
  expect(typeof org!.url).toBe("string");
});

test("a news article has NewsArticle and BreadcrumbList blocks alongside GovernmentOrganization", async ({
  page,
}) => {
  // A hard navigation (goto), not a click-through: JSON-LD exists for
  // crawlers, which request each URL directly rather than executing a
  // client-side SPA transition - that's the render path worth asserting on.
  await page.goto("/ru/news");
  const href = await page.locator("main a[href*='/news/']").first().getAttribute("href");
  await page.goto(href!);

  const blocks = await jsonLdBlocks(page);
  const types = blocks.map((b) => (b as Record<string, unknown>)["@type"]);
  expect(types).toEqual(
    expect.arrayContaining(["GovernmentOrganization", "NewsArticle", "BreadcrumbList"]),
  );

  const article = blocks.find(
    (b): b is Record<string, unknown> => (b as Record<string, unknown>)["@type"] === "NewsArticle",
  )!;
  expect(typeof article.headline).toBe("string");
  expect(article.headline).not.toBe("");

  const breadcrumbs = blocks.find(
    (b): b is Record<string, unknown> => (b as Record<string, unknown>)["@type"] === "BreadcrumbList",
  )!;
  const items = breadcrumbs.itemListElement as { position: number; item?: string }[];
  expect(items.length).toBeGreaterThanOrEqual(2);
  // Last item (current page) must not link to itself.
  expect(items[items.length - 1].item).toBeUndefined();
});

test("alerts list page has a BreadcrumbList block", async ({ page }) => {
  await page.goto("/ru/alerts");
  const blocks = await jsonLdBlocks(page);
  const types = blocks.map((b) => (b as Record<string, unknown>)["@type"]);
  expect(types).toContain("BreadcrumbList");
});
