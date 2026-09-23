import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CmsProse from "@/components/public/CmsProse";
import FetchErrorFallback from "@/components/public/FetchErrorFallback";
import { BreadcrumbJsonLd } from "@/components/public/JsonLd";
import PageShell from "@/components/public/PageShell";
import TranslationNotice from "@/components/public/TranslationNotice";
import { Breadcrumbs, muted } from "@/components/public/ui";
import { availableLocalesOf, fetchPage } from "@/lib/api";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes, type CanonicalCmsPageSlug } from "@/lib/routes";
import { buildMetadata, metaDescription } from "@/lib/seo";

// «О Комитете» — CMS-страница `about` в собственном разделе (CMS_PAGE_ROUTES);
// /pages/about ведёт сюда редиректом. Встроенного текста у раздела нет,
// поэтому он ведёт себя как pages/[slug]: 404 без страницы, FetchErrorFallback
// при сбое CMS, TranslationNotice и noindex без перевода.
const SLUG = "about" satisfies CanonicalCmsPageSlug;

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { common, pages } = getDictionary(locale);
  // Сбой CMS здесь равен «страницы нет»: что показать вместо материала,
  // решает сама страница ниже (notFound или FetchErrorFallback).
  const page = await fetchPage(SLUG, locale).catch(() => null);
  if (!page) {
    return { title: pages.meta.about, robots: { index: false } };
  }
  // hreflang и индексируемость — по реально опубликованным переводам: русский
  // fallback на /en или /tj не должен выдавать себя за перевод.
  const availableLocales = await availableLocalesOf(page, "page", SLUG);
  const untranslated = !availableLocales.includes(locale);
  return {
    ...buildMetadata({
      locale,
      title: page.seo?.title?.trim() || page.title,
      description: page.seo?.description?.trim()
        ? metaDescription(page.seo.description)
        : undefined,
      path: routes.about,
      type: "article",
      modifiedTime: page.updated_at,
      siteName: common.siteShort,
      availableLocales,
    }),
    ...(untranslated ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = toLocale((await params).locale);
  // Сбой CMS (не 404) — ожидаемая ошибка: страница отдаёт понятный фрагмент,
  // а не падает (см. FetchErrorFallback).
  let page;
  try {
    page = await fetchPage(SLUG, locale);
  } catch {
    return (
      <PageShell mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-8 max-[920px]:px-4">
        <FetchErrorFallback locale={locale} />
      </PageShell>
    );
  }

  if (!page) {
    notFound();
  }

  const { common, pages } = getDictionary(locale);
  // Кэш fetch общий с generateMetadata — повторного похода в CMS нет.
  const availableLocales = await availableLocalesOf(page, "page", SLUG);
  const breadcrumbs = [
    { label: common.breadcrumbHome, href: routes.home },
    { label: common.header.aboutMenu },
    { label: page.title },
  ];

  return (
    <PageShell mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-8 max-[920px]:px-4">
      <BreadcrumbJsonLd items={breadcrumbs} locale={locale} />
      <Breadcrumbs items={breadcrumbs} />

      {/* Перевода на язык страницы нет — честно говорим об этом и ведём к
          опубликованной версии (страница при этом noindex). */}
      <TranslationNotice
        locale={locale}
        available={availableLocales}
        path={routes.about}
      />

      <article className="max-w-[72ch]">
        <h1 className="m-0 text-[32px] leading-[1.14] max-[560px]:text-[26px]">
          {page.title}
        </h1>
        {page.updated && (
          <p
            className="mb-6 mt-2 border-b border-[var(--color-divider)] pb-3 text-[12.5px]"
            style={{ color: muted(55) }}
          >
            {pages.contentPage.updated} {page.updated}
          </p>
        )}

        <CmsProse body={page.body} placeholder={pages.contentPage.placeholder} />
      </article>
    </PageShell>
  );
}
