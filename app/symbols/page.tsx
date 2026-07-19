import Link from "next/link";
import PageShell from "@/components/public/PageShell";
import { Breadcrumbs, muted } from "@/components/public/ui";
import { breadcrumbs, hero, symbols, anthem, usage } from "./content";

export const metadata = { title: "Государственные символы" };

export default function SymbolsPage() {
  return (
    <PageShell active="about">
      <Breadcrumbs items={breadcrumbs} />

      {/* Заголовок раздела */}
      <div className="border-b border-[var(--color-divider)] pb-3.5">
        <h1 className="mb-2.5 mt-0 text-[36px] uppercase tracking-[.02em]">
          {hero.title}
        </h1>
        <p
          className="m-0 max-w-[70ch] text-[14.5px] leading-[1.6]"
          style={{ color: muted(70) }}
        >
          {hero.lead}
        </p>
      </div>

      {/* Флаг и Герб */}
      {symbols.map((s, i) => (
        <section
          key={s.kicker}
          aria-label={s.ariaLabel}
          className={`grid grid-cols-[minmax(0,420px)_minmax(0,1fr)] items-start gap-8 max-[920px]:grid-cols-1 ${
            i === 0 ? "mt-8" : "mt-10"
          }`}
        >
          <figure className="blueprint m-0 grid place-items-center p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.image.src}
              alt={s.image.alt}
              className="w-full"
              style={{
                maxWidth: s.image.maxWidth,
                ...(s.image.bordered
                  ? { border: "1px solid var(--color-divider)" }
                  : {}),
              }}
            />
          </figure>
          <div className="min-w-0">
            <span
              className="text-[11px] uppercase tracking-[.1em]"
              style={{ color: "var(--color-accent-700)" }}
            >
              {s.kicker}
            </span>
            <h2 className="mb-2.5 mt-1.5 text-[26px] uppercase tracking-[.02em]">
              {s.title}
            </h2>
            {s.body.map((p) => (
              <p
                key={p.text}
                className="max-w-[64ch]"
                style={{
                  fontSize: p.size,
                  lineHeight: p.lineHeight ?? 1.65,
                  ...(p.muted ? { color: muted(p.muted) } : {}),
                }}
              >
                {p.text}
              </p>
            ))}
            <p className="mt-3" style={{ fontSize: 12, color: muted(52) }}>
              {s.note}
            </p>
          </div>
        </section>
      ))}

      {/* Гимн */}
      <section aria-label={anthem.ariaLabel} className="mt-10">
        <div className="grid grid-cols-[minmax(0,420px)_minmax(0,1fr)] items-start gap-8 max-[920px]:grid-cols-1">
          <div
            className="blueprint flex flex-col gap-3 p-6"
            style={{ background: "var(--color-accent-900)" }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d6ebff"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            <span className="text-xl font-semibold text-white [font-family:var(--font-heading)]">
              {anthem.card.name}
            </span>
            <span
              className="text-[13px] leading-[1.55]"
              style={{ color: "rgba(255,255,255,.78)" }}
            >
              {anthem.card.attribution.map((line, i) => (
                <span key={line}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,.6)" }}>
              {anthem.card.note}
            </span>
          </div>
          <div className="min-w-0">
            <span
              className="text-[11px] uppercase tracking-[.1em]"
              style={{ color: "var(--color-accent-700)" }}
            >
              {anthem.kicker}
            </span>
            <h2 className="mb-2.5 mt-1.5 text-[26px] uppercase tracking-[.02em]">
              {anthem.title}
            </h2>
            {anthem.body.map((text) => (
              <p key={text} className="max-w-[64ch] text-[14.5px] leading-[1.65]">
                {text}
              </p>
            ))}
            <p className="mt-3" style={{ fontSize: 12, color: muted(52) }}>
              {anthem.note.before}
              <Link
                href={anthem.note.link.href}
                style={{ color: "var(--color-accent-700)" }}
              >
                {anthem.note.link.label}
              </Link>
              {anthem.note.after}
            </p>
          </div>
        </div>
      </section>

      {/* Использование символов */}
      <section
        aria-label={usage.ariaLabel}
        className="blueprint mt-10 px-[22px] py-5"
      >
        <h6 className="mb-2.5" style={{ color: muted(55) }}>
          {usage.title}
        </h6>
        <p
          className="m-0 max-w-[80ch] text-[13.5px] leading-[1.6]"
          style={{ color: muted(72) }}
        >
          {usage.text}
        </p>
      </section>
    </PageShell>
  );
}
