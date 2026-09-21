import {
  Activity,
  Flame,
  Mountain,
  MountainSnow,
  ShieldAlert,
  Snowflake,
  ThermometerSun,
  Waves,
  Wind,
} from "lucide-react";

/**
 * Иконка типа опасности. `hazard_icon` в API — закрытый перечень имён Lucide,
 * поэтому компоненты импортируются поимённо (дерево тряхнётся) вместо
 * динамического импорта всей библиотеки. Неизвестное или пустое значение
 * даёт нейтральный знак, а не пустоту в вёрстке.
 */
const HAZARD_ICONS = {
  activity: Activity,
  flame: Flame,
  mountain: Mountain,
  "mountain-snow": MountainSnow,
  snowflake: Snowflake,
  "thermometer-sun": ThermometerSun,
  waves: Waves,
  wind: Wind,
} as const;

export function HazardIcon({
  name,
  size = 22,
  tone = "var(--color-accent-700)",
}: {
  name: string | null;
  size?: number;
  tone?: string;
}) {
  const Icon =
    (name && HAZARD_ICONS[name as keyof typeof HAZARD_ICONS]) || ShieldAlert;

  return (
    <Icon size={size} strokeWidth={1.5} aria-hidden="true" style={{ color: tone }} />
  );
}

export function QuickIcon({ name }: { name: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--color-accent-700)",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "waves":
      return (
        <svg {...common}>
          <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
          <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
          <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        </svg>
      );
    case "aid":
      return (
        <svg {...common}>
          <path d="M8 3.1V7a4 4 0 0 0 8 0V3.1M12 12h.01M12 12a4 4 0 0 1 4 4v5H8v-5a4 4 0 0 1 4-4Z" />
          <path d="M4 21h16" />
        </svg>
      );
    case "map":
      return (
        <svg {...common}>
          <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
          <path d="M15 5.764v15M9 3.236v15" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
        </svg>
      );
    case "message":
      return (
        <svg {...common}>
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
          <path d="M12 8v4M12 15h.01" />
        </svg>
      );
    default:
      return null;
  }
}
