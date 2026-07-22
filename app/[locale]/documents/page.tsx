import type { Metadata } from "next";
import PageShell from "@/components/public/PageShell";
import { muted } from "@/components/public/ui";
import { fetchDocuments } from "@/lib/api";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo";
import { getDocuments } from "./content";
import DocumentsTable from "./DocumentsTable";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { common, pages } = getDictionary(locale);
  return buildMetadata({ locale, title: pages.meta.documents, path: "/documents", siteName: common.siteShort });
}

// ISR: библиотека документов перечитывается из CMS не чаще раза в минуту.
export const revalidate = 60;

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = toLocale((await params).locale);
  const documents = getDocuments(locale);
  const docs = await fetchDocuments({ locale });

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
    </PageShell>
  );
}
