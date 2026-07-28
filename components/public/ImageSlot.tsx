"use client";

import type { CSSProperties } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { localeFromPathname } from "@/lib/i18n/config";
import { getUiStrings } from "@/lib/i18n/ui-strings";
import { muted } from "@/components/public/muted";

/**
 * Слот изображения. С `src` — реальное фото (object-fit), без него —
 * подпись-плейсхолдер (заменяется фото пресс-службы). Клиентский компонент:
 * запасную aria-метку берёт из словаря по локали из URL.
 */
export function ImageSlot({
  src,
  alt,
  label,
  fit = "cover",
  sizes = "100vw",
  preload = false,
  className = "",
  style,
}: {
  src?: string;
  alt?: string;
  label?: string;
  fit?: "cover" | "contain";
  sizes?: string;
  preload?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const ui = getUiStrings(localeFromPathname(usePathname()));

  if (src) {
    return (
      <div className={`relative h-full w-full ${className}`} style={style}>
        <Image
          src={src}
          alt={alt ?? label ?? ""}
          fill
          sizes={sizes}
          preload={preload}
          style={{ objectFit: fit }}
        />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={label ?? ui.imageSlot}
      className={`flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center ${className}`}
      style={{
        minHeight: "inherit",
        background: "var(--color-neutral-200)",
        color: muted(42),
        ...style,
      }}
    >
      <ImageIcon size={22} strokeWidth={1.5} aria-hidden="true" />
      {label && (
        <span className="text-[11.5px] leading-snug tracking-[.02em]">
          {label}
        </span>
      )}
    </div>
  );
}
