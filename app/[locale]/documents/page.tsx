import type { Metadata } from "next";
import PageShell from "@/components/public/PageShell";
import Pagination from "@/components/public/Pagination";
import { muted } from "@/components/public/ui";
import { fetchDocuments } from "@/lib/api";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo";
import { getDocuments } from "./content";
import DocumentsTable from "./DocumentsTable";

const PER_PAGE = 20;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { common, pages } = getDictionary(locale);
  const page = Math.max(1, Number((await searchParams).page) || 1);
  return buildMetadata({
    locale,
    title: page > 1 ? `${pages.meta.documents} — ${page}` : pages.meta.documents,
    path: "/documents",
    siteName: common.siteShort,
    page,
  });
}

// ISR: библиотека документов перечитывается из CMS не чаще раза в минуту.
export const revalidate = 60;

export default async function DocumentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const locale = toLocale((await params).locale);
  const documents = getDocuments(locale);
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const { data: docs, meta } = await fetchDocuments({ locale, page, perPage: PER_PAGE });

  return (
    <PageShell active="documents" locale={locale}>
      <div className="flex items-baseline gap-[14px] border-b border-[var(--color-divider)] pb-[14px]">
        <h1 className="m-0 text-[36px] uppercase tracking-[.02em]">
          {documents.title}
        </h1>
        <span className="text-xs" style={{ color: muted(50) }}>
          {documents.subtitle}
        </span>
      </div>

      <DocumentsTable content={documents} docs={docs} />
      <Pagination
        locale={locale}
        currentPage={meta.current_page}
        lastPage={meta.last_page}
        basePath="/documents"
      />
    </PageShell>
  );
}
