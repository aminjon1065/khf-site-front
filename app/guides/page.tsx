import Link from "next/link";
import PageShell from "@/components/public/PageShell";
import { muted } from "@/components/public/ui";
import { fetchInstructions } from "@/lib/api";
import { routes } from "@/lib/routes";
import { hero, emergency, priorityCta, topicNum } from "./content";

export const metadata = { title: "Безопасность населения" };

// ISR: каталог инструкций перечитывается из CMS не чаще раза в минуту.
export const revalidate = 60;

// Пресентационное «оформление» приоритетных плиток (данные — из CMS).
const tileChrome = [
  { kicker: "Главный риск республики", kickerColor: "var(--color-accent-300)", accent: true },
  { kicker: "Приоритетная инструкция", kickerColor: "var(--hz-warning)", accent: false },
  { kicker: "Приоритетная инструкция", kickerColor: "var(--hz-info)", accent: false },
];

export default async function GuidesPage() {
  const all = await fetchInstructions();
  const flagged = all.filter((i) => i.priority).slice(0, 3);
  const priorityItems = flagged.length > 0 ? flagged : all.slice(0, 3);
  const tileSlugs = new Set(priorityItems.map((i) => i.slug));
  const catalogItems = all.filter((i) => !tileSlugs.has(i.slug));

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
      {priorityItems.length > 0 && (
        <section aria-label="Основные угрозы" className="mt-7">
          <div className="grid grid-cols-3 gap-[14px] max-[920px]:grid-cols-1">
            {priorityItems.map((t, i) => {
              const chrome = tileChrome[i] ?? tileChrome[tileChrome.length - 1];
              return (
                <Link
                  key={t.slug}
                  href={routes.guide(t.slug)}
                  className={`blueprint flex flex-col gap-2.5 p-[22px] ${
                    chrome.accent ? "accent-900-hover" : "surface-hover"
                  }`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    ...(chrome.accent
                      ? { background: "var(--color-accent-900)" }
                      : {}),
                  }}
                >
                  <span
                    className="text-[10.5px] uppercase tracking-[.1em]"
                    style={{ color: chrome.kickerColor }}
                  >
                    {chrome.kicker}
                  </span>
                  <span
                    className="text-2xl font-semibold [font-family:var(--font-heading)]"
                    style={chrome.accent ? { color: "#fff" } : undefined}
                  >
                    {t.title}
                  </span>
                  <span
                    className={`text-[13px] leading-[1.5] ${
                      chrome.accent ? "text-white/75" : ""
                    }`}
                    style={chrome.accent ? undefined : { color: muted(65) }}
                  >
                    {t.summary}
                  </span>
                  <span
                    className="mt-auto text-[13px]"
                    style={{
                      color: chrome.accent
                        ? "var(--color-accent-200)"
                        : "var(--color-accent-700)",
                    }}
                  >
                    {priorityCta}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Все инструкции — каталог тем */}
      <section aria-label="Все инструкции" className="mt-9">
        <div className="mb-[18px] flex items-baseline gap-[14px] border-b border-[var(--color-divider)] pb-2.5">
          <h2 className="m-0 text-[23px] uppercase tracking-[.02em]">
            Все инструкции
          </h2>
          <span className="text-xs" style={{ color: muted(50) }}>
            {catalogItems.length} тем
          </span>
        </div>
        {catalogItems.length > 0 ? (
          <div className="grid grid-cols-3 gap-[14px] max-[920px]:grid-cols-1">
            {catalogItems.map((g, i) => (
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
                  {g.summary}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-8 text-[14px]" style={{ color: muted(60) }}>
            Инструкции пока не опубликованы.
          </p>
        )}
      </section>
    </PageShell>
  );
}
