import Image, { type ImageProps } from "next/image";
import { cmsImageSource, type CmsImageDto } from "@/lib/media";

type CmsImageProps = Omit<
  ImageProps,
  | "alt"
  | "blurDataURL"
  | "fill"
  | "height"
  | "placeholder"
  | "sizes"
  | "src"
  | "width"
> & {
  image: CmsImageDto;
  sizes: string;
};

/**
 * Responsive CMS media. The parent owns the reserved geometry; the required
 * `sizes` value lets Next.js generate a route-appropriate `srcset`.
 */
export default function CmsImage({
  image,
  sizes,
  style,
  ...props
}: CmsImageProps) {
  const src = cmsImageSource(image);

  if (!src) {
    return null;
  }

  return (
    <Image
      {...props}
      src={src}
      alt={image.alt}
      fill
      sizes={sizes}
      placeholder={image.placeholder ? "blur" : "empty"}
      blurDataURL={image.placeholder?.data_url}
      style={{
        objectFit: "cover",
        objectPosition: `${image.focal_point.x * 100}% ${image.focal_point.y * 100}%`,
        ...style,
      }}
    />
  );
}
