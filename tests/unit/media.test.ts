import { describe, expect, it } from "vitest";
import { cmsImageSource, type CmsImageDto } from "@/lib/media";

function image(overrides: Partial<CmsImageDto> = {}): CmsImageDto {
  return {
    version: 2,
    id: 7,
    uuid: "00000000-0000-4000-8000-000000000007",
    alt: "Описание",
    caption: null,
    width: 1800,
    height: 1200,
    aspect_ratio: 1.5,
    bytes: 400000,
    mime_type: "image/jpeg",
    checksum: "a".repeat(64),
    focal_point: { x: 0.5, y: 0.5 },
    status: "ready",
    placeholder: null,
    sources: {
      avif: [],
      webp: [],
      fallback: [
        { url: "https://cms.test/storage/sm.jpg", width: 480, height: 320, bytes: 20 },
        { url: "https://cms.test/storage/lg.jpg", width: 1600, height: 1067, bytes: 80 },
      ],
    },
    ...overrides,
  };
}

describe("structured CMS image contract", () => {
  it("selects the largest generated fallback derivative", () => {
    expect(cmsImageSource(image())).toBe("https://cms.test/storage/lg.jpg");
  });

  it("falls back to a generated modern format and never needs an original URL", () => {
    const dto = image({
      sources: {
        fallback: [],
        webp: [
          { url: "https://cms.test/storage/md.webp", width: 960, height: 640, bytes: 40 },
        ],
        avif: [],
      },
    });

    expect(cmsImageSource(dto)).toBe("https://cms.test/storage/md.webp");
    expect(dto).not.toHaveProperty("original_url");
  });

  it("returns null while no derivative is available", () => {
    expect(
      cmsImageSource(
        image({ sources: { fallback: [], webp: [], avif: [] }, status: "pending" }),
      ),
    ).toBeNull();
  });
});
