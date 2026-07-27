import Link from "@/components/i18n/LocaleLink";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

interface PaginationProps {
  locale: Locale;
  currentPage: number;
  lastPage: number;
  /** Path without the locale prefix, e.g. "/news" — LocaleLink adds `/{locale}`. */
  basePath: string;
  /** Extra query params to preserve across page links (e.g. `{ category: "safety" }`). */
  query?: Record<string, string | undefined>;
}

function pageHref(
  basePath: string,
  query: Record<string, string | undefined> | undefined,
  page: number,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value) {
      params.set(key, value);
    }
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Page numbers to render: first, last, and a window around the current page. */
function pageWindow(current: number, last: number): (number | "gap")[] {
  const pages = new Set<number>([1, last, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);

  const result: (number | "gap")[] = [];
  for (const [i, page] of sorted.entries()) {
    if (i > 0 && page - sorted[i - 1] > 1) {
      result.push("gap");
    }
    result.push(page);
  }
  return result;
}

/**
 * Server-rendered pagination: plain `<Link>`s built from `?page=`, so it works
 * without JS and is crawlable. `meta.last_page` from the API drives the range —
 * a page past the end (e.g. `?page=999`) simply renders no links here, the
 * caller's own empty state handles the rest.
 */
export default function Pagination({
  locale,
  currentPage,
  lastPage,
  basePath,
  query,
}: PaginationProps) {
  if (lastPage <= 1) {
    return null;
  }

  const copy = getDictionary(locale).common.pagination;

  return (
    <nav aria-label={copy.aria} className="flex items-center gap-1.5 py-5">
      {currentPage > 1 && (
        <Link
          href={pageHref(basePath, query, currentPage - 1)}
          className="btn btn-secondary"
        >
          {copy.prev}
        </Link>
      )}

      {pageWindow(currentPage, lastPage).map((entry, i) =>
        entry === "gap" ? (
          <span key={`gap-${i}`} aria-hidden="true" className="px-1">
            …
          </span>
        ) : entry === currentPage ? (
          <span
            key={entry}
            className="btn min-w-[36px]"
            aria-current="page"
            style={{
              background: "var(--color-accent-solid)",
              color: "var(--color-bg)",
              borderColor: "var(--color-accent-solid)",
            }}
          >
            {entry}
          </span>
        ) : (
          <Link
            key={entry}
            href={pageHref(basePath, query, entry)}
            aria-label={`${copy.pageAriaPrefix} ${entry}`}
            className="btn btn-secondary min-w-[36px]"
          >
            {entry}
          </Link>
        ),
      )}

      {currentPage < lastPage && (
        <Link
          href={pageHref(basePath, query, currentPage + 1)}
          className="btn btn-secondary"
        >
          {copy.next}
        </Link>
      )}
    </nav>
  );
}
