"use client";

import { usePathname } from "next/navigation";
import Link from "@/components/i18n/LocaleLink";
import { localeFromPathname } from "@/lib/i18n/config";
import { getUiStrings } from "@/lib/i18n/ui-strings";
import { muted } from "@/components/public/muted";

/**
 * Хлебные крошки. Последний элемент без href — текущая страница. Клиентский
 * компонент: aria-метку берёт из словаря по локали из URL (usePathname).
 */
export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  const ui = getUiStrings(localeFromPathname(usePathname()));

  return (
    <nav
      aria-label={ui.breadcrumbsAria}
      className="mb-4 flex items-center gap-2 text-[12.5px]"
      style={{ color: muted(55) }}
    >
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-2">
            {last ? (
              // Текущая страница: полный цвет + aria-current (только последний).
              <span aria-current="page" style={{ color: "var(--color-text)" }}>
                {it.label}
              </span>
            ) : it.href ? (
              <Link
                href={it.href}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {it.label}
              </Link>
            ) : (
              // Промежуточная крошка без ссылки (напр. «О нас») — приглушённая.
              <span>{it.label}</span>
            )}
            {!last && <span aria-hidden="true">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
