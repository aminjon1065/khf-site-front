import Link from "@/components/i18n/LocaleLink";
import PageShell from "@/components/public/PageShell";
import { ImageSlot, muted } from "@/components/public/ui";
import type { Metadata } from "next";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSos, type AppFeature } from "./content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return { title: getDictionary(toLocale((await params).locale)).pages.meta.sos };
}

/** Иконка возможности приложения (26×26, stroke задаётся токеном). */
function FeatureIcon({ name, color }: { name: AppFeature["icon"]; color: string }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "sos":
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M10.268 21a2 2 0 0 0 3.464 0" />
          <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M12 7v14" />
          <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
        </svg>
      );
    default:
      return null;
  }
}

export default async function SosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = toLocale((await params).locale);
  const sos = getSos(locale);
  const { pages } = getDictionary(locale);
  const { hero, features, how } = sos;

  return (
    <PageShell active="" locale={locale}>
      {/* Hero: описание + кнопки магазинов + макет телефона */}
      <section
        aria-label={pages.sosPage.app}
        className="grid grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)] items-center gap-10 max-[920px]:grid-cols-1"
      >
        <div className="min-w-0">
          <span
            className="text-[11px] uppercase tracking-[.12em]"
            style={{ color: "var(--color-accent-700)" }}
          >
            {hero.kicker}
          </span>
          <h1 className="mb-4 mt-3 text-[46px] uppercase leading-[1.05]">
            {hero.titleLines[0]}
            <br />
            {hero.titleLines[1]}
          </h1>
          <p className="mb-5 max-w-[56ch] text-base leading-[1.6]" style={{ color: muted(75) }}>
            {hero.lead}
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={hero.appStore.href}
              target="_blank"
              rel="noopener"
              className="btn btn-primary blueprint"
              style={{ gap: 9, fontSize: 15, padding: "11px 20px" }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
                aria-hidden="true"
              >
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8.98-.2 1.92-.87 3.16-.78 1.49.12 2.61.71 3.35 1.78-3.08 1.85-2.35 5.9.47 7.03-.56 1.47-1.28 2.92-2.06 4.14ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z" />
              </svg>
              {hero.appStore.label}
            </a>
            <a
              href={hero.googlePlay.href}
              target="_blank"
              rel="noopener"
              className="btn btn-secondary"
              style={{ gap: 9, fontSize: 15, padding: "11px 20px" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
                aria-hidden="true"
              >
                <path d="M3.61 1.81 13.79 12 3.6 22.19c-.36-.19-.6-.56-.6-1.04V2.85c0-.48.25-.85.61-1.04Zm11.6 8.77L5.85 1.22l11.36 6.53-2 2.83Zm2.87 4.06-2.15-3.05 2.15-3.04 3.13 1.8c.95.55.95 1.94 0 2.49l-3.13 1.8ZM5.85 22.78l9.36-9.36 2 2.83-11.36 6.53Z" />
              </svg>
              {hero.googlePlay.label}
            </a>
          </div>
          <p className="mt-[14px] text-[12.5px]" style={{ color: muted(55) }}>
            {hero.finePrint}
          </p>
        </div>

        <div className="flex justify-center">
          <div className="blueprint w-[250px] p-2.5" style={{ background: "var(--color-accent-900)" }}>
            <div className="relative h-[480px]">
              <ImageSlot label={hero.screenshotLabel} />
            </div>
          </div>
        </div>
      </section>

      {/* Возможности приложения */}
      <section aria-label={pages.sosPage.features} className="mt-14">
        <div className="mb-5 flex items-baseline gap-[14px] border-b border-[var(--color-divider)] pb-2.5">
          <h2 className="m-0 text-[23px] uppercase tracking-[.02em]">{features.title}</h2>
        </div>
        <div className="grid grid-cols-3 gap-[14px] max-[920px]:grid-cols-1">
          {features.items.map((f) => (
            <div
              key={f.title}
              className="blueprint flex flex-col gap-2.5 p-5"
              style={{ borderTop: `3px solid ${f.borderColor}` }}
            >
              <FeatureIcon name={f.icon} color={f.iconColor} />
              <span className="text-[19px] font-semibold [font-family:var(--font-heading)]">
                {f.title}
              </span>
              <span className="text-[13.5px] leading-[1.55]" style={{ color: muted(68) }}>
                {f.desc}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Как работает экстренный вызов */}
      <section
        aria-label={pages.sosPage.how}
        className="mt-12 grid grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)] items-start gap-8 max-[920px]:grid-cols-1"
      >
        <div className="min-w-0">
          <div className="mb-1.5 flex items-baseline gap-[14px] border-b border-[var(--color-divider)] pb-2.5">
            <h2 className="m-0 text-[23px] uppercase tracking-[.02em]">{how.title}</h2>
          </div>
          {how.steps.map((s, i) => (
            <div
              key={s.n}
              className="flex gap-[14px] px-0.5 py-[14px]"
              style={{
                borderBottom:
                  i === how.steps.length - 1 ? undefined : "1px solid var(--color-divider)",
              }}
            >
              <span
                className="min-w-[30px] text-xl font-semibold [font-family:var(--font-heading)]"
                style={{ color: "var(--color-accent-700)" }}
              >
                {s.n}
              </span>
              <span className="text-[14.5px] leading-[1.55]">{s.text}</span>
            </div>
          ))}
        </div>

        <aside className="blueprint flex flex-col gap-3 p-5">
          <h6 className="m-0" style={{ color: muted(55) }}>
            {how.aside.title}
          </h6>
          {how.aside.notes.map((note, i) => (
            <p key={i} className="m-0 text-[13px] leading-[1.55]" style={{ color: muted(70) }}>
              {note.parts.map((part, j) =>
                typeof part === "string" ? (
                  <span key={j}>{part}</span>
                ) : (
                  <strong key={j}>{part.strong}</strong>
                )
              )}
            </p>
          ))}
          <Link
            href={how.aside.link.href}
            className="text-[13px]"
            style={{ color: "var(--color-accent-700)" }}
          >
            {how.aside.link.label}
          </Link>
        </aside>
      </section>
    </PageShell>
  );
}
