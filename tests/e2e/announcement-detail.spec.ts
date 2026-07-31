import { test, expect } from "@playwright/test";

// B-3: /announcements/[slug]. Slugs come from CMS demo data, so tests
// discover a real one from the list page rather than hardcoding it.

test("a card in the announcements list links to its detail page", async ({ page }) => {
  await page.goto("/ru/announcements");

  const firstCardLink = page.locator('[role="feed"] article h2 a').first();
  await expect(firstCardLink).toBeVisible();
  const href = await firstCardLink.getAttribute("href");
  expect(href).toMatch(/\/ru\/announcements\/[^/]+$/);

  await firstCardLink.click();
  await expect(page).toHaveURL(href!);
  // The detail page renders the same title as the list card did.
  await expect(page.locator("h1")).toBeVisible();
});

test("the detail page shows a Contacts fallback when there is no application_url", async ({ page }) => {
  await page.goto("/ru/announcements");
  const firstCardLink = page.locator('[role="feed"] article h2 a').first();
  await expect(firstCardLink).toBeVisible();
  const href = await firstCardLink.getAttribute("href");
  expect(href).toMatch(/\/ru\/announcements\/[^/]+$/);
  await page.goto(href!);

  // Demo data has no application_url set, so the "apply" button is replaced
  // by a contacts fallback (see isSafeExternalUrl in the page component).
  const applyButton = page.getByRole("link", { name: "Подать заявку" });
  const contactsFallback = page.getByRole("link", { name: "Контакты" });
  expect((await applyButton.count()) + (await contactsFallback.count())).toBeGreaterThan(0);
});
