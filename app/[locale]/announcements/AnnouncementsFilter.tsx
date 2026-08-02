import type { ReactNode } from "react";
import Link from "@/components/i18n/LocaleLink";
import { muted } from "@/components/public/ui";
import type { ApiAnnouncement } from "@/lib/api";
import type { Locale } from "@/lib/i18n/config";
import { routes } from "@/lib/routes";
import {
  getAnnouncementsContent,
  announcementsCount,
  getKindMeta,
  getStatusMeta,
  type FilterKey,
} from "./content";

/**
 * Фильтр объявлений (Все / Вакансии / Тендеры) + лента. Серверный компонент:
 * кнопки — обычные `<Link>` на `?kind=`, отбор делает CMS до постраничности,
 * счётчик берётся из `meta.total`, а не из длины текущей страницы. Работает без
 * JS и переживает перезагрузку — проверено `tests/e2e/no-js-lists.spec.ts`.
 * Боковая колонка-подсказка приходит из страницы как children.
 */
export default function AnnouncementsFilter({
  children,
  data,
  locale,
  active,
  total,
}: {
  children: ReactNode;
  data: ApiAnnouncement[];
  locale: Locale;
  active: FilterKey;
  total: number;
}) {
  const c = getAnnouncementsContent(locale);
  const kindMeta = getKindMeta(locale);
  const statusMeta = getStatusMeta(locale);

  return (
    <>
      <div className="flex flex-wrap items-center gap-[14px] border-b border-[var(--color-divider)] py-4">
        <div
          role="group"
          aria-label={c.filterGroupLabel}
          className="flex flex-wrap gap-1.5"
        >
          {c.filters.map((f) => {
            const pressed = f.key === active;
            const href =
              f.key === "all"
                ? routes.announcements
                : `${routes.announcements}?kind=${f.key}`;
            return (
              <Link
                key={f.key}
                href={href}
                aria-current={pressed ? "page" : undefined}
                className="btn px-[14px] py-1.5 text-[13px] hover:border-[color:var(--color-accent)]"
                style={{
                  background: pressed
                    ? "var(--color-accent-solid)"
                    : "transparent",
                  color: pressed ? "var(--color-bg)" : "var(--color-text)",
                }}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
        <span className="flex-1" />
        <span className="text-xs" style={{ color: muted(50) }}>
          {announcementsCount(total, locale)}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-[minmax(0,2.2fr)_minmax(260px,1fr)] items-start gap-8 max-[920px]:grid-cols-1">
        <div role="feed" aria-label={c.feedLabel} className="min-w-0">
          {data.length === 0 && (
            <p className="py-6 text-[14px]" style={{ color: muted(60) }}>
              {c.empty}
            </p>
          )}
          {data.map((a) => {
            const kind = kindMeta[a.kind];
            const st = a.open ? statusMeta.open : statusMeta.closed;
            return (
              <article
                key={a.title}
                className="flex flex-col gap-2 border-b border-[var(--color-divider)] py-5"
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`tag ${kind.tagClass}`}>{kind.label}</span>
                  <span
                    className="tag font-semibold"
                    style={{ background: st.bg, color: st.fg }}
                  >
                    {st.label}
                  </span>
                  <span className="text-xs" style={{ color: muted(52) }}>
                    {a.org}
                  </span>
                  <span className="flex-1" />
                  <span
                    className="text-[12.5px] font-medium"
                    style={{ color: a.open ? "var(--hz-warning)" : muted(50) }}
                  >
                    {a.deadline}
                  </span>
                </div>
                <h2 className="m-0 text-xl leading-[1.2]">
                  <Link
                    href={
                      a.slug
                        ? routes.announcement(a.slug)
                        : routes.announcements
                    }
                    className="text-inherit no-underline hover:text-[color:var(--color-accent-700)]"
                  >
                    {a.title}
                  </Link>
                </h2>
                <p
                  className="m-0 text-[13.5px] leading-[1.55]"
                  style={{ color: muted(65) }}
                >
                  {a.desc}
                </p>
              </article>
            );
          })}
        </div>
        {children}
      </div>
    </>
  );
}
