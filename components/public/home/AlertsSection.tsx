import Link from "@/components/i18n/LocaleLink";
import { SectionHeader, muted } from "@/components/public/ui";
import { routes } from "@/lib/routes";
import { levelDotColor } from "@/lib/levels";
import type { ApiAlert } from "@/lib/api";
import type { AlertLevel } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

const tagBackground: Record<AlertLevel, string> = {
  none: "var(--color-neutral-200)",
  info: "var(--hz-info-bg)",
  warning: "var(--hz-warning-bg)",
  danger: "var(--hz-danger-bg)",
  critical: "var(--hz-critical-bg)",
};

/** Действующие предупреждения — карточки с цветной кромкой уровня. */
export default function AlertsSection({
  items,
  home,
  ariaLabel,
}: {
  items: ApiAlert[];
  home: Dictionary["home"];
  ariaLabel: string;
}) {
  return (
    <section aria-label={ariaLabel} className="mt-[52px]">
      <SectionHeader
        as="h2"
        title={home.warnings.title}
        link={{ label: home.warnings.allLink, href: routes.alert }}
      />
      <div className="grid grid-cols-3 gap-[14px] max-[920px]:grid-cols-1">
        {items.map((a) => {
          const color = levelDotColor[a.level as AlertLevel];
          return (
            <Link
              key={a.slug}
              href={`/alerts/${a.slug}`}
              className="blueprint surface-hover-6 flex flex-col gap-2 p-[18px]"
              style={{
                textDecoration: "none",
                color: "inherit",
                borderTop: `3px solid ${color}`,
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="tag font-bold uppercase tracking-[.06em]"
                  style={{
                    background: tagBackground[a.level as AlertLevel],
                    color,
                  }}
                >
                  {a.hazard_label}
                </span>
                <span className="text-[11.5px]" style={{ color: muted(50) }}>
                  {a.status}
                </span>
              </div>
              <span className="text-[19px] font-semibold leading-[1.2] [font-family:var(--font-heading)]">
                {a.title}
              </span>
              <span className="text-[12.5px]" style={{ color: muted(62) }}>
                {a.region}
                {a.datetime ? ` · ${a.datetime}` : ""}
              </span>
              <span
                className="text-[13px] leading-[1.5]"
                style={{ color: muted(72) }}
              >
                {a.summary}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
