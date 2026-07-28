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
 *
 * `duotone` — синий фирменный оттенок (`.duotone::after`, globals.css) поверх
 * реального фото. Применяется ТОЛЬКО к фото: наложенный поверх логотипа-заглушки
 * тот же слой перекрашивал бы сам логотип — раньше это был класс на обёртке
 * снаружи ImageSlot, слепо красивший оба состояния одинаково.
 */
export function ImageSlot({
  src,
  alt,
  label,
  fit = "cover",
  sizes = "(max-width: 920px) 100vw, 380px",
  preload = false,
  className = "",
  style,
  eager = false,
  duotone = false,
}: {
  src?: string;
  alt?: string;
  label?: string;
  fit?: "cover" | "contain";
  /** Подсказка браузеру о реальном размере слота в вёрстке. */
  sizes?: string;
  /** LCP-изображение: попросить браузер загрузить его приоритетно. */
  preload?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Above-the-fold usage (e.g. a hero card): skip lazy-loading. */
  eager?: boolean;
  /** Фирменный синий оттенок поверх реального фото (не применяется к логотипу). */
  duotone?: boolean;
}) {
  const locale = localeFromPathname(usePathname());
  const ui = getUiStrings(locale);

  if (src) {
    return (
      <span
        className={`relative block h-full w-full ${duotone ? "duotone" : ""} ${className}`}
        style={style}
      >
        <Image
          src={src}
          alt={alt ?? label ?? ""}
          fill
          sizes={sizes}
          preload={preload}
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
