import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

// E-1: axe scan of the pages PROJECT_PLAN.md's Lighthouse budgets target
// (home, news list, a news article, the risk map) plus the alert detail
// page, since it embeds the same map. `wcag2a`/`wcag2aa`/`wcag21aa` is
// axe's standard "reasonable bar" tag set; not scoped to `best-practice`
// rules, which are opinionated rather than actual accessibility failures.
const TAGS = ["wcag2a", "wcag2aa", "wcag21aa"];

async function expectNoViolations(url: string, page: import("@playwright/test").Page) {
  await page.goto(url);
  const results = await new AxeBuilder({ page })
    .withTags(TAGS)
    .analyze();
  const summary = results.violations.map(
    (v) => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} node(s))`,
  );
  expect(summary, summary.join("\n")).toEqual([]);
}

test("home page has no axe violations", async ({ page }) => {
  await expectNoViolations("/ru", page);
});

test("news list has no axe violations", async ({ page }) => {
  await expectNoViolations("/ru/news", page);
});

test("a news article has no axe violations", async ({ page }) => {
  await page.goto("/ru/news");
  const href = await page.locator("main a[href*='/news/']").first().getAttribute("href");
  await expectNoViolations(href!, page);
});

test("the risk map page has no axe violations", async ({ page }) => {
  await expectNoViolations("/ru/map", page);
});
