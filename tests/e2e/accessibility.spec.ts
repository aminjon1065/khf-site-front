import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const controlRoutes = [
  "/ru",
  "/tj",
  "/en",
  "/ru/news",
  "/ru/news/test-news",
  "/ru/map",
] as const;

for (const route of controlRoutes) {
  test(`${route} has no serious or critical axe violations`, async ({ page }) => {
    await page.goto(route);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const blockingViolations = results.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    );

    expect(
      blockingViolations,
      blockingViolations
        .map(
          (violation) =>
            `${violation.id}: ${violation.help} (${violation.nodes.length} nodes)`,
        )
        .join("\n"),
    ).toEqual([]);
  });
}
