import type { CmsImageDto, CmsImageSource } from "@/lib/api.generated";

export type { CmsImageDto, CmsImageSource } from "@/lib/api.generated";

/**
 * Next.js performs final content negotiation, so it starts from the largest
 * generated fallback derivative and never from the CMS original.
 */
export function cmsImageSource(image: CmsImageDto | null | undefined): string | null {
  if (!image) {
    return null;
  }

  const candidates =
    image.sources.fallback.length > 0
      ? image.sources.fallback
      : image.sources.webp.length > 0
        ? image.sources.webp
        : image.sources.avif;

  return (
    candidates.reduce<CmsImageSource | null>(
      (largest, source) =>
        largest === null || source.width > largest.width ? source : largest,
      null,
    )?.url ?? null
  );
}
