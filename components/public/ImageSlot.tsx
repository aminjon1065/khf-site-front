"use client";

import type { CSSProperties } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { localeFromPathname } from "@/lib/i18n/config";
import { getUiStrings } from "@/lib/i18n/ui-strings";
import { muted } from "@/components/public/muted";

/**
 * Слот изображения. С `src` — реальное фото (next/image, fill + object-fit),
 * без него — логотип Комитета на нейтральном фоне (заменяется фото пресс-службы
 * при загрузке в CMS). Клиентский компонент: локаль (для логотипа и запасной
 * aria-метки) берёт из URL.
 */
export function ImageSlot({
  src,
  alt,
  label,
  fit = "cover",
  className = "",
  style,
  eager = false,
}: {
  src?: string;
  alt?: string;
  label?: string;
  fit?: "cover" | "contain";
  className?: string;
  style?: CSSProperties;
  /** Above-the-fold usage (e.g. a hero card): skip lazy-loading. */
  eager?: boolean;
}) {
  const locale = localeFromPathname(usePathname());
  const ui = getUiStrings(locale);

  if (src) {
    return (
      <span
        className={`relative block h-full w-full ${className}`}
        style={style}
      >
        <Image
          src={src}
          alt={alt ?? label ?? ""}
          fill
          sizes="(max-width: 920px) 100vw, 380px"
          style={{ objectFit: fit }}
          loading={eager ? "eager" : undefined}
        />
      </span>
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
      <Image
        src={`/assets/logo-kchs-${locale}.webp`}
        alt=""
        width={512}
        height={506}
        style={{ width: "38%", maxWidth: 88, height: "auto" }}
      />
      {label && (
        <span className="text-[11.5px] leading-snug tracking-[.02em]">
          {label}
        </span>
      )}
    </div>
  );
}
