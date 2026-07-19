import { Fragment } from "react";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import type { Metadata } from "next";
import PageShell from "@/components/public/PageShell";
import { Breadcrumbs, muted } from "@/components/public/ui";
import { common } from "@/lib/copy/common";
import { routes } from "@/lib/routes";
import {
  getGuide,
  guideSlugs,
  type Run,
  type SectionTone,
} from "./content";

export function generateStaticParams() {
  return guideSlugs.map((slug) => ({ slug }));
}

type GuideRouteProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: GuideRouteProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: getGuide(slug).title };
}

/** Оформление блока по тональности: тег и цвет номеров шага. */
const toneConfig: Record<
  SectionTone,
  { tagClassName: string; tagStyle: CSSProperties; numColor: string }
> = {
  accent: {
    tagClassName: "tag tag-accent",
    tagStyle: { fontSize: "11px" },
    numColor: "var(--color-accent-700)",
  },
  warning: {
    tagClassName: "tag",
    tagStyle: {
      background: "var(--hz-warning-bg)",
      color: "var(--hz-warning)",
      fontSize: "11px",
      fontWeight: 700,
    },
    numColor: "var(--hz-warning)",
  },
  success: {
    tagClassName: "tag",
    tagStyle: {
      background: "var(--hz-success-bg)",
      color: "var(--hz-success)",
      fontSize: "11px",
      fontWeight: 700,
    },
    numColor: "var(--hz-success)",
  },
};

/** Рендер строки с выделенными жирным зачинами. */
function Runs({ runs }: { runs: Run[] }): ReactNode {
  return (
    <>
      {runs.map((r, i) =>
        typeof r === "string" ? (
          <Fragment key={i}>{r}</Fragment>
        ) : (
          <strong key={i}>{r.b}</strong>
        ),
      )}
    </>
  );
}

export default async function GuidePage({ params }: GuideRouteProps) {
  const { slug } = await params;
  const g = getGuide(slug);

  return (
    <PageShell
      active="guides"
      mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-6 max-[920px]:px-4"
    >
      <Breadcrumbs
        items={[
          { label: common.breadcrumbHome, href: routes.home },
          { label: common.nav.guides, href: routes.guides },
          { label: g.crumbLabel },
        ]}
      />

      <div className="mt-2 grid grid-cols-[minmax(0,1.9fr)_minmax(260px,1fr)] items-start gap-9 max-[920px]:grid-cols-1">
        {/* Основной столбец: инструкция */}
        <div className="min-w-0 max-w-[74ch]">
          <span
            className="text-[11px] uppercase tracking-[.1em]"
            style={{ color: "var(--color-accent-700)" }}
          >
            {g.kicker}
          </span>
          <h1 className="mb-3.5 mt-2.5 text-[36px] leading-[1.1]">{g.title}</h1>

          {/* Главное за 10 секунд */}
          <div
            className="blueprint px-5 py-[18px]"
            style={{
              background: "color-mix(in srgb,var(--color-accent) 8%,transparent)",
            }}
          >
            <h6 className="m-0 mb-2" style={{ color: muted(55) }}>
              {g.summaryTitle}
            </h6>
            <p className="m-0 text-[15px] leading-[1.6]">
              <Runs runs={g.summary} />
            </p>
          </div>

          {/* Блоки До / Во время / После */}
          {g.sections.map((section, si) => {
            const tone = toneConfig[section.tone];
            return (
              <section
                key={section.tag}
                aria-label={section.aria}
                className={si === 0 ? "mt-7" : "mt-6"}
              >
                <h2 className="flex items-center gap-2.5 text-[22px] uppercase tracking-[.02em]">
                  <span className={tone.tagClassName} style={tone.tagStyle}>
                    {section.tag}
                  </span>
                  {section.title}
                </h2>
                <ol className="m-0 flex list-none flex-col p-0">
                  {section.steps.map((step, i) => {
                    const last = i === section.steps.length - 1;
                    return (
                      <li
                        key={step.n}
                        className="flex gap-3.5 py-3"
                        style={
                          last
                            ? undefined
                            : { borderBottom: "1px solid var(--color-divider)" }
                        }
                      >
                        <span
                          className="min-w-[28px] text-[19px] font-semibold [font-family:var(--font-heading)]"
                          style={{ color: tone.numColor }}
                        >
                          {step.n}
                        </span>
                        <span className="text-[14.5px] leading-[1.55]">
                          <Runs runs={step.text} />
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}

          {/* Чего делать нельзя */}
          <section
            aria-label={g.dontTitle}
            className="blueprint mt-7 px-5 py-[18px]"
            style={{ borderTop: "3px solid var(--hz-critical)" }}
          >
            <h6 className="m-0 mb-2.5" style={{ color: "var(--hz-critical)" }}>
              {g.dontTitle}
            </h6>
            <ul className="m-0 flex list-disc flex-col gap-1.5 pl-[18px] text-sm leading-[1.5]">
              {g.dont.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        {/* Боковая колонка: материалы, экстренная помощь, связанные */}
        <aside className="flex flex-col gap-5">
          <div className="blueprint flex flex-col gap-2.5 p-[18px]">
            <h6 className="m-0" style={{ color: muted(55) }}>
              {g.materialsTitle}
            </h6>
            <Link
              href={g.pdf.href}
              className="btn btn-secondary justify-start"
            >
              <Download size={15} strokeWidth={1.5} aria-hidden="true" />
              {g.pdf.label}
            </Link>
            <span className="text-xs" style={{ color: muted(55) }}>
              {g.pdf.note}
            </span>
          </div>

          <div className="blueprint flex flex-col gap-2 p-[18px]">
            <h6 className="m-0" style={{ color: muted(55) }}>
              {g.emergency.title}
            </h6>
            <a
              href={g.emergency.href}
              className="text-[26px] font-semibold no-underline [font-family:var(--font-heading)]"
              style={{ color: "var(--hz-critical)" }}
            >
              {g.emergency.num}
            </a>
            <span className="text-[12.5px]" style={{ color: muted(62) }}>
              {g.emergency.note}
            </span>
          </div>

          <div>
            <h6 className="m-0 mb-2.5" style={{ color: muted(55) }}>
              {g.relatedTitle}
            </h6>
            {g.related.map((r, i) => {
              const last = i === g.related.length - 1;
              return (
                <Link
                  key={r.label}
                  href={r.href}
                  className="row-link block py-2.5 text-[15.5px] font-semibold no-underline [font-family:var(--font-heading)]"
                  style={{
                    color: "inherit",
                    borderBottom: last
                      ? undefined
                      : "1px solid var(--color-divider)",
                  }}
                >
                  {r.label}
                </Link>
              );
            })}
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
