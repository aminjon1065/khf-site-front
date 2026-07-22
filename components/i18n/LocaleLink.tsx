"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { localeFromPathname, withLocale } from "@/lib/i18n/config";

type LinkProps = ComponentProps<typeof NextLink>;

/**
 * Замена `next/link`, которая автоматически добавляет к внутренним ссылкам
 * префикс активной локали (/ru, /tj, /en). Локаль определяется из текущего URL
 * через usePathname(), поэтому существующие `href={routes.x}` работают без правок:
 * достаточно поменять импорт `next/link` → этот компонент.
 *
 * Внешние ссылки (http/tel/mailto/якоря) и уже локализованные пути не трогаются.
 * Объектные href (UrlObject) пробрасываются как есть.
 */
export default function LocaleLink({ href, ...rest }: LinkProps) {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const localized = typeof href === "string" ? withLocale(locale, href) : href;

  return <NextLink href={localized} {...rest} />;
}
