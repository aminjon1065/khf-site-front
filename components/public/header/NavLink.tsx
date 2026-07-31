"use client";

import type { ComponentProps } from "react";
import Link from "@/components/i18n/LocaleLink";
import { useActiveHref } from "./useActiveHref";

/**
 * Пункт главного меню: обычная локализованная ссылка, которая сама помечает
 * себя `aria-current="page"`, когда открыт её раздел. Подсветка стилями —
 * через `.knav [aria-current]` в globals.css.
 */
export default function NavLink({
  href,
  match,
  ...rest
}: ComponentProps<typeof Link> & {
  /** Путь без локали для сравнения (если href уже локализован). */
  match: string;
}) {
  const isActive = useActiveHref();

  return (
    <Link
      href={href}
      aria-current={isActive(match) ? "page" : undefined}
      {...rest}
    />
  );
}
