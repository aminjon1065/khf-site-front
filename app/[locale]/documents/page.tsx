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
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const type = documentType(sp.type);
  const q = sp.q?.trim() || undefined;

  // Политика query-параметров (как у новостей): тип документа — индексируемая
  // грань каталога (в canonical и hreflang), свободный поиск q — внутренняя
  // поисковая выдача: noindex + self-canonical.
  return {
    ...buildMetadata({
      locale,
      title:
        page > 1 ? `${pages.meta.documents} — ${page}` : pages.meta.documents,
      description: metaDescription(getDocuments(locale).subtitle),
      path: "/documents",
      siteName: common.siteShort,
      page,
      query: { type },
    }),
    ...(q ? { robots: { index: false, follow: true } } : {}),
  };
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
  const { data: docs, meta, unavailable } = await fetchDocuments({
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
      <div className="page-head">
        <h1 className="page-title page-title-caps">{documents.title}</h1>
        <span className="page-subtitle">
          {documents.subtitle}
        </span>
      </div>

      {/* Тип — группа кнопок-переключателей ссылками (desktop), как в списке
          новостей: выбранный тип виден с одного взгляда, состояние остаётся в
          адресе и работает без JS. На мобильном ряд кнопок скрыт — тип
          выбирается select'ом в форме поиска ниже. */}
      <div
        className="flex flex-wrap items-center gap-2 border-b border-[var(--color-divider)] py-4 max-[560px]:hidden"
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
        {/* Мобильный фильтр типа — select в этой же GET-форме (на desktop
            скрыт и играет роль прежнего скрытого поля type: скрытые, в
            отличие от disabled, поля отправляются).
            key: defaultValue у неуправляемого поля применяется ТОЛЬКО при
            монтировании. При клиентском переходе (ссылки-кнопки типа выше)
            React переиспользует тот же DOM-узел, и select сохранял значение
            со старого адреса — отправка поиска сбрасывала выбранный тип в
            пустой. Ключ от значения из URL заставляет узел пересоздаться. */}
        <select
          key={type ?? "all"}
          name="type"
          defaultValue={type ?? ""}
          aria-label={documents.typeGroupLabel}
          className="input min-h-11 text-[14px] hidden max-[560px]:block max-[560px]:w-full"
        >
          <option value="">{documents.allType}</option>
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label className="flex min-w-[260px] flex-1 flex-col gap-1.5 text-[13px]">
          <span>{documents.search.ariaLabel}</span>
          <input
            className="input min-h-11"
            key={q ?? ""}
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

      {/* Число результатов при активном фильтре: подтверждает, что отбор
          применился; данные берутся из meta.total CMS. */}
      {(type || q) && !unavailable && (
        <p
          className="m-0 py-2.5 text-xs [font-variant-numeric:tabular-nums]"
          style={{ color: muted(55) }}
        >
          {documents.search.resultsPrefix}: {meta.total}
        </p>
      )}

      <DocumentsTable
        content={documents}
        docs={docs}
        hasFilters={Boolean(type || q)}
        unavailable={unavailable}
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
