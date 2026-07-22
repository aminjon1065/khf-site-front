import Link from "@/components/i18n/LocaleLink";
import PageShell from "@/components/public/PageShell";
import { Breadcrumbs, muted } from "@/components/public/ui";
import type { Metadata } from "next";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getStructure } from "./content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return { title: getDictionary(toLocale((await params).locale)).pages.meta.structure };
}

export default async function StructurePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = toLocale((await params).locale);
  const structure = getStructure(locale);
  const { central, units, footnote, directions } = structure;

  return (
    <PageShell
      active="about"
      locale={locale}
      mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-8 max-[920px]:px-4"
    >
      <Breadcrumbs items={structure.breadcrumbs} />

      {/* Шапка: заголовок + вводный абзац + ключевые цифры */}
      <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)] items-end gap-8 border-b border-[var(--color-divider)] pb-5 max-[920px]:grid-cols-1">
        <div>
          <h1 className="m-0 mb-2.5 text-[36px] uppercase tracking-[.02em]">
            {structure.title}
          </h1>
          <p
            className="m-0 max-w-[64ch] text-[15px] leading-[1.6]"
            style={{ color: muted(70) }}
          >
            {structure.intro}
          </p>
        </div>
        <div className="blueprint grid grid-cols-2 gap-3 px-[18px] py-4 text-center">
          {structure.stats.map((s) => (
            <div key={s.label}>
              <div className="text-[28px] font-semibold [font-family:var(--font-heading)]">
                {s.value}
              </div>
              <div className="text-[11px]" style={{ color: muted(60) }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Подразделения */}
      <section aria-label={structure.unitsLabel} className="mt-7">
        <div className="grid grid-cols-3 gap-[14px] max-[920px]:grid-cols-2 max-[560px]:grid-cols-1">
          <div
            className="blueprint col-span-full flex flex-wrap items-center gap-[14px] p-[18px]"
            style={{ background: "var(--color-accent-900)" }}
          >
            <span className="text-[19px] font-semibold [font-family:var(--font-heading)] text-white">
              {central.label}
            </span>
            <span className="text-[13px] text-white/75">
              {central.meta}
              <Link href={central.link.href} style={{ color: "#d6ebff" }}>
                {central.link.label}
              </Link>
            </span>
          </div>
          {units.map((u) => (
            <div
              key={u.num}
              className="blueprint flex min-w-0 flex-col gap-1.5 p-4"
            >
              <span className="flex items-baseline gap-2.5">
                <span
                  className="text-[13px] font-semibold [font-family:var(--font-heading)]"
                  style={{ color: muted(40) }}
                >
                  {u.num}
                </span>
                <span className="text-[16.5px] font-semibold leading-[1.2] [font-family:var(--font-heading)]">
                  {u.name}
                </span>
              </span>
              <span
                className="text-[12.5px] leading-[1.5]"
                style={{ color: muted(62) }}
              >
                {u.desc}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-[14px] text-[12.5px]" style={{ color: muted(55) }}>
          {footnote.text}
          <Link
            href={footnote.link.href}
            style={{ color: "var(--color-accent-700)" }}
          >
            {footnote.link.label}
          </Link>
          {footnote.suffix}
        </p>
      </section>

      {/* Направления деятельности */}
      <section aria-label={directions.title} className="mt-11">
        <div className="mb-5 flex items-baseline gap-[14px] border-b border-[var(--color-divider)] pb-2.5">
          <h2 className="m-0 text-[23px] uppercase tracking-[.02em]">
            {directions.title}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-x-10 max-[920px]:grid-cols-1">
          {directions.items.map((d) => (
            <div
              key={d}
              className="flex gap-3 border-b border-[var(--color-divider)] py-3 text-sm leading-[1.55]"
            >
              <span
                className="font-semibold [font-family:var(--font-heading)]"
                style={{ color: "var(--color-accent-700)" }}
              >
                —
              </span>
              {d}
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
