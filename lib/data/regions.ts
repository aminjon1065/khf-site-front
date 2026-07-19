import type { AlertState, AlertLevel, RegionKey, RegionStatus } from "@/lib/types";
import {
  regionOrder,
  regionName,
  levelStatusText,
  levelBadge,
  levelDotColor,
} from "@/lib/levels";

// Уровни и число активных событий по регионам в зависимости от глобального
// режима оповещения (демо; в проде — из CMS/API уведомлений).
const levelsByState: Record<AlertState, Record<RegionKey, AlertLevel>> = {
  critical: { khatlon: "critical", rrp: "warning", sughd: "info", gbao: "none", dushanbe: "none" },
  warning: { khatlon: "warning", rrp: "info", sughd: "none", gbao: "info", dushanbe: "none" },
  calm: { khatlon: "none", rrp: "none", sughd: "none", gbao: "none", dushanbe: "none" },
};

const countsByState: Record<AlertState, Record<RegionKey, number>> = {
  critical: { khatlon: 4, rrp: 2, sughd: 1, gbao: 0, dushanbe: 0 },
  warning: { khatlon: 2, rrp: 1, sughd: 0, gbao: 1, dushanbe: 0 },
  calm: { khatlon: 0, rrp: 0, sughd: 0, gbao: 0, dushanbe: 0 },
};

export function regionsForState(state: AlertState): RegionStatus[] {
  const levels = levelsByState[state];
  const counts = countsByState[state];
  return regionOrder.map((k) => ({
    key: k,
    name: regionName[k],
    level: levels[k],
    count: counts[k],
    statusText: levelStatusText[levels[k]],
  }));
}

export interface RegionRow {
  name: string;
  statusText: string;
  badge: string;
  color: string;
}

export function regionRowsForState(state: AlertState): RegionRow[] {
  return regionsForState(state).map((r) => ({
    name: r.name,
    statusText: r.statusText,
    badge: levelBadge[r.level],
    color: levelDotColor[r.level],
  }));
}
