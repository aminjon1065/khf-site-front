import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import {
  assertCmsReady,
  cmsBuildMode,
  type CmsReadinessError,
} from "./lib/cms-readiness.mjs";

function usesLocalCmsEndpoint(): boolean {
  const endpoint = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!endpoint) {
    return false;
  }

  try {
    return ["127.0.0.1", "localhost"].includes(new URL(endpoint).hostname);
  } catch {
    return false;
  }
}

function cmsOrigin(): string | null {
  const endpoint = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL;

  try {
    return endpoint ? new URL(endpoint).origin : null;
  } catch {
    return null;
  }
}

/**
 * `script-src` осознанно остаётся с `'unsafe-inline'`, и это измеренное
 * решение, а не недосмотр. Строгий вариант в Next 16 — nonce, который
 * выдаёт proxy на каждый запрос; официальная документация прямо требует для
 * него **динамического рендера всех страниц** («Static pages are generated at
 * build time, when no request or response headers exist — so no nonce can be
 * injected»). У портала 111 страниц пререндерятся при сборке, и перевод их в
 * динамику стоил бы ровно того выигрыша, ради которого весь Этап 2. Хеши тоже
 * не подходят: помимо нашего одного инлайна (тема до первой отрисовки) Next
 * вставляет собственные скрипты с содержимым, меняющимся от страницы к
 * странице. Что можно было сузить без потери страниц — сужено ниже.
 */
function contentSecurityPolicy(): string {
  const isDevelopment = process.env.NODE_ENV === "development";
  const connectSources = ["'self'", cmsOrigin()].filter(Boolean).join(" ");

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    // `http:` разрешён только в разработке (локальная CMS отдаёт медиа по
    // http). В production его нет: все картинки страницы идут через
    // `/_next/image`, то есть со своего же origin, а `https:` оставлен для
    // изображений, вставленных редактором в тело материала.
    `img-src 'self' data: blob: https:${isDevelopment ? " http:" : ""}`,
    "font-src 'self' data:",
    `connect-src ${connectSources}`,
    "media-src 'self' https:",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy() },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  // Turbopack refuses a second `next dev`/`next start` against the same
  // project directory's .next (shared dev cache/build lock) — B-6's
  // "backend-down" Playwright project runs a second server concurrently
  // with the normal one, so it points here via NEXT_DIST_DIR to its own
  // isolated output dir instead of colliding on the default `.next`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // app/global-not-found.tsx — рендерится за пределами статической
  // оптимизации, per-request, поэтому корректно определяет локаль из URL
  // (см. PROGRESS.md, запись B-5: классический app/not-found.tsx
  // предрендерится в статический _not-found один раз при сборке).
  experimental: {
    globalNotFound: true,
  },
  // `next start` gzip is intentionally explicit; an edge proxy may replace it
  // with Brotli, but must not disable compression without an equivalent.
  compress: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    // Next.js 16 blocks private upstreams by default. Local CMS/mock media is
    // enabled only for explicit local CMS builds; public production hosts keep
    // the SSRF protection enabled.
    dangerouslyAllowLocalIP:
      process.env.NODE_ENV === "development" || usesLocalCmsEndpoint(),
    // Изображения (обложки новостей и т.п.) отдаёт медиатека CMS.
    // Хост берётся из API_URL; localhost/127.0.0.1 разрешены для разработки.
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "http", hostname: "localhost" },
      // Локальная CMS через lerd (медиатека отдаёт /storage/... по https).
      { protocol: "https", hostname: "khf-site-cms.test" },
      { protocol: "https", hostname: "**.khf.tj" },
      { protocol: "https", hostname: "khf.tj" },
    ],
  },
};

export default async function configureNext(
  phase: string,
): Promise<NextConfig> {
  if (phase !== PHASE_PRODUCTION_BUILD) {
    return nextConfig;
  }

  if (cmsBuildMode() === "production") {
    await assertCmsReady();

    return nextConfig;
  }

  try {
    await assertCmsReady();
  } catch (error) {
    const readinessError = error as CmsReadinessError;
    console.warn(
      `[cms-readiness:preview-fallback] ${readinessError.message} Build continues because CMS_BUILD_MODE=preview.`,
    );
  }

  return nextConfig;
}
