"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { localeFromPathname, withLocale } from "@/lib/i18n/config";
import { startNavigationProgress } from "@/lib/navigation-progress";

type LinkProps = ComponentProps<typeof NextLink>;

/**
 * Замена `next/link`, которая автоматически добавляет к внутренним ссылкам
 * префикс активной локали (/ru, /tj, /en). Локаль определяется из текущего URL
 * через usePathname(), поэтому существующие `href={routes.x}` работают без правок:
 * достаточно поменять импорт `next/link` → этот компонент.
 *
 * Внешние ссылки (http/tel/mailto/якоря) и уже локализованные пути не трогаются.
 * Объектные href (UrlObject) пробрасываются как есть.
 *
 * Через `onNavigate` (App Router не отдаёт router-события) сообщаем полосе
 * прогресса, что начался переход — см. components/public/NavigationProgress.tsx.
 */
export default function LocaleLink({
  href,
  prefetch = false,
  onNavigate,
  ...rest
}: LinkProps) {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const localized = typeof href === "string" ? withLocale(locale, href) : href;

  return (
    <NextLink
      href={localized}
      prefetch={prefetch}
      onNavigate={(event) => {
        // У события `onNavigate` из типов Next есть только preventDefault(),
        // без defaultPrevented — поэтому отмену отслеживаем сами: если
        // переход отменили, полосу показывать не за чем (её нечему завершить).
        let prevented = false;

        onNavigate?.({
          preventDefault: () => {
            prevented = true;
            event.preventDefault();
          },
        });

        if (!prevented) {
          startNavigationProgress();
        }
      }}
      {...rest}
    />
  );
}
