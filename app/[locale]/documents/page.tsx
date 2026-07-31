import type { Metadata } from "next";
import Link from "@/components/i18n/LocaleLink";
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
const DOCUMENT_TYPE_VALUES = [
  "law",
  "resolution",
  "order",
  "report",
  "instruction",
] as const;

interface DocumentSearchParams {
  page?: string;
  type?: string;
  q?: string;
}

function documentType(value: string | undefined): string | undefined {
  return DOCUMENT_TYPE_VALUES.find((candidate) => candidate === value);
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<DocumentSearchParams>;
}): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { common, pages } = getDictionary(locale);
  const page = Math.max(1, Number((await searchParams).page) || 1);
  return buildMetadata({
    locale,
    title:
      page > 1 ? `${pages.meta.documents} — ${page}` : pages.meta.documents,
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
  searchParams: Promise<DocumentSearchParams>;
}) {
  const locale = toLocale((await params).locale);
  const documents = getDocuments(locale);
  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, Number(resolvedSearchParams.page) || 1);
  const type = documentType(resolvedSearchParams.type);
  const q = resolvedSearchParams.q?.trim() || undefined;
  const { data: docs, meta } = await fetchDocuments({
    locale,
    page,
    perPage: PER_PAGE,
    type,
    q,
  });
  const typeOptions = DOCUMENT_TYPE_VALUES.map((value, index) => ({
    value,
    label: documents.types[index + 1],
  }));

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

      <form
        method="get"
        className="flex flex-wrap items-end gap-[14px] border-b border-[var(--color-divider)] py-4"
      >
        <label className="flex min-w-[210px] flex-col gap-1.5 text-[13px]">
          <span>{documents.typeGroupLabel}</span>
          <select
            className="input min-h-11"
            name="type"
            defaultValue={type ?? ""}
          >
            <option value="">{documents.allType}</option>
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[260px] flex-1 flex-col gap-1.5 text-[13px]">
          <span>{documents.search.ariaLabel}</span>
          <input
            className="input min-h-11"
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder={documents.search.placeholder}
          />
        </label>
        <button type="submit" className="btn btn-primary min-h-11">
          {documents.search.submit}
        </button>
        {(type || q) && (
          <Link href="/documents" className="btn btn-secondary min-h-11">
            {documents.empty.reset}
          </Link>
        )}
      </form>

      <DocumentsTable
        content={documents}
        docs={docs}
        hasFilters={Boolean(type || q)}
      />
      <Pagination
        locale={locale}
        currentPage={meta.current_page}
        lastPage={meta.last_page}
        basePath="/documents"
        query={{ type, q }}
      />
    </PageShell>
  );
}
