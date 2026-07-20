import { Fragment } from "react";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageShell from "@/components/public/PageShell";
import { Breadcrumbs, muted } from "@/components/public/ui";
import {
  fetchInstruction,
  fetchInstructions,
  type ApiInstruction,
} from "@/lib/api";
import { common } from "@/lib/copy/common";
import { routes } from "@/lib/routes";
import type { Run, SectionTone } from "./content";

export const revalidate = 60;

interface GuideSection {
  aria: string;
  tone: SectionTone;
  tag: string;
  title: string;
  steps: { n: string; text: Run[] }[];
}

interface RelatedLink {
  label: string;
  href: string;
}

const BLOCKS: {
  key: "before" | "during" | "after";
  tone: SectionTone;
  tag: string;
  title: string;
  aria: string;
}[] = [
  { key: "before", tone: "accent", tag: "До", title: "Подготовьтесь заранее", aria: "До события" },
  { key: "during", tone: "warning", tag: "Во время", title: "Во время события", aria: "Во время события" },
  { key: "after", tone: "success", tag: "После", title: "После события", aria: "После события" },
];

function buildSections(item: ApiInstruction): GuideSection[] {
  const sections = item.sections;
  if (!sections) {
    return [];
  }
  return BLOCKS.map((b) => ({
    aria: b.aria,
    tone: b.tone,
    tag: b.tag,
    title: b.title,
    steps: (sections[b.key] ?? []).map((text, i) => ({
      n: String(i + 1).padStart(2, "0"),
      text: [text] as Run[],
    })),
  })).filter((s) => s.steps.length > 0);
}

async function relatedFor(slug: string): Promise<RelatedLink[]> {
  const all = await fetchInstructions();
  return all
    .filter((i) => i.slug !== slug)
    .slice(0, 3)
    .map((i) => ({ label: i.title, href: routes.guide(i.slug) }));
}

export async function generateStaticParams() {
  const all = await fetchInstructions();
  return all.map((i) => ({ slug: i.slug }));
}

type GuideRouteProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: GuideRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await fetchInstruction(slug);
  return { title: item?.title ?? "Инструкция" };
}

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
  const item = await fetchInstruction(slug);

  if (!item) {
    notFound();
  }

  const sections = buildSections(item);
  const dont = item.sections?.prohibited ?? [];
  const related = await relatedFor(slug);

  return (
    <PageShell
      active="guides"
      mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-6 max-[920px]:px-4"
    >
      <Breadcrumbs
        items={[
          { label: common.breadcrumbHome, href: routes.home },
          { label: common.nav.guides, href: routes.guides },
          { label: item.title },
        ]}
      />

      <div className="mt-2 grid grid-cols-[minmax(0,1.9fr)_minmax(260px,1fr)] items-start gap-9 max-[920px]:grid-cols-1">
        {/* Основной столбец: инструкция */}
        <div className="min-w-0 max-w-[74ch]">
          <span
            className="text-[11px] uppercase tracking-[.1em]"
            style={{ color: "var(--color-accent-700)" }}
          >
            Инструкция населению
          </span>
          <h1 className="mb-3.5 mt-2.5 text-[36px] leading-[1.1]">
            {item.title}
          </h1>

          {/* Главное */}
          {item.summary && (
            <div
              className="blueprint px-5 py-[18px]"
              style={{
                background:
                  "color-mix(in srgb,var(--color-accent) 8%,transparent)",
              }}
            >
              <h6 className="m-0 mb-2" style={{ color: muted(55) }}>
                Главное
              </h6>
              <p className="m-0 text-[15px] leading-[1.6]">{item.summary}</p>
            </div>
          )}

          {/* Блоки До / Во время / После */}
          {sections.map((section, si) => {
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
          {dont.length > 0 && (
            <section
              aria-label="Чего делать нельзя"
              className="blueprint mt-7 px-5 py-[18px]"
              style={{ borderTop: "3px solid var(--hz-critical)" }}
            >
              <h6 className="m-0 mb-2.5" style={{ color: "var(--hz-critical)" }}>
                Чего делать нельзя
              </h6>
              <ul className="m-0 flex list-disc flex-col gap-1.5 pl-[18px] text-sm leading-[1.5]">
                {dont.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Боковая колонка: экстренная помощь, связанные */}
        <aside className="flex flex-col gap-5">
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
              Единая служба спасения, круглосуточно
            </span>
          </div>

          {related.length > 0 && (
            <div>
              <h6 className="m-0 mb-2.5" style={{ color: muted(55) }}>
                Связанные инструкции
              </h6>
              {related.map((r, i) => {
                const last = i === related.length - 1;
                return (
                  <Link
                    key={r.href}
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
          )}
        </aside>
      </div>
    </PageShell>
  );
}
