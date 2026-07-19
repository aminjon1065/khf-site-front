"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { muted } from "@/components/public/ui";
import type { DocumentsContent } from "./content";

/**
 * Клиентская таблица документов: фильтр по типу (кнопки с aria-pressed) и
 * поиск по названию/номеру. Фильтрация выполняется на клиенте; при пустом
 * результате показывается состояние «ничего не найдено» с кнопкой сброса.
 */
export default function DocumentsTable({
  content,
}: {
  content: DocumentsContent;
}) {
  const { types, allType, search, columns, downloadAria, empty, docs } =
    content;
  const [type, setType] = useState(allType);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return docs.filter(
      (d) =>
        (type === allType || d.type === type) &&
        (!query ||
          `${d.title} ${d.number ?? ""}`.toLowerCase().includes(query)),
    );
  }, [docs, type, allType, q]);

  const reset = () => {
    setType(allType);
    setQ("");
  };

  return (
    <>
      {/* Панель фильтров: типы слева, поиск справа */}
      <div className="flex flex-wrap items-center gap-[14px] border-b border-[var(--color-divider)] py-4">
        <div
          role="group"
          aria-label={content.typeGroupLabel}
          className="flex flex-wrap gap-1.5"
        >
          {types.map((ty) => {
            const pressed = ty === type;
            return (
              <button
                key={ty}
                type="button"
                onClick={() => setType(ty)}
                aria-pressed={pressed}
                className="btn px-[14px] py-1.5 text-[13px] hover:border-[var(--color-accent)]"
                style={{
                  background: pressed ? "var(--color-accent)" : "transparent",
                  color: pressed ? "var(--color-bg)" : "var(--color-text)",
                }}
              >
                {ty}
              </button>
            );
          })}
        </div>
        <span className="flex-1" />
        <input
          className="input w-[260px] text-[13px] max-[560px]:w-full"
          style={{ minHeight: 34 }}
          type="search"
          placeholder={search.placeholder}
          aria-label={search.ariaLabel}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {filtered.length > 0 ? (
        <div className="mt-2 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 120 }}>{columns.type}</th>
                <th>{columns.title}</th>
                <th style={{ width: 110 }}>{columns.number}</th>
                <th style={{ width: 110 }}>{columns.date}</th>
                <th style={{ width: 80 }}>{columns.lang}</th>
                <th style={{ width: 110 }}>{columns.file}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={`${d.type}-${d.title}`}>
                  <td>
                    <span className="tag tag-neutral">{d.type}</span>
                  </td>
                  <td className="text-sm leading-[1.4]">{d.title}</td>
                  <td className="text-[13px]" style={{ color: muted(60) }}>
                    {d.number}
                  </td>
                  <td className="text-[13px]" style={{ color: muted(60) }}>
                    {d.date}
                  </td>
                  <td className="text-[13px]" style={{ color: muted(60) }}>
                    {d.lang}
                  </td>
                  <td>
                    <a
                      href={d.href ?? "#"}
                      className="btn btn-ghost text-[12.5px]"
                      aria-label={`${downloadAria}: ${d.title}`}
                    >
                      <Download size={14} strokeWidth={1.5} aria-hidden="true" />
                      {d.size}
                    </a>
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
          <p
            className="m-0 mb-4 text-[13.5px]"
            style={{ color: muted(60) }}
          >
            {empty.text}
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={reset}
          >
            {empty.reset}
          </button>
        </div>
      )}
    </>
  );
}
