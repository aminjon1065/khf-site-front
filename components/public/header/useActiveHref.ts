"use client";

import { usePathname } from "next/navigation";
import { stripLocale } from "@/lib/i18n/config";

/**
 * Активный пункт меню — по текущему URL, а не по пропу от страницы.
 *
 * Раньше каждая страница сама сообщала шапке `active="news"`. Это работало,
 * только пока шапку рендерила сама страница; после переноса оболочки в layout
 * (чтобы шапка и подвал переживали переход, а не пересобирались заново) такого
 * пропа взяться неоткуда — layout не знает маршрута. Зато его знает браузер.
 *
 * Совпадением считается и вложенный путь: на `/ru/news/storm` подсвечен пункт
 * «Новости», как и на `/ru/news`.
 */
export function useActiveHref(): (href: string) => boolean {
  const path = stripLocale(usePathname());

  return (href: string): boolean => {
    if (href === "/") {
      return path === "/";
    }

    return path === href || path.startsWith(`${href}/`);
  };
}
