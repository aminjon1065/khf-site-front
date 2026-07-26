import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // app/global-not-found.tsx — рендерится за пределами статической
  // оптимизации, per-request, поэтому корректно определяет локаль из URL
  // (см. PROGRESS.md, запись B-5: классический app/not-found.tsx
  // предрендерится в статический _not-found один раз при сборке).
  experimental: {
    globalNotFound: true,
  },
  images: {
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

export default nextConfig;
