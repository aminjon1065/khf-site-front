"use client";

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

export default function TjRiskMap({
  height = 480,
  ...rest
}: {
  regions?: RegionStatus[];
  height?: number;
  showLabels?: boolean;
}) {
  // Reserve the map's final aspect ratio from the very first paint (same
  // W/H formula TjRiskMapImpl uses for its SVG viewBox), so the dynamic-import
  // placeholder, the data-loading placeholder, and the finished map all
  // occupy the same box instead of the page jumping as each stage swaps in.
  const aspectRatio = 960 / Math.round((height / 480) * 560);
  return (
    <div style={{ aspectRatio }}>
      <TjRiskMapImpl height={height} {...rest} />
    </div>
  );
}
