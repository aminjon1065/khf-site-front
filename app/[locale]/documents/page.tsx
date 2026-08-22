import type { Metadata } from "next";
import Link from "@/components/i18n/LocaleLink";
import PageShell from "@/components/public/PageShell";
import Pagination from "@/components/public/Pagination";
import { muted } from "@/components/public/ui";
import { fetchDocuments } from "@/lib/api";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata, metaDescription } from "@/lib/seo";
import { DOCUMENT_TYPE_VALUES, getDocuments } from "./content";
import DocumentsTable from "./DocumentsTable";

const PER_PAGE = 20;
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
    description: metaDescription(getDocuments(locale).subtitle),
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
  const typeOptions = DOCUMENT_TYPE_VALUES.map((value) => ({
    value,
    label: documents.types[value],
  }));

  /** Адрес фильтра: тип меняется, поисковый запрос сохраняется. */
  const typeHref = (value?: string) => {
    const params = new URLSearchParams();
    if (value) {
      params.set("type", value);
    }
    if (q) {
      params.set("q", q);
    }
    const query = params.toString();

    // Локаль подставляет LocaleLink — как у кнопки сброса ниже.
    return `/documents${query ? `?${query}` : ""}`;
  };

  return (
    <PageShell>
      <div className="flex items-baseline gap-[14px] border-b border-[var(--color-divider)] pb-[14px]">
        <h1 className="page-title page-title-caps">{documents.title}</h1>
        <span className="text-xs" style={{ color: muted(50) }}>
          {documents.subtitle}
        </span>
      </div>

      {/* Тип — группа кнопок-переключателей ссылками, как в макете и как в
          списке новостей: выбранный тип виден с одного взгляда, состояние
          остаётся в адресе и работает без JS. Раньше здесь стоял <select>,
          и выбранный тип приходилось раскрывать. */}
      <div
        className="flex flex-wrap items-center gap-2 border-b border-[var(--color-divider)] py-4"
        role="group"
        aria-label={documents.typeGroupLabel}
      >
        <Link
          href={typeHref()}
          aria-current={!type ? "true" : undefined}
          className="btn px-[14px] py-1.5 text-[13px] no-underline hover:border-[var(--color-accent)]"
          style={
            !type
              ? {
                  background: "var(--color-accent-solid)",
                  color: "var(--color-bg)",
                  borderColor: "var(--color-accent-solid)",
                }
              : { color: "inherit" }
          }
        >
          {documents.allType}
        </Link>
        {typeOptions.map((option) => {
          const active = option.value === type;

          return (
            <Link
              key={option.value}
              href={typeHref(option.value)}
              aria-current={active ? "true" : undefined}
              className="btn px-[14px] py-1.5 text-[13px] no-underline hover:border-[var(--color-accent)]"
              style={
                active
                  ? {
                      background: "var(--color-accent-solid)",
                      color: "var(--color-bg)",
                      borderColor: "var(--color-accent-solid)",
                    }
                  : { color: "inherit" }
              }
            >
              {option.label}
            </Link>
          );
        })}
      </div>

      <form
        method="get"
        className="flex flex-wrap items-end gap-[14px] border-b border-[var(--color-divider)] py-4"
      >
        {/* Выбранный тип переносится в форму поиска скрытым полем: иначе
            отправка запроса сбрасывала бы фильтр. */}
        {type && <input type="hidden" name="type" value={type} />}
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
