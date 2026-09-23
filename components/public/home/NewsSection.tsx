import Link from "@/components/i18n/LocaleLink";
import CmsImage from "@/components/public/CmsImage";
import { SectionHeader, muted } from "@/components/public/ui";
import { routes } from "@/lib/routes";
import { cmsImageSource } from "@/lib/media";
import { HOME_BLOCK_MAX_ITEMS } from "@/lib/home-blocks";
import type { ApiNewsItem } from "@/lib/api";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

/**
 * Новости: главная новость крупно + список до четырёх строк рядом
 * (HOME_BLOCK_MAX_ITEMS.latest_news). Вызывающая сторона не рисует секцию без
 * новостей.
 */
export default function NewsSection({
  news,
  title,
  home,
  ariaLabel,
}: {
  news: ApiNewsItem[];
  /** Заголовок блока из CMS или словарный. */
  title: string;
  home: Dictionary["home"];
  ariaLabel: string;
}) {
  const featured = news[0];
  const newsList = news.slice(1, HOME_BLOCK_MAX_ITEMS.latest_news);
  const featuredHasImage = cmsImageSource(featured?.image_data) !== null;

  return (
    <section aria-label={ariaLabel} className="mt-[52px]">
      <SectionHeader
        as="h2"
        title={title}
        link={{ label: home.news.allLink, href: routes.news }}
      />
      <div className="grid grid-cols-2 gap-7 max-[920px]:grid-cols-1">
        <Link
          href={`/news/${featured.slug}`}
          className={
            featuredHasImage
              ? "flex flex-col gap-3"
              : "home-featured-card blueprint surface-hover flex flex-col gap-3 p-5"
          }
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {featuredHasImage && featured.image_data ? (
            <span className="blueprint duotone relative block h-[220px]">
              <CmsImage
                image={featured.image_data}
                sizes="(max-width: 920px) 100vw, 620px"
              />
            </span>
          ) : null}
          <span
            className="text-[11px] uppercase tracking-[.1em]"
            style={{ color: "var(--color-accent-700)" }}
          >
            {[featured.category, featured.date].filter(Boolean).join(" · ")}
          </span>
          <span
            className={`font-semibold leading-[1.2] [font-family:var(--font-heading)] ${
              featuredHasImage ? "text-[21px]" : "text-[26px]"
            }`}
          >
            {featured.title}
          </span>
          {featured.excerpt ? (
            <span
              className="text-[14px] leading-[1.55]"
              style={{ color: muted(70) }}
            >
              {featured.excerpt}
            </span>
          ) : null}
          {!featuredHasImage ? (
            <span
              className="mt-auto pt-2 text-[13px]"
              style={{ color: "var(--color-accent-700)" }}
            >
              {home.slider.readMore}
            </span>
          ) : null}
        </Link>
        <div className="flex flex-col">
          {newsList.map((it, i) => (
            <Link
              key={it.slug}
              href={`/news/${it.slug}`}
              className="row-link border-b border-[var(--color-divider)]"
              style={{
                textDecoration: "none",
                color: "inherit",
                padding: i === 0 ? "0 0 14px" : "14px 0",
                borderBottom:
                  i === newsList.length - 1 ? "none" : undefined,
              }}
            >
              <span
                className="text-[11px] uppercase tracking-[.08em]"
                style={{ color: muted(50) }}
              >
                {[it.category, it.date].filter(Boolean).join(" · ")}
              </span>
              <span className="mt-1 block text-[17px] font-semibold leading-[1.25] [font-family:var(--font-heading)]">
                {it.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
