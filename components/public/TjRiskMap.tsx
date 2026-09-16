"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { RegionStatus } from "@/lib/types";

// E-2: d3-geo + topojson-client (~15-18 KB gzip) only matter on the 4
// routes that actually render this map (home, /map, alerts list/detail).
// Deliberately NOT `ssr: false`: tried it first, and on this Next 16 +
// Turbopack build it made the dynamic boundary never resolve client-side
// at all (empirically verified — the outer `loading:` fallback below
// stayed on screen forever, confirmed via a clean production build/serve
// with no console errors). Dropping `ssr: false` fixes that and costs
// nothing here: TjRiskMapImpl's own SSR output is already just its
// `!built` loading placeholder (its state starts null server-side too),
// so prerendering it changes nothing visible — the code-splitting (the
// actual point of this change) works either way.
const TjRiskMapImpl = dynamic(() => import("./TjRiskMapImpl"), {
  loading: () => null,
});

/**
 * Отложенный монтаж карты до приближения к viewport.
 *
 * На главной карта — секция ниже первого экрана, но без этого флага
 * dynamic-import скачивает чанк d3-geo и считает геометрию сразу при
 * гидратации, отнимая канал у LCP. IntersectionObserver с запасом
 * (rootMargin 600px) подключает карту до того, как она появится на экране,
 * поэтому пользователь не видит «пусто → карта»: зарезервированный
 * аспект (внешний div) держит геометрию, SSR-список регионов рядом живёт
 * вне этого компонента.
 *
 * На /map и страницах предупреждений карта — главное содержимое: там
 * `lazy` не передаётся, чанк грузится сразу.
 */
function LazyGate({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(!active);

  useEffect(() => {
    if (!active || inView || !ref.current) {
      return;
    }
    const el = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [active, inView]);

  return <div ref={ref}>{inView ? children : null}</div>;
}

export default function TjRiskMap({
  height = 480,
  lazy = false,
  ...rest
}: {
  regions?: RegionStatus[];
  height?: number;
  /** Монтировать карту только при приближении к viewport (не для /map). */
  lazy?: boolean;
  showLabels?: boolean;
}) {
  // Reserve the map's final aspect ratio from the very first paint (same
  // W/H formula TjRiskMapImpl uses for its SVG viewBox), so the dynamic-import
  // placeholder, the data-loading placeholder, and the finished map all
  // occupy the same box instead of the page jumping as each stage swaps in.
  const aspectRatio = 960 / Math.round((height / 480) * 560);
  return (
    <div style={{ aspectRatio }}>
      <LazyGate active={lazy}>
        <TjRiskMapImpl height={height} {...rest} />
      </LazyGate>
    </div>
  );
}
