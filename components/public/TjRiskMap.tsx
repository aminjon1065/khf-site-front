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
  loading: () => (
    <div
      aria-busy="true"
      style={{ height: 480, display: "grid", placeItems: "center" }}
    />
  ),
});

export default function TjRiskMap(props: {
  regions?: RegionStatus[];
  height?: number;
  showLabels?: boolean;
}) {
  return <TjRiskMapImpl {...props} />;
}
