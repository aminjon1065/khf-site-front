import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import PageShell from "@/components/public/PageShell";
import { SectionHeader, ImageSlot, muted } from "@/components/public/ui";
import NewsSlider from "@/components/public/NewsSlider";
import TjRiskMap from "@/components/public/TjRiskMap";
import { fetchHome, type ApiAlert } from "@/lib/api";
import { home } from "@/lib/copy/home";
import { routes } from "@/lib/routes";
import {
  legendItems,
  levelBadge,
  levelDotColor,
  levelMapFill,
} from "@/lib/levels";
import type { AlertLevel, RegionStatus } from "@/lib/types";

export const revalidate = 60;

/** Иконка малой плитки «быстрых действий». */
function QuickIcon({ name }: { name: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--color-accent-700)",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "waves":
      return (
        <svg {...common}>
          <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
          <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
          <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        </svg>
      );
    case "aid":
      return (
        <svg {...common}>
          <path d="M8 3.1V7a4 4 0 0 0 8 0V3.1M12 12h.01M12 12a4 4 0 0 1 4 4v5H8v-5a4 4 0 0 1 4-4Z" />
          <path d="M4 21h16" />
        </svg>
      );
    case "map":
      return (
        <svg {...common}>
          <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
          <path d="M15 5.764v15M9 3.236v15" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
        </svg>
      );
    case "message":
      return (
        <svg {...common}>
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
          <path d="M12 8v4M12 15h.01" />
        </svg>
      );
    default:
      return null;
  }
}

/** Верхний баннер обстановки — состояние приходит из CMS. */
function AlertBanner({
  state,
  top,
}: {
  state: "calm" | "warning" | "critical";
  top?: ApiAlert;
}) {
  if (state === "critical") {
    const c = home.critical;
    const href = top ? `/alerts/${top.slug}` : routes.alert;
    return (
      <section
        aria-label="Критическое предупреждение"
        style={{ background: "var(--hz-critical)", color: "#fff" }}
      >
        <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-[14px] px-6 py-7 max-[920px]:px-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="crit-dot h-3 w-3 rounded-full" style={{ background: "#fff" }} />
            <span className="text-[11px] font-bold uppercase tracking-[.12em]">
              {top?.level_label ?? c.kicker}
            </span>
            {top?.datetime && <span className="text-xs opacity-85">{top.datetime}</span>}
          </div>
          <h1 className="m-0 text-[34px]" style={{ color: "#fff" }}>
            {top?.title ?? c.title}
          </h1>
          <p className="m-0 max-w-[760px] text-base leading-[1.5]">
            {top?.summary ?? c.text}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={routes.guides}
              className="btn px-5 py-2.5 text-[15px]"
              style={{ background: "#fff", color: "var(--hz-critical)", borderColor: "#fff" }}
            >
              Что делать
            </Link>
            <Link
              href={href}
              className="btn px-5 py-2.5 text-[15px]"
              style={{ color: "#fff", borderColor: "rgba(255,255,255,.6)" }}
            >
              Подробности и карта
            </Link>
            <a
              href="tel:112"
              className="btn px-5 py-2.5 text-[15px]"
              style={{ color: "#fff", borderColor: "rgba(255,255,255,.6)" }}
            >
              Вызов 112
            </a>
          </div>
        </div>
      </section>
    );
  }
  if (state === "warning") {
    const w = home.warning;
    const href = top ? `/alerts/${top.slug}` : routes.alert;
    return (
      <section
        aria-label="Действующее предупреждение"
        className="border-b border-[var(--color-divider)]"
        style={{ background: "var(--hz-warning-bg)" }}
      >
        <div className="mx-auto flex w-full max-w-[1160px] flex-wrap items-center gap-[14px] px-6 py-[14px] max-[920px]:px-4">
          <TriangleAlert
            size={20}
            strokeWidth={1.5}
            aria-hidden="true"
            style={{ color: "var(--hz-warning)", flex: "none" }}
          />
          <span
            className="tag font-bold uppercase tracking-[.08em]"
            style={{ background: "var(--hz-warning)", color: "var(--color-bg)" }}
          >
            {top?.level_label ?? w.levelLabel}
          </span>
          <span className="min-w-[260px] flex-1 text-sm">
            <strong>{top?.title ?? w.strong}</strong>
            {top ? "" : w.text}
          </span>
          {(top?.datetime ?? w.time) && (
            <span className="text-xs" style={{ color: muted(55) }}>
              {top?.datetime ?? w.time}
            </span>
          )}
          <Link href={href} className="btn btn-secondary text-[13px]">
            {w.more}
          </Link>
        </div>
      </section>
    );
  }
  const c = home.calm;
  return (
    <section aria-label="Оперативный статус" className="border-b border-[var(--color-divider)]">
      <div className="mx-auto flex w-full max-w-[1160px] flex-wrap items-center gap-2.5 px-6 py-2.5 text-[13px] max-[920px]:px-4">
        <span className="h-[9px] w-[9px] rounded-full" style={{ background: "var(--hz-success)" }} />
        <span>
          <strong>{c.strong}</strong>
          {c.text}
        </span>
        <span className="flex-1" />
        <Link href={routes.map} style={{ color: "var(--color-accent-700)" }}>
          {c.mapLink}
        </Link>
      </div>
    </section>
  );
}

function tagBg(level: AlertLevel): string {
  return `color-mix(in srgb, ${levelDotColor[level]} 14%, transparent)`;
}

export default async function HomePage() {
  const data = await fetchHome();
  const isOn = (type: string) => data.blocks.some((b) => b.type === type);
  const top = data.alerts.items[0];

  const regions: RegionStatus[] = data.alerts.regions.map((r) => ({
    key: r.key as RegionStatus["key"],
    name: r.name,
    level: r.level,
    count: r.count,
    statusText: r.statusText,
  }));

  const featured = data.news[0];
  const newsList = data.news.slice(1, 5);
  const p = home.president;

  return (
    <PageShell
      active="home"
      topSlot={<AlertBanner state={data.alerts.state} top={top} />}
    >
      {/* Главное: слайдер + карточка Президента */}
      <section
        aria-label="Главное"
        className="grid grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] items-stretch gap-7 max-[920px]:grid-cols-1"
      >
        <NewsSlider slides={home.slider.slides} readMore={home.slider.readMore} />
        <a
          href={p.href}
          target="_blank"
          rel="noopener"
          className="blueprint surface-hover flex min-w-0 flex-col"
          aria-label={p.aria}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <span className="block min-h-[240px] flex-1">
            <ImageSlot src={p.photo} alt="Фото Президента" />
          </span>
          <span className="flex flex-col gap-1 px-4 pb-4 pt-[14px]">
            <span
              className="text-[10.5px] uppercase tracking-[.1em]"
              style={{ color: "var(--color-accent-700)" }}
            >
              {p.kicker}
            </span>
            <span className="text-[19px] font-semibold leading-[1.15] [font-family:var(--font-heading)]">
              {p.name}
            </span>
            <span className="text-xs" style={{ color: muted(60) }}>
              {p.role}
            </span>
            <span
              className="mt-2 border-t border-[var(--color-divider)] pt-2 text-xs leading-[1.5]"
              style={{ color: muted(62) }}
            >
              {p.quote}
            </span>
          </span>
        </a>
      </section>

      {/* Быстрые действия */}
      <section aria-label="Быстрые действия" className="mt-[52px]">
        <SectionHeader
          title={home.quickActions.title}
          index={home.quickActions.index}
          link={{ label: home.quickActions.allLink, href: routes.guides }}
        />
        <div className="grid grid-cols-4 grid-rows-[auto_auto] gap-[14px] max-[920px]:grid-cols-2 max-[560px]:grid-cols-1">
          <Link
            href={home.quickActions.big.href}
            className="blueprint accent-900-hover row-span-2 flex flex-col gap-2.5 p-5 max-[560px]:row-span-1"
            style={{ background: "var(--color-accent-900)", textDecoration: "none", color: "inherit" }}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d6ebff"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m2 12 5.25 5 2.625-5H8.75l2.625-5L14 12h-1.125l2.625 5L21 12" />
              <path d="M12 2v3M4.22 4.22l2.12 2.12M17.66 6.34l2.12-2.12" />
            </svg>
            <span className="text-[22px] font-semibold leading-[1.15] text-white [font-family:var(--font-heading)]">
              {home.quickActions.big.title}
            </span>
            <span className="text-[13px] leading-[1.5] text-white/75">
              {home.quickActions.big.desc}
            </span>
            <span className="mt-auto text-[13px]" style={{ color: "#d6ebff" }}>
              {home.quickActions.big.cta}
            </span>
          </Link>
          {home.quickActions.small.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="blueprint surface-hover flex items-start gap-3 p-4"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <QuickIcon name={s.icon} />
              <span>
                <span className="block text-[17px] font-semibold [font-family:var(--font-heading)]">
                  {s.title}
                </span>
                <span className="text-[12.5px]" style={{ color: muted(62) }}>
                  {s.desc}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Обстановка по регионам */}
      {isOn("regions_map") && (
        <section aria-label="Карта предупреждений" className="mt-[52px]">
          <SectionHeader
            title={home.regionSection.title}
            index={home.regionSection.index}
          />
          <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)] items-start gap-7 max-[920px]:grid-cols-1">
            <div className="blueprint p-3">
              <TjRiskMap regions={regions} height={440} />
              <div
                className="mt-2.5 flex flex-wrap gap-4 border-t border-[var(--color-divider)] px-2 pb-1 pt-2.5 text-xs"
                aria-label="Легенда карты"
              >
                {legendItems.map((l) => (
                  <span key={l.level} className="inline-flex items-center gap-1.5">
                    <span
                      className="h-3 w-3 border border-[var(--color-divider)]"
                      style={{ background: levelMapFill[l.level] }}
                    />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
            <div role="list" aria-label="Обстановка по регионам — список" className="flex flex-col">
              {regions.map((r) => (
                <div
                  key={r.key}
                  role="listitem"
                  className="flex items-center gap-2.5 border-b border-[var(--color-divider)] px-0.5 py-3"
                >
                  <span
                    className="h-[9px] w-[9px] flex-none rounded-full"
                    style={{ background: levelDotColor[r.level] }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold [font-family:var(--font-heading)]">
                      {r.name}
                    </span>
                    <span className="text-xs" style={{ color: muted(58) }}>
                      {r.statusText}
                    </span>
                  </span>
                  <span className="tag tag-neutral flex-none">
                    {levelBadge[r.level]}
                  </span>
                </div>
              ))}
              <Link href={routes.map} className="btn btn-secondary mt-[14px] self-start">
                {home.regionSection.openFull}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Предупреждения */}
      {isOn("active_alerts") && data.alerts.items.length > 0 && (
        <section aria-label="Последние предупреждения" className="mt-[52px]">
          <SectionHeader
            title={home.warnings.title}
            index={home.warnings.index}
            link={{ label: home.warnings.allLink, href: routes.alert }}
          />
          <div className="grid grid-cols-3 gap-[14px] max-[920px]:grid-cols-1">
            {data.alerts.items.map((a) => {
              const color = levelDotColor[a.level as AlertLevel];
              return (
                <Link
                  key={a.slug}
                  href={`/alerts/${a.slug}`}
                  className="blueprint surface-hover-6 flex flex-col gap-2 p-[18px]"
                  style={{ textDecoration: "none", color: "inherit", borderTop: `3px solid ${color}` }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="tag font-bold uppercase tracking-[.06em]"
                      style={{ background: tagBg(a.level as AlertLevel), color }}
                    >
                      {a.hazard_label}
                    </span>
                    <span className="text-[11.5px]" style={{ color: muted(50) }}>
                      {a.status}
                    </span>
                  </div>
                  <span className="text-[19px] font-semibold leading-[1.2] [font-family:var(--font-heading)]">
                    {a.title}
                  </span>
                  <span className="text-[12.5px]" style={{ color: muted(62) }}>
                    {a.region}
                    {a.datetime ? ` · ${a.datetime}` : ""}
                  </span>
                  <span className="text-[13px] leading-[1.5]" style={{ color: muted(72) }}>
                    {a.summary}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Новости */}
      {isOn("latest_news") && featured && (
        <section aria-label="Новости" className="mt-[52px]">
          <SectionHeader
            title={home.news.title}
            index={home.news.index}
            link={{ label: home.news.allLink, href: routes.news }}
          />
          <div className="grid grid-cols-2 gap-7 max-[920px]:grid-cols-1">
            <Link
              href={`/news/${featured.slug}`}
              className="flex flex-col gap-3"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <span className="blueprint duotone block h-[220px]">
                {featured.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featured.image}
                    srcSet={featured.image_srcset ?? undefined}
                    sizes="(max-width: 920px) 100vw, 620px"
                    alt={featured.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageSlot label={home.news.featured.photoLabel} />
                )}
              </span>
              <span
                className="text-[11px] uppercase tracking-[.1em]"
                style={{ color: "var(--color-accent-700)" }}
              >
                {[featured.category, featured.date].filter(Boolean).join(" · ")}
              </span>
              <span className="text-[21px] font-semibold leading-[1.2] [font-family:var(--font-heading)]">
                {featured.title}
              </span>
            </Link>
            <div className="flex flex-col">
              {newsList.map((it, i) => (
                <Link
                  key={it.slug}
                  href={`/news/${it.slug}`}
                  className="row-link border-b border-[var(--color-divider)]"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    padding: i === 0 ? "0 0 14px" : "14px 0",
                    borderBottom: i === newsList.length - 1 ? "none" : undefined,
                  }}
                >
                  <span className="text-[11px] uppercase tracking-[.08em]" style={{ color: muted(50) }}>
                    {[it.category, it.date].filter(Boolean).join(" · ")}
                  </span>
                  <span className="mt-1 block text-[17px] font-semibold leading-[1.25] [font-family:var(--font-heading)]">
                    {it.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Ключевые показатели */}
      <section aria-label="Ключевые показатели" className="mt-[52px]">
        <div className="blueprint grid grid-cols-4 py-2 max-[920px]:grid-cols-2 max-[560px]:grid-cols-1">
          {home.kpis.map((k, i) => (
            <div
              key={k.value}
              className="px-[22px] py-[18px]"
              style={{
                borderRight:
                  i === home.kpis.length - 1 ? undefined : "1px solid var(--color-divider)",
              }}
            >
              <div className="text-[34px] font-semibold [font-family:var(--font-heading)]">
                {k.value}
              </div>
              <div className="text-[12.5px] leading-[1.4]" style={{ color: muted(62) }}>
                {k.label[0]}
                <br />
                {k.label[1]}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Официальная информация: документы + объявления / проекты */}
      <section
        aria-label="Официальная информация"
        className="mt-[52px] grid grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)] gap-7 max-[920px]:grid-cols-1"
      >
        <div>
          {isOn("documents") && data.documents.length > 0 && (
            <>
              <SectionHeader
                title={home.documents.title}
                index={home.documents.index}
                link={{ label: home.documents.allLink, href: routes.documents }}
              />
              {data.documents.map((d) => (
                <Link
                  key={d.id}
                  href={d.href ?? routes.documents}
                  className="row-link flex items-center gap-3 border-b border-[var(--color-divider)] px-0.5 py-3"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <span className="tag tag-neutral flex-none">{d.type}</span>
                  <span className="flex-1 text-sm">{d.title}</span>
                  <span className="flex-none text-xs" style={{ color: muted(50) }}>
                    {d.size ?? ""}
                  </span>
                </Link>
              ))}
            </>
          )}

          {isOn("announcements") && data.announcements.length > 0 && (
            <>
              <SectionHeader
                id="announcements"
                title={home.announcements.title}
                index={home.announcements.index}
                link={{ label: home.announcements.allLink, href: routes.announcements }}
              />
              {data.announcements.map((a) => (
                <Link
                  key={a.title}
                  href={routes.announcements}
                  className="row-link flex items-center gap-3 border-b border-[var(--color-divider)] px-0.5 py-3"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <span
                    className={`tag ${a.kind === "vacancy" ? "tag-accent" : "tag-outline"} flex-none`}
                  >
                    {a.kind_label}
                  </span>
                  <span className="flex-1 text-sm">{a.title}</span>
                  <span className="flex-none text-xs" style={{ color: muted(50) }}>
                    {a.deadline}
                  </span>
                </Link>
              ))}
            </>
          )}
        </div>

        {isOn("projects") && data.projects.length > 0 && (
          <div className="min-w-0 self-start">
            <SectionHeader
              title={home.projects.title}
              link={{ label: home.projects.allLink, href: routes.projects }}
            />
            {data.projects.map((pr) => (
              <Link
                key={pr.slug}
                href={`/projects/${pr.slug}`}
                className="blueprint surface-hover mt-[14px] flex flex-col gap-1.5 p-4"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="tag text-[10px] font-semibold"
                    style={{ background: "var(--hz-success-bg)", color: "var(--hz-success)" }}
                  >
                    {pr.status}
                  </span>
                  <span className="text-[11.5px]" style={{ color: muted(52) }}>
                    {pr.years}
                  </span>
                </span>
                <span className="text-[16.5px] font-semibold leading-[1.25] [font-family:var(--font-heading)]">
                  {pr.title}
                </span>
                <span className="text-xs" style={{ color: muted(58) }}>
                  {[pr.partner, pr.budget].filter(Boolean).join(" · ")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
