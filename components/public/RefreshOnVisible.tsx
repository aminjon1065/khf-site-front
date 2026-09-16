"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * Обновление обстановки при возвращении на вкладку — и честная пометка о том,
 * что показанные данные могли устареть.
 *
 * ISR обновляет страницу на сервере, но уже открытая вкладка продолжает
 * показывать снимок на момент захода. Для портала ЧС устаревший статус
 * обстановки — риск: посетитель вернулся к свернутой вкладке через часы и
 * видит вчерашнее «штатно».
 *
 * Вместо опроса — реакция на одно событие: вкладка снова видима и с прошлого
 * обновления прошло больше окна ISR → тихий router.refresh() (RSC-запрос
 * текущего маршрута; без таймеров и без перезагрузки всей страницы). Пока
 * запрос идёт, рядом со сводкой стоит пометка «данные могли устареть» —
 * четвёртое состояние обстановки наравне с «нет предупреждений», «есть
 * предупреждения» и «данные недоступны». Без JS компонент бездействует:
 * пометки нет, и ничего не ломается.
 */
export default function RefreshOnVisible({
  staleLabel,
  minIntervalMs = 60_000,
}: {
  /** Подпись «данные могли устареть» на языке страницы. */
  staleLabel: string;
  /** Минимальная пауза между обновлениями (окно ISR, сек × 1000). */
  minIntervalMs?: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let lastRefresh = Date.now();
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        return;
      }
      if (Date.now() - lastRefresh < minIntervalMs) {
        return;
      }
      lastRefresh = Date.now();
      // startTransition: `pending` держится ровно столько, сколько идёт
      // серверный запрос, поэтому пометка исчезает сама, когда на экране
      // уже свежие данные, — без таймеров «на глазок».
      startTransition(() => router.refresh());
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [router, minIntervalMs]);

  if (!pending) {
    return null;
  }

  return (
    <span
      role="status"
      className="shrink-0 text-[13px]"
      style={{ color: "var(--hz-warning)" }}
    >
      {staleLabel}
    </span>
  );
}
