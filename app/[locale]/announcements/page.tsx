import { Fragment } from "react";
import type { Metadata } from "next";
import Link from "@/components/i18n/LocaleLink";
import PageShell from "@/components/public/PageShell";
import Pagination from "@/components/public/Pagination";
import { Breadcrumbs, muted } from "@/components/public/ui";
import { fetchAnnouncements } from "@/lib/api";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo";
import AnnouncementsFilter from "./AnnouncementsFilter";
import {
  getAnnouncementsContent,
  type InfoCard,
  type InfoSegment,
} from "./content";

const PER_PAGE = 20;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { common } = getDictionary(locale);
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const baseTitle = getAnnouncementsContent(locale).title;
  return buildMetadata({
    locale,
    title: page > 1 ? `${baseTitle} — ${page}` : baseTitle,
    path: "/announcements",
    siteName: common.siteShort,
    page,
  });
}

// ISR: список объявлений перечитывается из CMS не чаще раза в минуту.
export const revalidate = 60;

/** Сегмент-ссылка в карточке-подсказке: внутренняя (Link) или tel:/mailto: (<a>). */
function InfoLink({ seg }: { seg: InfoSegment }) {
  const style = { color: "var(--color-accent-700)" };
  const href = seg.href as string;
  if (href.startsWith("tel:") || href.startsWith("mailto:")) {
    return (
      <a href={href} style={style}>
        {seg.text}
      </a>
    );
  }
  return (
    <Link href={href} style={style}>
      {seg.text}
    </Link>
  );
}

/** Боковая колонка: подсказки о подаче заявок, требованиях и тендерах. */
function Aside({ info }: { info: InfoCard[] }) {
  return (
    <aside className="flex flex-col gap-5">
      {info.map((card) => (
        <div key={card.title} className="blueprint flex flex-col gap-2 p-[18px]">
          <h6 className="m-0" style={{ color: muted(55) }}>
            {card.title}
          </h6>
          <p className="m-0 text-[13px] leading-[1.55]" style={{ color: muted(70) }}>
            {card.body.map((seg, i) => (
              <Fragment key={i}>
                {seg.br && <br />}
                {seg.href ? <InfoLink seg={seg} /> : seg.text}
              </Fragment>
            ))}
          </p>
        </div>
      ))}
    </aside>
  );
}

export default async function AnnouncementsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const locale = toLocale((await params).locale);
  const c = getAnnouncementsContent(locale);
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const { data, meta } = await fetchAnnouncements({ locale, page, perPage: PER_PAGE });

  return (
    <PageShell active="" locale={locale}>
      <Breadcrumbs items={c.breadcrumbs} />
      <div className="flex items-baseline gap-[14px] border-b border-[var(--color-divider)] pb-[14px]">
        <h1 className="m-0 text-[36px] uppercase tracking-[.02em]">{c.title}</h1>
        <span className="text-xs" style={{ color: muted(50) }}>
          {c.subtitle}
        </span>
      </div>

      <AnnouncementsFilter data={data}>
        <Aside info={c.info} />
      </AnnouncementsFilter>
      <Pagination
        locale={locale}
        currentPage={meta.current_page}
        lastPage={meta.last_page}
        basePath="/announcements"
      />
    </PageShell>
  );
}
