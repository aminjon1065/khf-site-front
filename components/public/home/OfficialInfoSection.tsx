import Link from "@/components/i18n/LocaleLink";
import { SectionHeader, muted } from "@/components/public/ui";
import { routes } from "@/lib/routes";
import { HOME_BLOCK_MAX_ITEMS } from "@/lib/home-blocks";
import type {
  ApiAnnouncement,
  ApiDocument,
  ApiProject,
} from "@/lib/api";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

// Цвет тега статуса проекта по локале-независимому status_tone из CMS
// (а не хардкод-зелёный для всех статусов).
const projectTagTone: Record<string, { background: string; color: string }> = {
  success: { background: "var(--hz-success-bg)", color: "var(--hz-success)" },
  info: { background: "var(--hz-info-bg)", color: "var(--hz-info)" },
  neutral: {
    background: "var(--color-neutral-100)",
    color: "var(--color-neutral-800)",
  },
};

/**
 * Официальная информация: документы + объявления слева, проекты справа.
 * Состав колонок и заголовки управляются блоками главной в CMS; число строк
 * и карточек ограничено HOME_BLOCK_MAX_ITEMS.
 */
export default function OfficialInfoSection({
  documents: allDocuments,
  announcements: allAnnouncements,
  projects: allProjects,
  showDocuments,
  showAnnouncements,
  showProjects,
  titles,
  home,
  ariaLabel,
}: {
  documents: ApiDocument[];
  announcements: ApiAnnouncement[];
  projects: ApiProject[];
  showDocuments: boolean;
  showAnnouncements: boolean;
  showProjects: boolean;
  /** Заголовки колонок: из блоков CMS или словарные. */
  titles: { documents: string; announcements: string; projects: string };
  home: Dictionary["home"];
  ariaLabel: string;
}) {
  const documents = allDocuments.slice(0, HOME_BLOCK_MAX_ITEMS.documents);
  const announcements = allAnnouncements.slice(
    0,
    HOME_BLOCK_MAX_ITEMS.announcements,
  );
  const projects = allProjects.slice(0, HOME_BLOCK_MAX_ITEMS.projects);
  const hasLists =
    (showDocuments && documents.length > 0) ||
    (showAnnouncements && announcements.length > 0);
  const hasProjects = showProjects && projects.length > 0;
  // Две колонки — только когда есть обе. Если редактор выключил одну сторону,
  // вторая занимает всю ширину, а не оставляет рядом пустую колонку (как
  // карточка Президента без слайдера в LeadSection).
  const twoColumns = hasLists && hasProjects;

  return (
    <section
      aria-label={ariaLabel}
      className={
        twoColumns
          ? "mt-[52px] grid grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)] gap-7 max-[920px]:grid-cols-1"
          : "mt-[52px]"
      }
    >
      {hasLists && (
        <div>
          {showDocuments && documents.length > 0 && (
            <>
              <SectionHeader
                as="h2"
                title={titles.documents}
                link={{ label: home.documents.allLink, href: routes.documents }}
              />
              {documents.map((d) => (
                <Link
                  key={d.id}
                  href={d.href ?? routes.documents}
                  className="row-link flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-[var(--color-divider)] px-1 py-3 transition-colors hover:bg-[var(--color-surface)]/50"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <span className="tag tag-neutral flex-none text-xs font-medium">{d.type}</span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-slate-800 dark:text-slate-100">{d.title}</span>
                  <span
                    className="flex-none text-xs text-slate-500 dark:text-slate-400"
                  >
                    {d.size ?? ""}
                  </span>
                </Link>
              ))}
            </>
          )}

          {showAnnouncements && announcements.length > 0 && (
            <>
              <SectionHeader
                id="announcements"
                as="h2"
                title={titles.announcements}
                link={{
                  label: home.announcements.allLink,
                  href: routes.announcements,
                }}
              />
              {announcements.map((a) => (
                <Link
                  key={a.slug}
                  href={routes.announcement(a.slug)}
                  className="row-link flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-[var(--color-divider)] px-1 py-3 transition-colors hover:bg-[var(--color-surface)]/50"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <span
                    className={`tag ${a.kind === "vacancy" ? "tag-accent" : "tag-outline"} flex-none text-xs font-semibold`}
                  >
                    {a.kind_label}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-slate-800 dark:text-slate-100">{a.title}</span>
                  <span
                    className="flex-none text-xs text-slate-500 dark:text-slate-400"
                  >
                    {a.deadline}
                  </span>
                </Link>
              ))}
            </>
          )}
        </div>
      )}

      {hasProjects && (
        <div className="min-w-0 self-start">
          <SectionHeader
            as="h2"
            title={titles.projects}
            link={{ label: home.projects.allLink, href: routes.projects }}
          />
          {/* Во всю ширину карточки проектов встают в ряд, как карточки
              предупреждений, а не растягиваются каждая на всю колонку. */}
          <div
            className={
              twoColumns
                ? undefined
                : "grid grid-cols-3 gap-x-[14px] max-[920px]:grid-cols-1"
            }
          >
            {projects.map((pr) => (
              <Link
                key={pr.slug}
                href={`/projects/${pr.slug}`}
                className="blueprint surface-hover mt-[14px] flex flex-col gap-2 p-4 transition-all hover:-translate-y-0.5"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="tag text-[11px] font-semibold"
                    style={
                      projectTagTone[pr.status_tone] ?? projectTagTone.neutral
                    }
                  >
                    {pr.status}
                  </span>
                  <span className="text-[11.5px] font-medium" style={{ color: muted(52) }}>
                    {pr.years}
                  </span>
                </div>
                <span className="text-[16px] font-semibold leading-snug [font-family:var(--font-heading)]">
                  {pr.title}
                </span>
                <span className="text-xs" style={{ color: muted(58) }}>
                  {[pr.partner, pr.budget].filter(Boolean).join(" · ")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
