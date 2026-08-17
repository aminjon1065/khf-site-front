"use client";

import { useEffect } from "react";

/**
 * Когда бренд-ряд уезжает вверх, основная навигация уже прилипла к верху
 * экрана — помечаем шапку `data-compact`, чтобы в строке меню появилась
 * кнопка 112 (на десктопе она живёт в бренд-ряде и иначе скрылась бы).
 *
 * Сама фиксация строки — CSS (`position: sticky` на `.knav`), без JS.
 * Наблюдаем бренд-ряд: когда он целиком уехал, шапка становится компактной.
 */

export function observeHeaderCompact(
  header: Element,
  sentinel: Element,
): () => void {
  if (typeof IntersectionObserver !== "function") {
    return () => {};
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      header.toggleAttribute("data-compact", Boolean(entry) && !entry.isIntersecting);
    },
    { threshold: 0 },
  );

  observer.observe(sentinel);

  return () => observer.disconnect();
}

export default function CompactOnScroll({
  headerSelector = "header.ksite-header",
  sentinelSelector = "header .ksite-brand",
}: {
  headerSelector?: string;
  sentinelSelector?: string;
}) {
  useEffect(() => {
    const header = document.querySelector(headerSelector);
    const sentinel = document.querySelector(sentinelSelector);

    if (!header || !sentinel) {
      return;
    }

    return observeHeaderCompact(header, sentinel);
  }, [headerSelector, sentinelSelector]);

  return null;
}
