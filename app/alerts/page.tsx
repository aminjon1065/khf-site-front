import Link from "next/link";
import PageShell from "@/components/public/PageShell";
import { Breadcrumbs, muted } from "@/components/public/ui";
import TjRiskMap from "@/components/public/TjRiskMap";
import { levelDotColor } from "@/lib/levels";
import { alert } from "./content";
import ShareButton from "./ShareButton";

export const metadata = { title: "Селевая опасность в Хатлонской области" };

export default function AlertPage() {
  const { header, actions, official, history, zone, emergency, related } = alert;

  return (
    <PageShell
      active=""
      mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-6 max-[920px]:px-4"
    >
      <Breadcrumbs items={alert.breadcrumbs} />

      {/* Шапка предупреждения: уровень / статус / метаданные */}
      <section
        aria-label="Предупреждение"
        className="blueprint mt-5 flex flex-col gap-[14px] px-[26px] py-6"
        style={{ borderTop: "4px solid var(--hz-warning)" }}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className="tag text-xs font-bold uppercase tracking-[.08em]"
            style={{ background: "var(--hz-warning)", color: "var(--color-bg)", padding: "5px 12px" }}
          >
            {header.levelLabel}
          </span>
          <span
            className="tag font-semibold"
            style={{ background: "var(--hz-warning-bg)", color: "var(--hz-warning)" }}
          >
            {header.statusLabel}
          </span>
          <span className="tag tag-neutral">{header.hazardLabel}</span>
          <span className="flex-1" />
          <ShareButton idle={header.share.idle} copied={header.share.copied} />
        </div>

        <h1 className="m-0 text-[32px] leading-[1.12]">{header.title}</h1>

        <div className="flex flex-wrap gap-6 text-[13px]" style={{ color: muted(62) }}>
          {header.meta.map((m) => (
            <span key={m.label}>
              <strong style={{ color: "var(--color-text)" }}>{m.label}</strong> {m.value}
            </span>
          ))}
        </div>
      </section>

      <div className="mt-7 grid grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)] items-start gap-7 max-[920px]:grid-cols-1">
        {/* Основная колонка */}
        <div className="min-w-0">
          {/* Что делать сейчас — выше официального текста */}
          <section
            aria-label="Что делать сейчас"
            className="blueprint px-6 py-[22px]"
            style={{ background: "color-mix(in srgb,var(--hz-warning) 8%,transparent)" }}
          >
            <h2 className="mt-0 mb-[14px] text-[22px] uppercase tracking-[.02em]">{actions.title}</h2>
            <ol className="m-0 flex list-none flex-col gap-3 p-0">
              {actions.steps.map((step) => (
                <li key={step.n} className="flex items-start gap-[14px]">
                  <span
                    className="min-w-[28px] text-xl font-semibold [font-family:var(--font-heading)]"
                    style={{ color: "var(--hz-warning)" }}
                  >
                    {step.n}
                  </span>
                  <span className="text-[14.5px] leading-[1.5]">
                    {step.parts.map((part, i) =>
                      typeof part === "string" ? (
                        <span key={i}>{part}</span>
                      ) : (
                        <a
                          key={i}
                          href={`tel:${part.tel}`}
                          className="font-bold"
                          style={{ color: "var(--hz-danger)" }}
                        >
                          {part.label}
                        </a>
                      )
                    )}
                  </span>
                </li>
              ))}
            </ol>
            <Link href={actions.guideCta.href} className="btn btn-secondary mt-4">
              {actions.guideCta.label}
            </Link>
          </section>

          {/* Официальная информация */}
          <section aria-label="Официальное описание" className="mt-7 max-w-[70ch]">
            <h2 className="text-[22px] uppercase tracking-[.02em]">{official.title}</h2>
            {official.paragraphs.map((p, i) => (
              <p key={i} className="text-[15px] leading-[1.65]">
                {p}
              </p>
            ))}
          </section>

          {/* История обновлений — таймлайн */}
          <section aria-label="История обновлений" className="mt-7">
            <h2 className="text-[22px] uppercase tracking-[.02em]">{history.title}</h2>
            <div className="flex flex-col border-l border-[var(--color-divider)]">
              {history.entries.map((e, i) => (
                <div key={i} className="relative py-2.5 pl-5">
                  <span
                    className="absolute left-[-4.5px] top-4 h-2 w-2 rounded-full"
                    style={{ background: levelDotColor[e.dot] }}
                  />
                  <span className="text-xs" style={{ color: muted(55) }}>
                    {e.datetime}
                  </span>
                  <p className="mt-0.5 mb-0 text-sm">{e.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Боковая колонка */}
        <aside className="flex min-w-0 flex-col gap-5">
          {/* Карта зоны действия */}
          <div className="blueprint p-3">
            <h6 className="mx-1.5 mt-1 mb-2" style={{ color: muted(55) }}>
              {zone.title}
            </h6>
            <TjRiskMap regions={zone.regions} height={300} showLabels={false} />
            <p className="mx-1.5 mt-2 mb-1 text-xs" style={{ color: muted(55) }}>
              {zone.caption}
            </p>
          </div>

          {/* Экстренная помощь · 112 */}
          <div className="blueprint flex flex-col gap-2 p-[18px]">
            <h6 className="m-0" style={{ color: muted(55) }}>
              {emergency.title}
            </h6>
            <a
              href={emergency.phone.href}
              className="text-[26px] font-semibold no-underline [font-family:var(--font-heading)]"
              style={{ color: "var(--hz-critical)" }}
            >
              {emergency.phone.label}
            </a>
            <span className="text-[12.5px]" style={{ color: muted(62) }}>
              {emergency.regional.text}
              <br />
              <a href={emergency.regional.phoneHref} style={{ color: "var(--color-accent-700)" }}>
                {emergency.regional.phoneLabel}
              </a>
            </span>
          </div>

          {/* Связанные предупреждения */}
          <div>
            <h6 className="m-0 mb-2.5" style={{ color: muted(55) }}>
              {related.title}
            </h6>
            {related.items.map((it, i) => (
              <Link
                key={i}
                href={it.href}
                className="row-link block border-b border-[var(--color-divider)] py-2.5"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="flex items-center gap-2 text-[11px]">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: levelDotColor[it.dot] }}
                  />
                  <span style={{ color: muted(55) }}>{it.kicker}</span>
                </span>
                <span className="mt-[3px] block text-[15px] font-semibold [font-family:var(--font-heading)]">
                  {it.title}
                </span>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
