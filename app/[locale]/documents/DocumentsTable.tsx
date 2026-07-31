import { Download } from "lucide-react";
import Link from "@/components/i18n/LocaleLink";
import { muted } from "@/components/public/ui";
import type { ApiDocument } from "@/lib/api";
import type { DocumentsContent } from "./content";

/**
 * Серверная таблица документов. Фильтрация и поиск выполняются CMS до
 * пагинации, поэтому результат и URL остаются корректными без JavaScript.
 */
export default function DocumentsTable({
  content,
  docs,
  hasFilters,
}: {
  content: DocumentsContent;
  docs: ApiDocument[];
  hasFilters: boolean;
}) {
  const { columns, downloadAria, empty } = content;

  return (
    <>
      {docs.length > 0 ? (
        <div className="mt-2 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 120 }}>{columns.type}</th>
                <th>{columns.title}</th>
                <th style={{ width: 110 }}>{columns.number}</th>
                <th style={{ width: 110 }}>{columns.date}</th>
                <th style={{ width: 90 }}>{columns.lang}</th>
                <th style={{ width: 130 }}>{columns.file}</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id}>
                  <td>
                    <span className="tag tag-neutral">{d.type}</span>
                  </td>
                  <td className="text-sm leading-[1.4]">{d.title}</td>
                  <td className="text-[13px]" style={{ color: muted(60) }}>
                    {d.number ?? "—"}
                  </td>
                  <td className="text-[13px]" style={{ color: muted(60) }}>
                    {d.date ?? "—"}
                  </td>
                  <td className="text-[13px]" style={{ color: muted(60) }}>
                    {d.lang || "—"}
                  </td>
                  <td>
                    {d.href ? (
                      <a
                        href={d.href}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="btn btn-ghost text-[12.5px]"
                        aria-label={`${downloadAria}: ${d.title}`}
                      >
                        <Download
                          size={14}
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                        {d.size}
                      </a>
                    ) : (
                      <span
                        className="text-[12.5px]"
                        style={{ color: muted(45) }}
                      >
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-16 text-center">
          <p className="m-0 mb-1.5 text-[19px] font-semibold [font-family:var(--font-heading)]">
            {empty.title}
          </p>
          <p className="m-0 mb-4 text-[13.5px]" style={{ color: muted(60) }}>
            {empty.text}
          </p>
          {hasFilters && (
            <Link href="/documents" className="btn btn-secondary">
              {empty.reset}
            </Link>
          )}
        </div>
      )}
    </>
  );
}
