import { expect, test } from "@playwright/test";

test("public pages expose the security header contract", async ({
  request,
}) => {
  const response = await request.get("/ru");

  expect(response.headers()["content-security-policy"]).toContain(
    "default-src 'self'",
  );
  expect(response.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["referrer-policy"]).toBe(
    "strict-origin-when-cross-origin",
  );
  expect(response.headers()["permissions-policy"]).toContain("camera=()");
  expect(response.headers()["cross-origin-opener-policy"]).toBe("same-origin");
});
