"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { onNavigationStart } from "@/lib/navigation-progress";

/**
 * Полоса прогресса вверху страницы во время перехода между маршрутами.
 *
 * Старт — из `onNavigate` у `<Link>` (см. components/i18n/LocaleLink.tsx),
 * финиш — по смене pathname/searchParams, то есть когда новый маршрут уже
 * отрисован. Полоса всегда в DOM и позиционирована фиксированно, поэтому не
 * двигает вёрстку (предупреждение из документации про layout shift).
 *
 * Состояние держим не в React-стейте, а прямо в `data-state` узла: индикатор —
 * внешняя по отношению к React система (как таймеры и подписки), перерисовывать
 * дерево ради смены атрибута незачем, а заодно не нарушается правило
 * `react-hooks/set-state-in-effect`.
 *
 * Задержка перед показом: если переход завершился быстрее 120 мс (обычный
 * случай для предзагруженных статических маршрутов), полоса не мигает вообще.
 */
const SHOW_DELAY_MS = 120;
const HIDE_DELAY_MS = 320;

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const barRef = useRef<HTMLDivElement | null>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearTimers = () => {
      if (showTimer.current) {
        clearTimeout(showTimer.current);
        showTimer.current = null;
      }
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
    };

    const setState = (value: "idle" | "loading" | "done") => {
      if (barRef.current) {
        barRef.current.dataset.state = value;
      }
    };

    const unsubscribe = onNavigationStart(() => {
      clearTimers();
      showTimer.current = setTimeout(() => setState("loading"), SHOW_DELAY_MS);
    });

    return () => {
      unsubscribe();
      clearTimers();
    };
  }, []);

  // Маршрут сменился — переход завершён.
  useEffect(() => {
    if (showTimer.current) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }

    const bar = barRef.current;

    if (!bar) {
      return;
    }

    if (bar.dataset.state === "loading") {
      bar.dataset.state = "done";
      hideTimer.current = setTimeout(() => {
        if (barRef.current) {
          barRef.current.dataset.state = "idle";
        }
      }, HIDE_DELAY_MS);
    }

    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
    };
  }, [pathname, searchParams]);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="nav-progress"
      data-state="idle"
      data-testid="nav-progress"
    />
  );
}
