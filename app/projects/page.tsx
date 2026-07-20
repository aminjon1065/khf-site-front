import Link from "next/link";
import PageShell from "@/components/public/PageShell";
import { Breadcrumbs, muted } from "@/components/public/ui";
import { fetchProjects } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { ProjectStatus } from "@/lib/types";
import { projectsContent, projectStatusColors } from "./content";

export const metadata = { title: "Проекты и программы" };

// ISR: список проектов перечитывается из CMS не чаще раза в минуту.
export const revalidate = 60;

const NEUTRAL = {
  bg: "var(--color-neutral-100)",
  fg: "var(--color-neutral-800)",
};

export default async function ProjectsPage() {
  const c = projectsContent;
  const projects = await fetchProjects();

  return (
    <PageShell
      active=""
      mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-8 max-[920px]:px-4"
    >
      <Breadcrumbs items={c.breadcrumbs} />

      {/* Заголовок раздела */}
      <div className="border-b border-[var(--color-divider)] pb-[14px]">
        <h1 className="m-0 mb-2 text-[36px] uppercase tracking-[.02em]">
          {c.title}
        </h1>
        <p
          className="m-0 max-w-[70ch] text-[14.5px] leading-[1.6]"
          style={{ color: muted(70) }}
        >
          {c.intro}
        </p>
      </div>

      {/* Карточки проектов */}
      {projects.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-[14px] max-[920px]:grid-cols-1">
          {projects.map((p, i) => {
            const sc = projectStatusColors[p.status as ProjectStatus] ?? NEUTRAL;
            return (
              <Link
                key={p.slug}
                href={routes.project(p.slug)}
                className="blueprint surface-hover flex min-w-0 flex-col gap-2.5 p-[22px]"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-[13px] font-semibold [font-family:var(--font-heading)]"
                    style={{ color: muted(40) }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="tag font-semibold"
                    style={{ background: sc.bg, color: sc.fg }}
                  >
                    {p.status}
                  </span>
                  {p.years && <span className="tag tag-neutral">{p.years}</span>}
                </div>
                <span className="text-[21px] font-semibold leading-[1.2] [font-family:var(--font-heading)]">
                  {p.title}
                </span>
                <span
                  className="text-[13.5px] leading-[1.55]"
                  style={{ color: muted(65) }}
                >
                  {p.desc}
                </span>
                <div
                  className="mt-auto flex flex-wrap gap-5 border-t border-[var(--color-divider)] pt-2.5 text-xs"
                  style={{ color: muted(58) }}
                >
                  {p.partner && (
                    <span>
                      <strong style={{ color: "var(--color-text)" }}>
                        {c.cardLabels.partner}
                      </strong>{" "}
                      {p.partner}
                    </span>
                  )}
                  {p.budget && (
                    <span>
                      <strong style={{ color: "var(--color-text)" }}>
                        {c.cardLabels.budget}
                      </strong>{" "}
                      {p.budget}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="mt-6 text-[14px]" style={{ color: muted(60) }}>
          Проекты пока не опубликованы.
        </p>
      )}

      {/* Связанные разделы */}
      <section
        aria-label={c.related.aria}
        className="blueprint mt-8 flex flex-wrap items-center gap-6 px-5 py-[18px]"
      >
        <p
          className="m-0 min-w-[260px] flex-1 text-[13.5px] leading-[1.55]"
          style={{ color: muted(70) }}
        >
          {c.related.text}
        </p>
        <Link href={routes.announcements} className="btn btn-secondary">
          {c.related.tenders}
        </Link>
        <Link href={routes.documents} className="btn btn-ghost">
          {c.related.reports}
        </Link>
      </section>
    </PageShell>
  );
}
