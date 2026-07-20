import Link from "next/link";
import PageShell from "@/components/public/PageShell";
import { Breadcrumbs, muted } from "@/components/public/ui";
import TjRiskMap from "@/components/public/TjRiskMap";
import { fetchAlerts, fetchAlertsActive } from "@/lib/api";
import { levelDotColor } from "@/lib/levels";
import { routes } from "@/lib/routes";
import type { AlertLevel, RegionStatus } from "@/lib/types";

export const metadata = { title: "Предупреждения" };
export const revalidate = 60;

const stateChrome: Record<
  "calm" | "warning" | "critical",
  { border: string; label: string; text: string }
> = {
  calm: {
    border: "var(--hz-success)",
    label: "Обстановка штатная",
    text: "Действующих предупреждений по республике нет. Следите за официальными сообщениями Комитета.",
  },
  warning: {
    border: "var(--hz-warning)",
    label: "Действуют предупреждения",
    text: "По ряду регионов объявлен повышенный уровень опасности. Соблюдайте меры предосторожности.",
  },
  critical: {
    border: "var(--hz-critical)",
    label: "Критическая обстановка",
    text: "В отдельных регионах действует критический уровень опасности. Следуйте указаниям спасательных служб.",
  },
};

export default async function AlertsPage() {
  const [alerts, active] = await Promise.all([
    fetchAlerts(),
    fetchAlertsActive(),
  ]);

  const regions: RegionStatus[] = active.regions.map((r) => ({
    key: r.key as RegionStatus["key"],
    name: r.name,
    level: r.level,
    count: r.count,
    statusText: r.statusText,
  }));

  const chrome = stateChrome[active.state];

  return (
    <PageShell
      active="map"
      mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-6 max-[920px]:px-4"
    >
      <Breadcrumbs
        items={[
          { label: "Главная", href: routes.home },
          { label: "Предупреждения" },
        ]}
      />

      {/* Сводка обстановки */}
      <section
        aria-label="Обстановка"
        className="blueprint mt-5 flex flex-col gap-2 px-[26px] py-5"
        style={{ borderTop: `4px solid ${chrome.border}` }}
      >
        <div className="flex items-baseline gap-3">
          <h1 className="m-0 text-[32px] leading-[1.12]">Предупреждения</h1>
          <span className="text-xs" style={{ color: muted(50) }}>
            {active.count > 0
              ? `${active.count} действующих`
              : "нет действующих"}
          </span>
        </div>
        <p
          className="m-0 max-w-[70ch] text-[14px] leading-[1.55]"
          style={{ color: muted(70) }}
        >
          <strong style={{ color: "var(--color-text)" }}>{chrome.label}.</strong>{" "}
          {chrome.text}
        </p>
      </section>

      <div className="mt-7 grid grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)] items-start gap-7 max-[920px]:grid-cols-1">
        {/* Список активных предупреждений */}
        <div className="min-w-0" role="feed" aria-label="Активные предупреждения">
          {alerts.length > 0 ? (
            alerts.map((a) => (
              <article
                key={a.slug}
                className="flex flex-col gap-2 border-b border-[var(--color-divider)] py-5"
                style={{ borderLeft: `3px solid ${levelDotColor[a.level as AlertLevel]}`, paddingLeft: 16 }}
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className="tag text-xs font-semibold uppercase tracking-[.06em]"
                    style={{
                      background: levelDotColor[a.level as AlertLevel],
                      color: "var(--color-bg)",
                    }}
                  >
                    {a.level_label}
                  </span>
                  <span
                    className="tag font-semibold"
                    style={{
                      background: "var(--hz-warning-bg)",
                      color: "var(--hz-warning)",
                    }}
                  >
                    {a.status}
                  </span>
                  <span className="tag tag-neutral">{a.hazard_label}</span>
                  <span className="flex-1" />
                  {a.datetime && (
                    <span className="text-xs" style={{ color: muted(52) }}>
                      {a.datetime}
                    </span>
                  )}
                </div>
                <h2 className="m-0 text-xl leading-[1.2]">
                  <Link
                    href={`/alerts/${a.slug}`}
                    className="text-inherit no-underline hover:text-[color:var(--color-accent-700)]"
                  >
                    {a.title}
                  </Link>
                </h2>
                <p
                  className="m-0 text-[13.5px] leading-[1.55]"
                  style={{ color: muted(65) }}
                >
                  {a.summary}
                </p>
                <span className="text-[12.5px]" style={{ color: muted(55) }}>
                  {a.region}
                </span>
              </article>
            ))
          ) : (
            <div className="border border-dashed border-[var(--color-divider)] px-6 py-14 text-center">
              <p className="m-0 mb-1 text-lg font-semibold [font-family:var(--font-heading)]">
                Действующих предупреждений нет
              </p>
              <p className="m-0 text-[13px]" style={{ color: muted(60) }}>
                Обстановка на территории республики штатная.
              </p>
            </div>
          )}
        </div>

        {/* Боковая колонка: карта + 112 */}
        <aside className="flex min-w-0 flex-col gap-5">
          <div className="blueprint p-3">
            <h6 className="mx-1.5 mt-1 mb-2" style={{ color: muted(55) }}>
              Обстановка по регионам
            </h6>
            <TjRiskMap regions={regions} height={300} showLabels={false} />
            <Link
              href={routes.map}
              className="btn btn-secondary mx-1.5 mt-2 text-[13px]"
            >
              Открыть карту рисков
            </Link>
          </div>

          <div className="blueprint flex flex-col gap-2 p-[18px]">
            <h6 className="m-0" style={{ color: muted(55) }}>
              Экстренная помощь
            </h6>
            <a
              href="tel:112"
              className="text-[26px] font-semibold no-underline [font-family:var(--font-heading)]"
              style={{ color: "var(--hz-critical)" }}
            >
              112
            </a>
            <span className="text-[12.5px]" style={{ color: muted(62) }}>
              Единый номер экстренных служб, круглосуточно
            </span>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
