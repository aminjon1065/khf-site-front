"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "@/components/i18n/LocaleLink";
import { Search } from "lucide-react";
import { muted } from "@/components/public/ui";
import { localeFromPathname } from "@/lib/i18n/config";
import { routes } from "@/lib/routes";
import type { NewsItem } from "@/lib/types";
import { getNews } from "./content";

/**
 * Список новостей текущей страницы: фильтр по категориям (кнопки с
 * aria-pressed) и поиск — пока клиентские, действуют в пределах уже
 * загрученной страницы (постраничная выдача — на сервере, см. page.tsx;
 * серверный `?category=` — задача B-2). Правая колонка (aside) и пагинация
 * приходят с сервера как готовая разметка.
 */
export default function NewsList({
  aside,
  posts,
}: {
  aside: ReactNode;
  posts: NewsItem[];
}) {
  const news = getNews(localeFromPathname(usePathname()));
  const { filter, feed, empty } = news;
  const [cat, setCat] = useState<string>(filter.allCategory);
  const [q, setQ] = useState("");

  // Категории берём из реальных данных CMS (плюс «Все»), а не из статики.
  const categories = useMemo<string[]>(() => {
    const present = Array.from(
      new Set(posts.map((p) => p.category).filter(Boolean)),
    );
    return [filter.allCategory, ...present];
  }, [posts, filter.allCategory]);

  const results = useMemo<NewsItem[]>(() => {
    const needle = q.trim().toLowerCase();
    return posts.filter(
      (p) =>
        (cat === filter.allCategory || p.category === cat) &&
        (!needle ||
          `${p.title} ${p.excerpt ?? ""}`.toLowerCase().includes(needle)),
    );
  }, [posts, cat, q, filter.allCategory]);

  const chooseCat = (c: string) => {
    setCat(c);
  };
  const onSearch = (value: string) => {
    setQ(value);
  };
  const reset = () => {
    setCat(filter.allCategory);
    setQ("");
  };

  return (
    <>
      {/* Панель фильтров: категории + поиск */}
      <div className="flex flex-wrap items-center gap-[14px] border-b border-[var(--color-divider)] py-4">
        <div
          role="group"
          aria-label={filter.groupAria}
          className="flex flex-wrap gap-1.5"
        >
          {categories.map((c) => {
            const pressed = c === cat;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={pressed}
                onClick={() => chooseCat(c)}
                className="btn px-[14px] py-1.5 text-[13px] hover:border-[var(--color-accent)]"
                style={
                  pressed
                    ? {
                        background: "var(--color-accent)",
                        color: "var(--color-bg)",
                        borderColor: "var(--color-accent)",
                      }
                    : undefined
                }
              >
                {c}
              </button>
            );
          })}
        </div>
        <span className="flex-1" />
        <input
          className="input min-h-[34px] w-[240px] text-[13px] max-[560px]:w-full"
          type="search"
          value={q}
          placeholder={filter.searchPlaceholder}
          aria-label={filter.searchAria}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {results.length > 0 ? (
        <div className="mt-2 grid grid-cols-[minmax(0,2.2fr)_minmax(260px,1fr)] items-start gap-8 max-[920px]:grid-cols-1">
          <div role="feed" aria-label={feed.aria} className="min-w-0">
            {results.map((p) => (
              <article
                key={p.slug}
                className="grid grid-cols-[110px_minmax(0,1fr)] gap-[18px] border-b border-[var(--color-divider)] py-5 max-[560px]:grid-cols-1 max-[560px]:gap-1.5"
              >
                <div
                  className="text-xs leading-[1.5]"
                  style={{ color: muted(55) }}
                >
                  {p.date}
                  <span
                    className="mt-1 block text-[10.5px] uppercase tracking-[.06em]"
                    style={{ color: "var(--color-accent-700)" }}
                  >
                    {p.category}
                  </span>
                </div>
                <div className="min-w-0">
                  <h2 className="m-0 mb-1.5 text-[21px] leading-[1.2]">
                    <Link
                      href={routes.article(p.slug)}
                      className="row-link"
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      {p.title}
                    </Link>
                  </h2>
                  <p
                    className="m-0 text-[13.5px] leading-[1.55]"
                    style={{ color: muted(65) }}
                  >
                    {p.excerpt}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {aside}
        </div>
      ) : (
        <div className="px-6 py-16 text-center">
          <Search
            size={34}
            strokeWidth={1.5}
            aria-hidden="true"
            className="mx-auto mb-3"
            style={{ color: muted(40) }}
          />
          <p className="m-0 mb-1.5 text-[19px] font-semibold [font-family:var(--font-heading)]">
            {empty.title}
          </p>
          <p
            className="m-0 mb-4 text-[13.5px]"
            style={{ color: muted(60) }}
          >
            {empty.text}
          </p>
          <button type="button" onClick={reset} className="btn btn-secondary">
            {empty.reset}
          </button>
        </div>
      )}
    </>
  );
}
