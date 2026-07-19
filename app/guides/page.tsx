import Link from "next/link";
import PageShell from "@/components/public/PageShell";
import { muted } from "@/components/public/ui";
import { hero, emergency, priority, priorityCta, catalog, topicNum } from "./content";
import { routes } from "@/lib/routes";

export const metadata = { title: "Безопасность населения" };

export default function GuidesPage() {
  return (
    <PageShell
      active="guides"
      mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-8 max-[920px]:px-4"
    >
      {/* Заголовок + единый номер 112 */}
      <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)] items-end gap-8 border-b border-[var(--color-divider)] pb-5 max-[920px]:grid-cols-1">
        <div>
          <h1 className="mt-0 mb-2.5 text-[36px] uppercase tracking-[.02em]">
            {hero.title}
          </h1>
          <p
            className="m-0 max-w-[60ch] text-[15px] leading-[1.6]"
            style={{ color: muted(70) }}
          >
            {hero.lead}
          </p>
        </div>
        <div className="blueprint flex items-center gap-3 px-4 py-[14px]">
          <span
            className="text-2xl font-semibold [font-family:var(--font-heading)]"
            style={{ color: "var(--hz-critical)" }}
          >
            {emergency.number}
          </span>
          <span
            className="text-[12.5px] leading-[1.45]"
            style={{ color: muted(65) }}
          >
            {emergency.text}
          </span>
        </div>
      </div>

      {/* Основные угрозы — приоритетные плитки */}
      <section aria-label="Основные угрозы" className="mt-7">
        <div className="grid grid-cols-3 gap-[14px] max-[920px]:grid-cols-1">
          {priority.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`blueprint flex flex-col gap-2.5 p-[22px] ${
                t.accent ? "accent-900-hover" : "surface-hover"
              }`}
              style={{
                textDecoration: "none",
                color: "inherit",
                ...(t.accent ? { background: "var(--color-accent-900)" } : {}),
              }}
            >
              <span
                className="text-[10.5px] uppercase tracking-[.1em]"
                style={{ color: t.kickerColor }}
              >
                {t.kicker}
              </span>
              <span
                className="text-2xl font-semibold [font-family:var(--font-heading)]"
                style={t.accent ? { color: "#fff" } : undefined}
              >
                {t.title}
              </span>
              <span
                className={`text-[13px] leading-[1.5] ${
                  t.accent ? "text-white/75" : ""
                }`}
                style={t.accent ? undefined : { color: muted(65) }}
              >
                {t.desc}
              </span>
              <span
                className="mt-auto text-[13px]"
                style={{
                  color: t.accent
                    ? "var(--color-accent-200)"
                    : "var(--color-accent-700)",
                }}
              >
                {priorityCta}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Все инструкции — каталог тем */}
      <section aria-label="Все инструкции" className="mt-9">
        <div className="mb-[18px] flex items-baseline gap-[14px] border-b border-[var(--color-divider)] pb-2.5">
          <h2 className="m-0 text-[23px] uppercase tracking-[.02em]">
            {catalog.title}
          </h2>
          <span className="text-xs" style={{ color: muted(50) }}>
            {catalog.count}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-[14px] max-[920px]:grid-cols-1">
          {catalog.topics.map((g, i) => (
            <Link
              key={g.slug}
              href={routes.guide(g.slug)}
              className="blueprint surface-hover flex flex-col gap-2 p-4"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className="text-[13px] font-semibold [font-family:var(--font-heading)]"
                  style={{ color: muted(40) }}
                >
                  {topicNum(i)}
                </span>
                <span className="text-[17px] font-semibold [font-family:var(--font-heading)]">
                  {g.title}
                </span>
              </span>
              <span
                className="text-[12.5px] leading-[1.5]"
                style={{ color: muted(62) }}
              >
                {g.desc}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
