import { expect, test } from "@playwright/test";

test("reports anonymous Core Web Vitals through the same-origin proxy", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const originalFetch = window.fetch.bind(window);
    Object.defineProperty(window.navigator, "sendBeacon", {
      configurable: true,
      value: () => false,
    });
    window.fetch = (input, init) => {
      if (String(input).endsWith("/api/vitals") && typeof init?.body === "string") {
        window.localStorage.setItem("rum-test-payload", init.body);

        return Promise.resolve(new Response(null, { status: 202 }));
      }

      return originalFetch(input, init);
    };
  });

  await page.goto("/ru");
  await page.waitForLoadState("networkidle");
  await page.goto("/tj");

  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("rum-test-payload")))
    .not.toBeNull();
  const payload = JSON.parse(
    (await page.evaluate(() => localStorage.getItem("rum-test-payload"))) ?? "{}",
  ) as Record<string, unknown>;

  expect(["LCP", "INP", "CLS"]).toContain(payload.name);
  expect(payload.path).toBe("/ru");
  expect(payload.locale).toBe("ru");
  expect(payload).not.toHaveProperty("ip_address");
  expect(payload).not.toHaveProperty("user_agent");
  expect(payload).not.toHaveProperty("session_id");
});
