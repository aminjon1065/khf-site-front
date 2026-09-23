import { Fragment } from "react";
import type { CSSProperties, ReactNode } from "react";
import Link from "@/components/i18n/LocaleLink";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import FetchErrorFallback from "@/components/public/FetchErrorFallback";
import PageShell from "@/components/public/PageShell";
import TranslationNotice from "@/components/public/TranslationNotice";
import { BreadcrumbJsonLd } from "@/components/public/JsonLd";
import { Breadcrumbs, muted } from "@/components/public/ui";
import { redirectToCurrentSlug } from "@/lib/canonical-slug";
import {
  fetchInstruction,
  fetchInstructions,
  availableLocalesOf,
  fetchStaticParamSlugs,
  type ApiInstruction,
} from "@/lib/api";
import { toLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { buildMetadata } from "@/lib/seo";
import { cmsImageSource } from "@/lib/media";
import type { Run, SectionTone } from "./content";

export const revalidate = 60;

interface GuideSection {
  aria: string;
  tone: SectionTone;
  tag: string;
  title: string;
  steps: { n: string; text: Run[] }[];
}

interface RelatedLink {
  label: string;
  href: string;
}

// Порядок блоков и их тон (пресентация/логика) — канон; подписи (tag/title/aria)
// берутся из словаря активной локали.
const BLOCKS: {
  key: "before" | "during" | "after";
  tone: SectionTone;
}[] = [
  { key: "before", tone: "accent" },
  { key: "during", tone: "warning" },
  { key: "after", tone: "success" },
];

function buildSections(
  item: ApiInstruction,
  blocks: Dictionary["pages"]["guideDetail"]["blocks"],
): GuideSection[] {
  const sections = item.sections;
  if (!sections) {
    return [];
  }
  return BLOCKS.map((b) => {
    const meta = blocks[b.key];
    return {
      aria: meta.aria,
      tone: b.tone,
      tag: meta.tag,
      title: meta.title,
      steps: (sections[b.key] ?? []).map((text, i) => ({
        n: String(i + 1).padStart(2, "0"),
        text: [text] as Run[],
      })),
    };
  }).filter((s) => s.steps.length > 0);
}

async function relatedFor(slug: string, locale: Locale): Promise<RelatedLink[]> {
  const { data: all } = await fetchInstructions({ locale, perPage: 50 });
  return all
    .filter((i) => i.slug !== slug)
    .slice(0, 3)
    .map((i) => ({ label: i.title, href: routes.guide(i.slug) }));
}

export async function generateStaticParams({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return fetchStaticParamSlugs("instruction", toLocale(locale));
}

type GuideRouteProps = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({
  params,
}: GuideRouteProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const loc = toLocale(locale);
  const { common, pages } = getDictionary(loc);
  // A thrown (non-404) fetch failure degrades the same as "not found" here —
  // metadata has no meaningful title to offer either way. The page body's
  // own fetch (below) is what decides notFound() vs. the error boundary.
  const item = await fetchInstruction(slug, loc).catch(() => null);
  if (!item) {
    return { title: pages.meta.guideFallback, robots: { index: false } };
  }
  // hreflang и индексируемость — по реально опубликованным переводам, а не
  // по трём локалям механически: CMS отдаёт русский fallback на любой
  // запрошенный язык, и без этой проверки он выдавал бы себя за перевод.
  const availableLocales = await availableLocalesOf(item, "instruction", slug);
  const untranslated = !availableLocales.includes(loc);
  const image = cmsImageSource(item.image_data);

  return {
    ...buildMetadata({
      locale: loc,
      title: item.title,
      description: item.summary,
      path: `/guides/${slug}`,
      images: image ? [image] : undefined,
      type: "article",
      siteName: common.siteShort,
      availableLocales,
    }),
    ...(untranslated ? { robots: { index: false, follow: true } } : {}),
  };
}

const toneConfig: Record<
  SectionTone,
  { tagClassName: string; tagStyle: CSSProperties; numColor: string }
> = {
  accent: {
    tagClassName: "tag tag-accent",
    tagStyle: { fontSize: "11px" },
    numColor: "var(--color-accent-700)",
  },
  warning: {
    tagClassName: "tag",
    tagStyle: {
      background: "var(--hz-warning-bg)",
      color: "var(--hz-warning)",
      fontSize: "11px",
      fontWeight: 700,
    },
    numColor: "var(--hz-warning)",
  },
  success: {
    tagClassName: "tag",
    tagStyle: {
      background: "var(--hz-success-bg)",
      color: "var(--hz-success)",
      fontSize: "11px",
      fontWeight: 700,
    },
    numColor: "var(--hz-success)",
  },
};

function Runs({ runs }: { runs: Run[] }): ReactNode {
  return (
    <>
      {runs.map((r, i) =>
        typeof r === "string" ? (
          <Fragment key={i}>{r}</Fragment>
        ) : (
          <strong key={i}>{r.b}</strong>
        ),
      )}
    </>
  );
}

export default async function GuidePage({ params }: GuideRouteProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = toLocale(rawLocale);
  // Non-404 fetch failures are an expected-error case (see
  // FetchErrorFallback) — handled inline, not left to throw.
  let item;
  try {
    item = await fetchInstruction(slug, locale);
  } catch {
    return (
      <PageShell
        mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-6 max-[920px]:px-4"
      >
        <FetchErrorFallback locale={locale} />
      </PageShell>
    );
  }

  if (!item) {
    notFound();
  }
  redirectToCurrentSlug(slug, item.slug, locale, routes.guide);

  const { common, pages } = getDictionary(locale);
  const sections = buildSections(item, pages.guideDetail.blocks);
  const dont = item.sections?.prohibited ?? [];
  const related = await relatedFor(slug, locale);

  // Необязательное развёрнутое описание — санитайзенный HTML из редактора CMS.
  const bodyHtml = item.body ?? "";
  const bodyIsHtml = /<[a-z][\s\S]*>/i.test(bodyHtml);

  // Навигация по разделам: строится из фактически показанных блоков, поэтому
  // не может сослаться на пустое место. Показываем только когда разделов
  // действительно несколько — ради двух пунктов оглавление не нужно.
  const toc: { id: string; label: string }[] = [
    ...sections.map((s, i) => ({ id: `guide-step-${i}`, label: s.title })),
    ...(dont.length > 0
      ? [{ id: "guide-prohibited", label: pages.guideDetail.prohibited }]
      : []),
    ...(bodyIsHtml
      ? [{ id: "guide-more", label: pages.guideDetail.more }]
      : []),
  ];
  const showToc = toc.length >= 3;

  // Те же данные, что и в generateMetadata: наличие перевода на язык
  // страницы. Кэш fetch общий, поэтому это не повторный поход в CMS.
  const availableLocales = await availableLocalesOf(item, "instruction", slug);

  return (
    <PageShell
      mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-6 max-[920px]:px-4"
    >
      <BreadcrumbJsonLd
        items={[
          { label: common.breadcrumbHome, href: routes.home },
          { label: common.nav.guides, href: routes.guides },
          { label: item.title },
        ]}
        locale={locale}
      />
      <Breadcrumbs
        items={[
          { label: common.breadcrumbHome, href: routes.home },
          { label: common.nav.guides, href: routes.guides },
          { label: item.title },
        ]}
      />

      {/* Перевода на язык страницы нет — показываем это честно и ведём
          к опубликованной версии (страница при этом noindex). */}
      <TranslationNotice
        locale={locale}
        available={availableLocales}
        path={`/guides/${slug}`}
      />

      <div className="mt-2 grid grid-cols-[minmax(0,1.9fr)_minmax(260px,1fr)] items-start gap-9 max-[920px]:grid-cols-1">
        {/* Основной столбец: инструкция */}
        <div className="min-w-0 max-w-[74ch]">
          <span
            className="text-[11px] uppercase tracking-[.1em]"
            style={{ color: "var(--color-accent-700)" }}
          >
            {pages.guideDetail.kicker}
          </span>
          <h1 className="page-title mb-3.5 mt-2.5">{item.title}</h1>

          {/* Главное за 10 секунд — отдельное поле CMS, а не `summary`.
              Раньше сюда подставлялось краткое описание темы из каталожной
              плитки: под заголовком «что делать прямо сейчас» стояло «о чём
              эта инструкция». Пустое поле — блока нет. */}
          {item.key_point && (
            <div
              className="blueprint px-5 py-[18px]"
              style={{
                background:
                  "color-mix(in srgb,var(--color-accent) 8%,transparent)",
              }}
            >
              <h2 className="kicker-heading m-0 mb-2" style={{ color: muted(55) }}>
                {pages.guideDetail.keyPoint}
              </h2>
              <p className="m-0 text-[15px] leading-[1.6]">{item.key_point}</p>
            </div>
          )}

          {/* Компактная навигация по разделам. Обычные якорные ссылки: работают
              без JS, переживают шаринг адреса и не прячут содержимое — ключевые
              действия остаются видимыми на странице целиком. */}
          {showToc && (
            <nav
              aria-label={pages.guideDetail.contents}
              className="mt-6 border-y border-[var(--color-divider)] py-3"
            >
              <h2 className="kicker-heading m-0 mb-2" style={{ color: muted(55) }}>
                {pages.guideDetail.contents}
              </h2>
              <ul className="m-0 flex list-none flex-wrap gap-x-2 gap-y-1.5 p-0">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a
                      href={`#${t.id}`}
                      className="btn btn-secondary text-[13px]"
                    >
                      {t.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Блоки До / Во время / После */}
          {sections.map((section, si) => {
            const tone = toneConfig[section.tone];
            return (
              <section
                key={section.tag}
                id={`guide-step-${si}`}
                aria-label={section.aria}
                className={si === 0 ? "scroll-mt-28 mt-7" : "scroll-mt-28 mt-6"}
              >
                <h2 className="flex items-center gap-2.5 text-[22px] uppercase tracking-[.02em]">
                  <span className={tone.tagClassName} style={tone.tagStyle}>
                    {section.tag}
                  </span>
                  {section.title}
                </h2>
                <ol className="m-0 flex list-none flex-col p-0">
                  {section.steps.map((step, i) => {
                    const last = i === section.steps.length - 1;
                    return (
                      <li
                        key={step.n}
                        className="flex gap-3.5 py-3"
                        style={
                          last
                            ? undefined
                            : { borderBottom: "1px solid var(--color-divider)" }
                        }
                      >
                        <span
                          className="min-w-[28px] text-[19px] font-semibold [font-family:var(--font-heading)]"
                          style={{ color: tone.numColor }}
                        >
                          {step.n}
                        </span>
                        <span className="text-[14.5px] leading-[1.55]">
                          <Runs runs={step.text} />
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}

          {/* Чего делать нельзя */}
          {dont.length > 0 && (
            <section
              id="guide-prohibited"
              aria-label={pages.guideDetail.prohibited}
              className="blueprint mt-7 scroll-mt-28 px-5 py-[18px]"
              style={{ borderTop: "3px solid var(--hz-critical)" }}
            >
              <h2 className="kicker-heading m-0 mb-2.5" style={{ color: "var(--hz-critical)" }}>
                {pages.guideDetail.prohibited}
              </h2>
              <ul className="m-0 flex list-disc flex-col gap-1.5 pl-[18px] text-sm leading-[1.5]">
                {dont.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Подробнее — развёрнутое описание */}
          {bodyIsHtml && (
            <section
              id="guide-more"
              aria-label={pages.guideDetail.more}
              className="mt-7 scroll-mt-28"
            >
              <h2 className="text-[22px] uppercase tracking-[.02em]">
                {pages.guideDetail.more}
              </h2>
              <div
                className="article-prose"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            </section>
          )}
        </div>

        {/* Боковая колонка: материалы, экстренная помощь, связанные */}
        <aside className="flex flex-col gap-5">
          {/* Памятка в PDF: человек скачивает её и держит под рукой, когда
              связи может не быть. Блока не было вовсе — приложить файл к
              инструкции в CMS было нечем. */}
          {(item.attachments ?? []).length > 0 && (
            <div className="blueprint flex flex-col gap-2 p-[18px]">
              <h2 className="kicker-heading m-0" style={{ color: muted(55) }}>
                {pages.guideDetail.materials}
              </h2>
              {(item.attachments ?? []).map((file) => (
                <a
                  key={file.url}
                  href={file.url}
                  className="row-link flex items-center gap-2.5 border-b border-[var(--color-divider)] py-2.5 last:border-b-0"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <span className="tag tag-neutral flex-none">{file.ext}</span>
                  <span className="flex-1 text-[13.5px]">{file.title}</span>
                  <span
                    className="flex-none text-xs"
                    style={{ color: muted(50) }}
                  >
                    {file.size}
                  </span>
                </a>
              ))}
            </div>
          )}
          <div className="blueprint flex flex-col gap-2 p-[18px]">
            <h2 className="kicker-heading m-0" style={{ color: muted(55) }}>
              {pages.guideDetail.emergencyHelp}
            </h2>
            <a
              href="tel:112"
              className="text-[26px] font-semibold no-underline [font-family:var(--font-heading)]"
              style={{ color: "var(--hz-critical)" }}
            >
              112
            </a>
            <span className="text-[12.5px]" style={{ color: muted(62) }}>
              {pages.guideDetail.emergencyNote}
            </span>
          </div>

          {related.length > 0 && (
            <div>
              <h2 className="kicker-heading m-0 mb-2.5" style={{ color: muted(55) }}>
                {pages.guideDetail.related}
              </h2>
              {related.map((r, i) => {
                const last = i === related.length - 1;
                return (
                  <Link
                    key={r.href}
                    href={r.href}
                    className="row-link block py-2.5 text-[15.5px] font-semibold no-underline [font-family:var(--font-heading)]"
                    style={{
                      color: "inherit",
                      borderBottom: last
                        ? undefined
                        : "1px solid var(--color-divider)",
                    }}
                  >
                    {r.label}
                  </Link>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </PageShell>
  );
}
