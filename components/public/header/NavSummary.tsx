"use client";

import { ChevronDown } from "lucide-react";
import { useActiveHref } from "./useActiveHref";

/**
 * Заголовок выпадающего пункта меню (`<summary>` внутри `<details>`).
 * Считает себя активным, если открыт любой из вложенных разделов.
 */
export default function NavSummary({
  label,
  matches,
}: {
  label: string;
  /** Пути без локали, при которых пункт считается активным. */
  matches: string[];
}) {
  const isActive = useActiveHref();
  const active = matches.some((href) => isActive(href));

  return (
    <summary
      className="inline-flex cursor-pointer list-none items-center gap-[5px] border-none bg-transparent px-[13px] py-[9px] text-sm [font:inherit] [&::-webkit-details-marker]:hidden"
      style={{
        color: active ? "var(--color-accent-700)" : "var(--color-text)",
        borderBottom: `2px solid ${active ? "var(--color-accent)" : "transparent"}`,
      }}
    >
      {label}
      <ChevronDown
        className="transition-transform group-open:rotate-180"
        size={13}
        strokeWidth={1.5}
        aria-hidden="true"
      />
    </summary>
  );
}
