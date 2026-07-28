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

const nextConfig: NextConfig = {
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
