import type { Metadata } from "next";
import Link from "@/components/i18n/LocaleLink";
import { notFound } from "next/navigation";
import FetchErrorFallback from "@/components/public/FetchErrorFallback";
import PageShell from "@/components/public/PageShell";
import ViewBeacon from "@/components/public/ViewBeacon";
import TranslationNotice from "@/components/public/TranslationNotice";
import { BreadcrumbJsonLd } from "@/components/public/JsonLd";
import { Breadcrumbs, muted } from "@/components/public/ui";
import TjRiskMap from "@/components/public/TjRiskMap";
import { redirectToCurrentSlug } from "@/lib/canonical-slug";
import {
  availableLocalesOf,
  fetchAlert,
  fetchAlerts,
  fetchStaticParamSlugs,
} from "@/lib/api";
import { htmlLang, toLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import {
  levelDotColor,
  levelStatusTexts,
  regionNames,
  regionOrder,
} from "@/lib/levels";
import { routes } from "@/lib/routes";
import { buildMetadata } from "@/lib/seo";
import type { AlertLevel, RegionStatus } from "@/lib/types";
import ShareButton from "../ShareButton";

export const revalidate = 60;

type Params = { locale: string; slug: string };

export async function generateStaticParams({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return fetchStaticParamSlugs("alert", toLocale(locale));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const loc = toLocale(locale);
  const { common, pages } = getDictionary(loc);
  // A thrown (non-404) fetch failure degrades the same as "not found" here —
  // metadata has no meaningful title to offer either way. The page body's
  // own fetch (below) is what decides notFound() vs. the error boundary.
  const a = await fetchAlert(slug, loc).catch(() => null);
  if (!a) {
    return { title: pages.meta.alertFallback, robots: { index: false } };
  }
  // hreflang и индексируемость — по реально опубликованным переводам, а не
  // по трём локалям механически: CMS отдаёт русский fallback на любой
  // запрошенный язык, и без этой проверки он выдавал бы себя за перевод.
  const availableLocales = await availableLocalesOf(a, "alert", slug);
  const untranslated = !availableLocales.includes(loc);
  return {
    ...buildMetadata({
      locale: loc,
      title: a.title,
      description: a.summary,
      path: `/alerts/${slug}`,
      type: "article",
      publishedTime: a.datetime,
      siteName: common.siteShort,
      availableLocales,
    }),
    ...(untranslated ? { robots: { index: false, follow: true } } : {}),
  };
}

/**
 * Дата и время записи истории на языке страницы. При неразобранной метке
 * возвращаем её как есть — лучше показать сырое значение, чем пустую строку
 * там, где читатель ждёт время события.
 */
function updateTime(iso: string, locale: Locale): string {
  const parsed = new Date(iso);

  if (Number.isNaN(parsed.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat(htmlLang(locale), {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Dushanbe",
  }).format(parsed);
}

export default async function AlertDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = toLocale(rawLocale);
  const { pages } = getDictionary(locale);
  // Non-404 fetch failures are an expected-error case (see
  // FetchErrorFallback) — handled inline, not left to throw.
  let alert;
  try {
    alert = await fetchAlert(slug, locale);
  } catch {
    return (
      <PageShell
        mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-6 max-[920px]:px-4"
      >
        <FetchErrorFallback locale={locale} />
      </PageShell>
    );
  }

  if (!alert) {
    notFound();
  }
  redirectToCurrentSlug(
    slug,
    alert.slug,
    locale,
    (current) => `${routes.alert}/${current}`,
  );

  const level = alert.level as AlertLevel;
  // Старая ссылка из мессенджера ведёт и на завершённое предупреждение:
  // страница остаётся для справки, но не должна выглядеть действующей угрозой.
  const ended = alert.status_code === "completed";
  const accent = ended ? muted(45) : levelDotColor[level];
  const statusTone =
    ended
      ? { background: "var(--color-neutral-100)", color: "var(--color-neutral-800)" }
      : alert.status_code === "upcoming"
        ? { background: "var(--hz-info-bg)", color: "var(--hz-info)" }
        : { background: "var(--hz-warning-bg)", color: "var(--hz-warning)" };
  const steps = alert.instructions ?? [];
  const paragraphs = (alert.body ?? "")
    .split(/\r?\n{2,}|\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Карта зоны действия: регионы предупреждения — в цвете уровня, прочие — штатно.
  const zoneCodes = new Set(
    alert.territory_type === "country"
      ? regionOrder
      : (alert.regions ?? []).map((r) => r.code),
  );
  const names = regionNames(locale);
  const statuses = levelStatusTexts(locale);
  const zoneRegions: RegionStatus[] = regionOrder.map((k) => {
    const inZone = zoneCodes.has(k);
    const lvl: AlertLevel = inZone ? level : "none";
    return {
      key: k,
      name: names[k],
      level: lvl,
      count: inZone ? 1 : 0,
      statusText: statuses[lvl],
    };
  });

  // Районы, которые оператор указал внутри регионов: на карте их не видно,
  // поэтому под ней — список «регион: районы». Только когда районы есть,
  // иначе он повторял бы строку «Регионы» в шапке.
  const districts = alert.districts ?? [];
  const zoneList =
    alert.territory_type === "regions" && districts.length > 0
      ? (alert.regions ?? []).map((r) => ({
          code: r.code,
          name: r.name,
          districts: districts
            .filter((d) => d.region_code === r.code)
            .map((d) => d.name),
        }))
      : [];
  const guides = alert.related_instructions ?? [];

  const related = ((await fetchAlerts(locale)) ?? [])
    .filter((a) => a.slug !== slug)
    .slice(0, 3);

  // Те же данные, что и в generateMetadata: наличие перевода на язык
  // страницы. Кэш fetch общий, поэтому это не повторный поход в CMS.
  const availableLocales = await availableLocalesOf(alert, "alert", slug);

  return (
    <PageShell
      mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-6 max-[920px]:px-4"
    >
      <ViewBeacon type="alert" slug={alert.slug} locale={locale} />
      <BreadcrumbJsonLd
        items={[
          { label: pages.alertDetail.breadcrumbHome, href: routes.home },
          { label: pages.alertDetail.breadcrumbAlerts, href: routes.alert },
          { label: alert.title },
        ]}
        locale={locale}
      />
      <Breadcrumbs
        items={[
          { label: pages.alertDetail.breadcrumbHome, href: routes.home },
          { label: pages.alertDetail.breadcrumbAlerts, href: routes.alert },
          { label: alert.title },
        ]}
      />

      {/* Перевода на язык страницы нет — показываем это честно и ведём
          к опубликованной версии (страница при этом noindex). */}
      <TranslationNotice
        locale={locale}
        available={availableLocales}
        path={`/alerts/${slug}`}
      />

      {ended && (
        <p
          role="status"
          className="mb-0 mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-l-[3px] px-4 py-3 text-[14px] leading-[1.5]"
          style={{
            borderColor: "var(--color-neutral-500)",
            background: "var(--color-neutral-100)",
          }}
        >
          <strong>{pages.alertDetail.endedTitle}.</strong>
          <span>{pages.alertDetail.endedText}</span>
          <Link
            href={routes.alert}
            className="font-medium"
            style={{ color: "var(--color-accent-700)" }}
          >
            {pages.alertDetail.endedLink}
          </Link>
        </p>
      )}

      {/* Шапка предупреждения */}
      <section
        aria-label={pages.alertDetail.aria}
        className="blueprint mt-5 flex flex-col gap-[14px] px-[26px] py-6"
        style={{ borderTop: `4px solid ${accent}` }}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className="tag text-xs font-bold uppercase tracking-[.08em]"
            style={{ background: accent, color: "var(--color-bg)", padding: "5px 12px" }}
          >
            {alert.level_label}
          </span>
          <span className="tag font-semibold" style={statusTone}>
            {alert.status}
          </span>
          <span className="tag tag-neutral">{alert.hazard_label}</span>
          <span className="flex-1" />
          <ShareButton
            title={alert.title}
            summary={alert.summary}
            idle={pages.alertDetail.share}
            copied={pages.alertDetail.shared}
          />
        </div>

        <h1 className="m-0 text-[32px] leading-[1.12]">{alert.title}</h1>

        {alert.meta && alert.meta.length > 0 && (
          <div className="flex flex-wrap gap-6 text-[13px]" style={{ color: muted(62) }}>
            {alert.meta.map((m) => (
              <span key={m.label}>
                <strong style={{ color: "var(--color-text)" }}>{m.label}:</strong>{" "}
                {m.value}
              </span>
            ))}
          </div>
        )}
      </section>

      <div className="mt-7 grid grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)] items-start gap-7 max-[920px]:grid-cols-1">
        {/* Основная колонка */}
        <div className="min-w-0">
          {steps.length > 0 && (
            <section
              aria-label={pages.alertDetail.whatToDo}
              className="blueprint px-6 py-[22px]"
              style={{ background: "color-mix(in srgb,var(--hz-warning) 8%,transparent)" }}
            >
              <h2 className="mt-0 mb-[14px] text-[22px] uppercase tracking-[.02em]">
                {pages.alertDetail.whatToDo}
              </h2>
              <ol className="m-0 flex list-none flex-col gap-3 p-0">
                {steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-[14px]">
                    <span
                      className="min-w-[28px] text-xl font-semibold [font-family:var(--font-heading)]"
                      style={{ color: "var(--hz-warning)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[14.5px] leading-[1.5]">{step}</span>
                  </li>
                ))}
              </ol>
              <Link href={routes.guides} className="btn btn-secondary mt-4">
                {pages.alertDetail.guidesLink}
              </Link>
            </section>
          )}

          {/* Инструкции, которые оператор связал с предупреждением: что
              именно прочитать, а не весь каталог. */}
          {guides.length > 0 && (
            <section aria-labelledby="alert-guides" className="mt-7">
              <h2
                id="alert-guides"
                className="mt-0 mb-[14px] text-[22px] uppercase tracking-[.02em]"
              >
                {pages.alertDetail.relatedGuides}
              </h2>
              <ul className="m-0 grid list-none grid-cols-2 gap-[14px] p-0 max-[920px]:grid-cols-1">
                {guides.map((g) => (
                  <li key={g.slug} className="flex">
                    <Link
                      href={routes.guide(g.slug)}
                      className="blueprint surface-hover flex w-full flex-col gap-2 p-4"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      {g.hazard_label && (
                        <span
                          className="text-[10.5px] uppercase tracking-[.1em]"
                          style={{ color: muted(55) }}
                        >
                          {g.hazard_label}
                        </span>
                      )}
                      <span className="text-[17px] font-semibold leading-[1.25] [font-family:var(--font-heading)]">
                        {g.title}
                      </span>
                      {g.summary && (
                        <span
                          className="text-[13px] leading-[1.5]"
                          style={{ color: muted(65) }}
                        >
                          {g.summary}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {paragraphs.length > 0 && (
            <section aria-label={pages.alertDetail.officialDescription} className="mt-7 max-w-[70ch]">
              <h2 className="text-[22px] uppercase tracking-[.02em]">
                {pages.alertDetail.officialInfo}
              </h2>
              {paragraphs.map((p, i) => (
                <p key={i} className="text-[15px] leading-[1.65]">
                  {p}
                </p>
              ))}
            </section>
          )}

          {/* История обновлений. Предупреждение живёт часами и меняется: зона
              расширилась, уровень снижен, угроза снята. Без этого блока
              читателю неоткуда узнать, свежая ли перед ним информация. */}
          {(alert.updates ?? []).length > 0 && (
            <section
              aria-label={pages.alertDetail.updateHistory}
              className="mt-7 max-w-[70ch]"
            >
              <h2 className="text-[22px] uppercase tracking-[.02em]">
                {pages.alertDetail.updateHistory}
              </h2>
              <ol className="m-0 list-none p-0">
                {(alert.updates ?? []).map((entry) => (
                  <li
                    key={entry.at}
                    className="border-l-2 border-[var(--color-divider)] py-2 pl-4"
                  >
                    <time
                      dateTime={entry.at}
                      className="block text-xs"
                      style={{ color: muted(55) }}
                    >
                      {updateTime(entry.at, locale)}
                    </time>
                    <p className="m-0 text-[15px] leading-[1.6]">
                      {entry.text}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        {/* Боковая колонка */}
        <aside className="flex min-w-0 flex-col gap-5">
          <div className="blueprint p-3">
            <h2 className="kicker-heading mx-1.5 mt-1 mb-2" style={{ color: muted(55) }}>
              {pages.alertDetail.zone}
            </h2>
            <TjRiskMap regions={zoneRegions} height={300} showLabels={false} />
            {zoneList.length > 0 && (
              <ul
                aria-label={pages.alertDetail.districts}
                className="mx-1.5 mb-1 mt-2.5 flex list-none flex-col gap-1.5 p-0 text-[13px] leading-[1.45]"
              >
                {zoneList.map((r) => (
                  <li key={r.code}>
                    <strong className="font-semibold">{r.name}</strong>
                    {r.districts.length > 0 && (
                      <span style={{ color: muted(70) }}>
                        : {r.districts.join(", ")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {/* Слова оператора о зоне («трасса Душанбе — Чанак, 45–72 км») —
                на языке страницы; на другом языке CMS отдаёт null. */}
            {alert.territory_note && (
              <p
                className="mx-1.5 mb-1 mt-2.5 text-[13px] leading-[1.5]"
                style={{ color: muted(70) }}
              >
                {alert.territory_note}
              </p>
            )}
          </div>

          <div className="blueprint flex flex-col gap-2 p-[18px]">
            <h2 className="kicker-heading m-0" style={{ color: muted(55) }}>
              {pages.alertDetail.emergencyHelp}
            </h2>
            <a
              href="tel:112"
              className="text-[26px] font-semibold no-underline [font-family:var(--font-heading)]"
              style={{ color: "var(--hz-critical)" }}
            >
              112
            </a>
            {alert.contacts && (
              <span className="text-[12.5px]" style={{ color: muted(62) }}>
                {alert.contacts}
              </span>
            )}
          </div>

          {related.length > 0 && (
            <div>
              <h2 className="kicker-heading m-0 mb-2.5" style={{ color: muted(55) }}>
                {pages.alertDetail.related}
              </h2>
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/alerts/${r.slug}`}
                  className="row-link block border-b border-[var(--color-divider)] py-2.5"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <span className="flex items-center gap-2 text-[11px]">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: levelDotColor[r.level as AlertLevel] }}
                    />
                    <span style={{ color: muted(55) }}>
                      {r.hazard_label} · {r.status}
                    </span>
                  </span>
                  <span className="mt-[3px] block text-[15px] font-semibold [font-family:var(--font-heading)]">
                    {r.title}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>
    </PageShell>
  );
}
