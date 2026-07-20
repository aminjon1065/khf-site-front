import { Fragment } from "react";
import Link from "next/link";
import PageShell from "@/components/public/PageShell";
import { Breadcrumbs, muted } from "@/components/public/ui";
import { fetchAnnouncements } from "@/lib/api";
import AnnouncementsFilter from "./AnnouncementsFilter";
import { announcementsContent as c, type InfoSegment } from "./content";

export const metadata = { title: "Объявления" };

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
function Aside() {
  return (
    <aside className="flex flex-col gap-5">
      {c.info.map((card) => (
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

export default async function AnnouncementsPage() {
  const data = await fetchAnnouncements();

  return (
    <PageShell active="">
      <Breadcrumbs items={c.breadcrumbs} />
      <div className="flex items-baseline gap-[14px] border-b border-[var(--color-divider)] pb-[14px]">
        <h1 className="m-0 text-[36px] uppercase tracking-[.02em]">{c.title}</h1>
        <span className="text-xs" style={{ color: muted(50) }}>
          {c.subtitle}
        </span>
      </div>

      <AnnouncementsFilter data={data}>
        <Aside />
      </AnnouncementsFilter>
    </PageShell>
  );
}
