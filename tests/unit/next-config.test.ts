import { expect, it } from "vitest";
import configureNext from "../../next.config";
import { LOCALES } from "@/lib/i18n/config";
import { CMS_PAGE_ROUTES } from "@/lib/routes";

it("permanently redirects /{locale}/pages/{slug} of «About us» pages to their sections", async () => {
  const config = await configureNext("phase-development-server");
  const rules = (await config.redirects?.()) ?? [];

  // Одна запись на каждую страницу из CMS_PAGE_ROUTES, во всех локалях,
  // 308 (permanent) — иначе у материала два адреса и дубль в выдаче.
  expect(rules).toEqual(
    Object.entries(CMS_PAGE_ROUTES).map(([slug, path]) => ({
      source: `/:locale(${LOCALES.join("|")})/pages/${slug}`,
      destination: `/:locale${path}`,
      permanent: true,
    })),
  );
  // Прочие CMS-страницы редирект не трогает.
  expect(rules.some((rule) => rule.source.includes("privacy"))).toBe(false);
});

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
  // Проверяем именно директиву img-src: connect-src законно содержит origin
  // CMS из API_URL (в CI мок-фикстура слушает http://127.0.0.1).
  const imgSrc = csp?.match(/img-src [^;]+/)?.[0] ?? "";
  expect(imgSrc).toBe("img-src 'self' data: blob: https:");
  expect(csp).toContain("upgrade-insecure-requests");
});
