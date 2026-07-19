import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/public/PageShell";
import { Breadcrumbs, ImageSlot, muted } from "@/components/public/ui";
import { routes } from "@/lib/routes";
import {
  getProjectContent,
  projectBreadcrumb,
  projectSlugs,
  type TimelineTone,
} from "./content";

type Params = { slug: string };

/** Тон точки таймлайна → хазард-токен. */
const timelineDot: Record<TimelineTone, string> = {
  success: "var(--hz-success)",
  info: "var(--hz-info)",
  warning: "var(--hz-warning)",
  danger: "var(--hz-danger)",
  critical: "var(--hz-critical)",
};

export function generateStaticParams(): Params[] {
  return projectSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProjectContent(slug);
  return { title: `${p.metaTitle} — Проекты` };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const p = getProjectContent(slug);

  return (
    <PageShell active="">
      <Breadcrumbs
        items={[
          { label: projectBreadcrumb.home, href: routes.home },
          { label: projectBreadcrumb.projects, href: routes.projects },
          { label: p.metaTitle },
        ]}
      />

      {/* Шапка проекта */}
      <section
        aria-label="О проекте"
        className="blueprint mt-5 flex flex-col gap-3 px-[26px] py-6"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="tag font-semibold"
            style={{ background: "var(--hz-success-bg)", color: "var(--hz-success)" }}
          >
            {p.status}
          </span>
          <span className="tag tag-neutral">{p.years}</span>
          <span className="tag tag-outline">{p.code}</span>
        </div>
        <h1 className="m-0 text-[32px] leading-[1.12]">{p.title}</h1>
        <div className="grid grid-cols-4 gap-[14px] border-t border-[var(--color-divider)] pt-[14px] max-[920px]:grid-cols-2 max-[560px]:grid-cols-1">
          {p.meta.map((m) => (
            <div key={m.label}>
              <h6 className="m-0 mb-1" style={{ color: muted(55) }}>
                {m.label}
              </h6>
              <span className="text-[13.5px]">{m.value}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-7 grid grid-cols-[minmax(0,1.9fr)_minmax(260px,1fr)] items-start gap-9 max-[920px]:grid-cols-1">
        {/* Основная колонка */}
        <div className="min-w-0 max-w-[74ch]">
          {/* Цели и задачи */}
          <section aria-label="Цели проекта">
            <h2 className="text-[22px] uppercase tracking-[.02em]">{p.goals.title}</h2>
            <p className="text-[15px] leading-[1.65]">{p.goals.intro}</p>
            <div className="flex flex-col">
              {p.goals.items.map((g, i) => (
                <div
                  key={g.n}
                  className="flex gap-[14px] py-3"
                  style={{
                    borderBottom:
                      i === p.goals.items.length - 1
                        ? undefined
                        : "1px solid var(--color-divider)",
                  }}
                >
                  <span
                    className="min-w-[28px] text-[19px] font-semibold [font-family:var(--font-heading)]"
                    style={{ color: "var(--color-accent-700)" }}
                  >
                    {g.n}
                  </span>
                  <span className="text-[14.5px] leading-[1.55]">{g.text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Ход реализации */}
          <section aria-label="Ход реализации" className="mt-7">
            <h2 className="text-[22px] uppercase tracking-[.02em]">{p.timeline.title}</h2>
            <div className="flex flex-col border-l border-[var(--color-divider)]">
              {p.timeline.items.map((t, i) => (
                <div key={i} className="relative py-2.5 pl-5">
                  <span
                    className="absolute h-2 w-2 rounded-full"
                    style={{ left: "-4.5px", top: "16px", background: timelineDot[t.tone] }}
                  />
                  <span className="text-xs" style={{ color: muted(55) }}>
                    {t.date}
                  </span>
                  <p className="m-0 mt-0.5 text-sm">{t.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Фото */}
          <section aria-label="Фото" className="mt-7">
            <figure className="blueprint duotone mb-1.5 h-[300px]">
              <ImageSlot label={p.photo.label} />
            </figure>
            <figcaption>{p.photo.caption}</figcaption>
          </section>
        </div>

        {/* Сайдбар */}
        <aside className="flex flex-col gap-5">
          {/* Тендеры проекта */}
          <div className="blueprint flex flex-col gap-2.5 p-[18px]">
            <h6 className="m-0" style={{ color: muted(55) }}>
              {p.tenders.title}
            </h6>
            {p.tenders.items.map((t, i) => (
              <Link
                key={t.title}
                href={t.href}
                className="row-link block py-2"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  borderBottom:
                    i === p.tenders.items.length - 1
                      ? undefined
                      : "1px solid var(--color-divider)",
                }}
              >
                <span className="flex items-center gap-2">
                  {t.tone === "open" ? (
                    <span
                      className="tag text-[10px] font-semibold"
                      style={{ background: "var(--hz-success-bg)", color: "var(--hz-success)" }}
                    >
                      {t.statusLabel}
                    </span>
                  ) : (
                    <span className="tag tag-neutral text-[10px]">{t.statusLabel}</span>
                  )}
                  <span className="text-[11.5px]" style={{ color: muted(52) }}>
                    {t.deadline}
                  </span>
                </span>
                <span className="mt-1 block text-[14.5px] font-semibold leading-[1.3] [font-family:var(--font-heading)]">
                  {t.title}
                </span>
              </Link>
            ))}
            <Link
              href={p.tenders.allHref}
              className="btn btn-secondary mt-1 text-[13px]"
            >
              {p.tenders.allLabel}
            </Link>
          </div>

          {/* Дирекция проекта */}
          <div className="blueprint flex flex-col gap-2 p-[18px]">
            <h6 className="m-0" style={{ color: muted(55) }}>
              {p.direction.title}
            </h6>
            <p className="m-0 text-[13px] leading-[1.55]" style={{ color: muted(70) }}>
              {p.direction.addressLines.map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
              <a href={p.direction.phoneHref} style={{ color: "var(--color-accent-700)" }}>
                {p.direction.phone}
              </a>
              {` · ${p.direction.email}`}
            </p>
          </div>

          {/* Другие проекты */}
          <div>
            <h6 className="m-0 mb-2.5" style={{ color: muted(55) }}>
              {p.related.title}
            </h6>
            {p.related.items.map((r, i) => (
              <Link
                key={r.title}
                href={r.href}
                className="row-link block py-2.5 text-[15px] font-semibold [font-family:var(--font-heading)]"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  borderBottom:
                    i === p.related.items.length - 1
                      ? undefined
                      : "1px solid var(--color-divider)",
                }}
              >
                {r.title}
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
