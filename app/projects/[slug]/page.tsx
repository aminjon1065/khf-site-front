import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/public/PageShell";
import { Breadcrumbs, ImageSlot, muted } from "@/components/public/ui";
import { fetchProject, fetchProjects } from "@/lib/api";
import { routes } from "@/lib/routes";
import { projectBreadcrumb } from "./content";

export const revalidate = 60;

type Params = { slug: string };

const statusChrome: Record<string, { bg: string; fg: string }> = {
  success: { bg: "var(--hz-success-bg)", fg: "var(--hz-success)" },
  info: { bg: "var(--hz-info-bg)", fg: "var(--hz-info)" },
  neutral: { bg: "var(--color-neutral-100)", fg: "var(--color-neutral-800)" },
};

const timelineDot: Record<string, string> = {
  success: "var(--hz-success)",
  info: "var(--hz-info)",
  warning: "var(--hz-warning)",
  danger: "var(--hz-danger)",
  critical: "var(--hz-critical)",
  neutral: "var(--color-neutral-400)",
};

export async function generateStaticParams(): Promise<Params[]> {
  const projects = await fetchProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await fetchProject(slug);
  return { title: p ? `${p.title} — Проекты` : "Проект" };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const p = await fetchProject(slug);

  if (!p) {
    notFound();
  }

  const meta = [
    { label: "Заказчик", value: p.customer },
    { label: "Партнёры", value: p.partner },
    { label: "Бюджет", value: p.budget },
    { label: "Сроки", value: p.years },
  ].filter((m): m is { label: string; value: string } => Boolean(m.value));

  const chrome = statusChrome[p.status_tone] ?? statusChrome.neutral;
  const goals = p.goals ?? [];
  const timeline = p.timeline ?? [];

  const all = await fetchProjects();
  const related = all.filter((r) => r.slug !== slug).slice(0, 3);

  return (
    <PageShell active="">
      <Breadcrumbs
        items={[
          { label: projectBreadcrumb.home, href: routes.home },
          { label: projectBreadcrumb.projects, href: routes.projects },
          { label: p.title },
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
            style={{ background: chrome.bg, color: chrome.fg }}
          >
            {p.status}
          </span>
          {p.years && <span className="tag tag-neutral">{p.years}</span>}
          {p.code && <span className="tag tag-outline">{p.code}</span>}
        </div>
        <h1 className="m-0 text-[32px] leading-[1.12]">{p.title}</h1>
        {meta.length > 0 && (
          <div className="grid grid-cols-4 gap-[14px] border-t border-[var(--color-divider)] pt-[14px] max-[920px]:grid-cols-2 max-[560px]:grid-cols-1">
            {meta.map((m) => (
              <div key={m.label}>
                <h6 className="m-0 mb-1" style={{ color: muted(55) }}>
                  {m.label}
                </h6>
                <span className="text-[13.5px]">{m.value}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-7 grid grid-cols-[minmax(0,1.9fr)_minmax(260px,1fr)] items-start gap-9 max-[920px]:grid-cols-1">
        {/* Основная колонка */}
        <div className="min-w-0 max-w-[74ch]">
          {/* Цели и задачи */}
          <section aria-label="Цели проекта">
            <h2 className="text-[22px] uppercase tracking-[.02em]">
              Цели и задачи
            </h2>
            {p.desc && (
              <p className="text-[15px] leading-[1.65]">{p.desc}</p>
            )}
            {goals.length > 0 && (
              <div className="flex flex-col">
                {goals.map((g, i) => (
                  <div
                    key={i}
                    className="flex gap-[14px] py-3"
                    style={{
                      borderBottom:
                        i === goals.length - 1
                          ? undefined
                          : "1px solid var(--color-divider)",
                    }}
                  >
                    <span
                      className="min-w-[28px] text-[19px] font-semibold [font-family:var(--font-heading)]"
                      style={{ color: "var(--color-accent-700)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[14.5px] leading-[1.55]">{g}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Ход реализации */}
          {timeline.length > 0 && (
            <section aria-label="Ход реализации" className="mt-7">
              <h2 className="text-[22px] uppercase tracking-[.02em]">
                Ход реализации
              </h2>
              <div className="flex flex-col border-l border-[var(--color-divider)]">
                {timeline.map((t, i) => (
                  <div key={i} className="relative py-2.5 pl-5">
                    <span
                      className="absolute h-2 w-2 rounded-full"
                      style={{
                        left: "-4.5px",
                        top: "16px",
                        background: timelineDot[t.tone] ?? timelineDot.neutral,
                      }}
                    />
                    <span className="text-xs" style={{ color: muted(55) }}>
                      {t.date}
                    </span>
                    <p className="m-0 mt-0.5 text-sm">{t.text}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Фото */}
          <section aria-label="Фото" className="mt-7">
            <figure className="blueprint duotone mb-1.5 h-[300px]">
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageSlot label="Фото проекта" />
              )}
            </figure>
          </section>
        </div>

        {/* Сайдбар */}
        <aside className="flex flex-col gap-5">
          {/* Дирекция проекта */}
          {p.direction &&
            (p.direction.address ||
              p.direction.phone ||
              p.direction.email) && (
              <div className="blueprint flex flex-col gap-2 p-[18px]">
                <h6 className="m-0" style={{ color: muted(55) }}>
                  Дирекция проекта
                </h6>
                <p
                  className="m-0 text-[13px] leading-[1.55]"
                  style={{ color: muted(70) }}
                >
                  {p.direction.address && (
                    <span>
                      {p.direction.address}
                      <br />
                    </span>
                  )}
                  {p.direction.phone && (
                    <a
                      href={`tel:${p.direction.phone.replace(/[^+\d]/g, "")}`}
                      style={{ color: "var(--color-accent-700)" }}
                    >
                      {p.direction.phone}
                    </a>
                  )}
                  {p.direction.email && ` · ${p.direction.email}`}
                </p>
              </div>
            )}

          {/* Другие проекты */}
          {related.length > 0 && (
            <div>
              <h6 className="m-0 mb-2.5" style={{ color: muted(55) }}>
                Другие проекты
              </h6>
              {related.map((r, i) => (
                <Link
                  key={r.slug}
                  href={routes.project(r.slug)}
                  className="row-link block py-2.5 text-[15px] font-semibold [font-family:var(--font-heading)]"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    borderBottom:
                      i === related.length - 1
                        ? undefined
                        : "1px solid var(--color-divider)",
                  }}
                >
                  {r.title}
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>
    </PageShell>
  );
}
