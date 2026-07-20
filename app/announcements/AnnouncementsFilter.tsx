"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { muted } from "@/components/public/ui";
import type { ApiAnnouncement } from "@/lib/api";
import { routes } from "@/lib/routes";
import {
  announcementsContent as c,
  announcementsCount,
  kindMeta,
  statusMeta,
  type FilterKey,
} from "./content";

/**
 * Клиентский фильтр объявлений (Все / Вакансии / Тендеры) + лента.
 * Данные (data) приходят из CMS; фильтр и счётчик — на клиенте.
 * Боковая колонка-подсказка приходит из серверного компонента как children.
 */
export default function AnnouncementsFilter({
  children,
  data,
}: {
  children: ReactNode;
  data: ApiAnnouncement[];
}) {
  const [active, setActive] = useState<FilterKey>("all");
  const items = data.filter((a) => active === "all" || a.kind === active);

  return (
    <>
      <div className="flex flex-wrap items-center gap-[14px] border-b border-[var(--color-divider)] py-4">
        <div role="group" aria-label={c.filterGroupLabel} className="flex flex-wrap gap-1.5">
          {c.filters.map((f) => {
            const pressed = f.key === active;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setActive(f.key)}
                aria-pressed={pressed}
                className="btn px-[14px] py-1.5 text-[13px] hover:border-[color:var(--color-accent)]"
                style={{
                  background: pressed ? "var(--color-accent)" : "transparent",
                  color: pressed ? "var(--color-bg)" : "var(--color-text)",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <span className="flex-1" />
        <span className="text-xs" style={{ color: muted(50) }}>
          {announcementsCount(items.length)}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-[minmax(0,2.2fr)_minmax(260px,1fr)] items-start gap-8 max-[920px]:grid-cols-1">
        <div role="feed" aria-label={c.feedLabel} className="min-w-0">
          {items.map((a) => {
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
                    href={routes.contacts}
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
