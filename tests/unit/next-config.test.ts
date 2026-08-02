import { expect, it } from "vitest";
import configureNext from "../../next.config";

it("enables compression and applies the security header contract globally", async () => {
  const config = await configureNext("phase-development-server");
  const rules = await config.headers?.();
  const headers = Object.fromEntries(
    (rules?.[0]?.headers ?? []).map(({ key, value }) => [key, value]),
  );

  expect(config.compress).toBe(true);
  expect(rules?.[0]?.source).toBe("/:path*");
  expect(headers["Content-Security-Policy"]).toContain("default-src 'self'");
  expect(headers["Content-Security-Policy"]).toContain("object-src 'none'");
  expect(headers["Content-Security-Policy"]).toContain(
    "frame-ancestors 'none'",
  );
  expect(headers["X-Content-Type-Options"]).toBe("nosniff");
  expect(headers["X-Frame-Options"]).toBe("DENY");
  expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["Permissions-Policy"]).toContain("camera=()");
});

it("не разрешает картинки по http вне разработки", async () => {
  const config = await configureNext("phase-development-server");
  const rules = await config.headers?.();
  const csp = (rules?.[0]?.headers ?? []).find(
    ({ key }) => key === "Content-Security-Policy",
  )?.value;

  // Все картинки страницы идут через `/_next/image`, то есть со своего
  // origin; `https:` оставлен ради изображений в теле материала. Открытый
  // `http:` означал бы разрешение на смешанный контент — в разработке это
  // осознанная поблажка локальной CMS, в остальных сборках его быть не должно.
  expect(csp).toContain("img-src 'self' data: blob: https:");
  expect(csp).not.toContain(" http:");
  expect(csp).toContain("upgrade-insecure-requests");
});
