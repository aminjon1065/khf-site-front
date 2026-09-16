import { Download } from "lucide-react";
import Link from "@/components/i18n/LocaleLink";
import { muted } from "@/components/public/ui";
import type { ApiDocument } from "@/lib/api";
import type { DocumentsContent } from "./content";

/**
 * Серверное представление каталога документов. Фильтрация и поиск
 * выполняются CMS до пагинации, поэтому результат и URL остаются
 * корректными без JavaScript.
 *
 * Два представления одних данных: таблица (≥921px) и карточки (≤920px).
 * Скрытое через display:none представление выпадает из дерева доступности —
 * скринридер не читает каталог дважды. Карточка показывает всё, что была
 * строка: полное название, тип, номер/дата, языки, формат/размер и явную
 * кнопку скачивания.
 */
export default function DocumentsTable({
  content,
  docs,
  hasFilters,
  unavailable,
}: {
  content: DocumentsContent;
  docs: ApiDocument[];
  hasFilters: boolean;
  /** CMS не ответила: пустой список — не «документы не найдены». */
  unavailable?: boolean;
}) {
  const { columns, downloadAria, download, noFile, empty } = content;

  if (unavailable) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="m-0 mb-1.5 text-[19px] font-semibold [font-family:var(--font-heading)]">
          {empty.unavailableTitle}
        </p>
        <p className="m-0 text-[13.5px]" style={{ color: muted(60) }}>
          {empty.unavailableText}
        </p>
      </div>
    );
  }

  if (docs.length === 0) {
    return (
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
    );
  }

  return (
    <>
      {/* Desktop: таблица. */}
      <div className="mt-2 overflow-x-auto max-[920px]:hidden">
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
                      className="btn btn-ghost btn-sm"
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

      {/* Mobile: карточки — то же содержимое без горизонтального скролла. */}
      <ul
        className="m-0 mt-2 hidden list-none flex-col gap-2.5 p-0 max-[920px]:flex"
        aria-label={content.title}
      >
        {docs.map((d) => (
          <li
            key={d.id}
            className="flex flex-col gap-2 border-b border-[var(--color-divider)] px-0.5 py-3.5"
          >
            <span className="flex flex-wrap items-center gap-2">
              <span className="tag tag-neutral">{d.type}</span>
              {(d.number || d.date) && (
                <span className="text-[12.5px]" style={{ color: muted(55) }}>
                  {[d.number, d.date].filter(Boolean).join(" · ")}
                </span>
              )}
              {d.lang && (
                <span className="text-[12.5px]" style={{ color: muted(55) }}>
                  · {d.lang}
                </span>
              )}
            </span>
            <span className="text-[15px] font-semibold leading-[1.35] [font-family:var(--font-heading)]">
              {d.title}
            </span>
            {d.href ? (
              <a
                href={d.href}
                target="_blank"
                rel="noreferrer"
                download
                className="btn btn-secondary self-start text-[13px]"
                aria-label={`${downloadAria}: ${d.title}`}
              >
                <Download size={14} strokeWidth={1.5} aria-hidden="true" />
                {download}
                {d.size ? ` · ${d.size}` : ""}
              </a>
            ) : (
              // Честное состояние вместо одиночного тире в узком столбце.
              <span className="text-[12.5px]" style={{ color: muted(50) }}>
                {noFile}
              </span>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
