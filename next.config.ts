import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
