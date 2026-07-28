import type { Metadata } from "next";
import Link from "@/components/i18n/LocaleLink";
import PageShell from "@/components/public/PageShell";
import Pagination from "@/components/public/Pagination";
import { ImageSlot, muted } from "@/components/public/ui";
import { fetchCategories, fetchNews } from "@/lib/api";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo";
import { getNews } from "./content";
import NewsList from "./NewsList";

const PER_PAGE = 12;

type NewsSearchParams = { page?: string; category?: string };

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<NewsSearchParams>;
}): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { common } = getDictionary(locale);
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const news = getNews(locale);
  const baseTitle = news.metaTitle;
  return buildMetadata({
    locale,
    title: page > 1 ? `${baseTitle} — ${page}` : baseTitle,
    description: news.metaDescription,
    path: "/news",
    siteName: common.siteShort,
    page,
  });
}

// ISR: страница пересобирается не чаще раза в минуту, данные — из CMS.
export const revalidate = 60;

/** Правая колонка: фото пресс-службы (duotone) + блоки для СМI и подписки. */
function NewsAside({ news }: { news: ReturnType<typeof getNews> }) {
  const { media, subscribe } = news.aside;
  return (
    <aside className="flex flex-col gap-5">
      <div className="blueprint h-[170px]">
        <ImageSlot label={news.aside.photoLabel} duotone />
      </div>

      <div className="blueprint flex flex-col gap-2 p-[18px]">
        <h2 className="m-0 text-base" style={{ color: muted(55) }}>
          {media.title}
        </h2>
        <p className="m-0 text-[13px] leading-[1.55]" style={{ color: muted(70) }}>
          {media.text}
        </p>
        <Link
          href={media.href}
          className="text-[13px]"
          style={{ color: "var(--color-accent-700)" }}
        >
          {media.email}
        </Link>
      </div>

      <div className="blueprint flex flex-col gap-2 p-[18px]">
        <h2 className="m-0 text-base" style={{ color: muted(55) }}>
          {subscribe.title}
        </h2>
        <p className="m-0 text-[13px] leading-[1.55]" style={{ color: muted(70) }}>
          {subscribe.text}
        </p>
        <input
          className="input text-[13px]"
          type="email"
          placeholder={subscribe.emailPlaceholder}
          aria-label={subscribe.emailAria}
        />
        <button type="button" className="btn btn-primary btn-block">
          {subscribe.submit}
        </button>
      </div>
    </aside>
  );
}

export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<NewsSearchParams>;
}) {
  const locale = toLocale((await params).locale);
  const news = getNews(locale);
  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, Number(resolvedSearchParams.page) || 1);
  const category = resolvedSearchParams.category || undefined;
  const [{ data: posts, meta }, categories] = await Promise.all([
    fetchNews({ perPage: PER_PAGE, page, category, locale }),
    fetchCategories({ type: "news", locale }),
  ]);

  return (
    <PageShell
      active="news"
      locale={locale}
      mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-8 max-[920px]:px-4"
    >
      <div className="flex items-baseline gap-[14px] border-b border-[var(--color-divider)] pb-[14px]">
        <h1 className="m-0 text-[36px] uppercase tracking-[.02em]">
          {news.header.title}
        </h1>
        <span className="text-xs" style={{ color: muted(50) }}>
          {news.header.kicker}
        </span>
      </div>

      <NewsList
        aside={<NewsAside news={news} />}
        posts={posts}
        categories={categories}
        activeCategory={category}
      />
      <Pagination
        locale={locale}
        currentPage={meta.current_page}
        lastPage={meta.last_page}
        basePath="/news"
        query={{ category }}
      />
    </PageShell>
  );
}
