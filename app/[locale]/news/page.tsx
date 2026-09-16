import type { Metadata } from "next";
import Link from "@/components/i18n/LocaleLink";
import PageShell from "@/components/public/PageShell";
import Pagination from "@/components/public/Pagination";
import { muted } from "@/components/public/ui";
import { fetchCategories, fetchNews } from "@/lib/api";
import { toLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo";
import { getNews } from "./content";
import NewsList from "./NewsList";

const PER_PAGE = 12;

type NewsSearchParams = { page?: string; category?: string; q?: string };

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<NewsSearchParams>;
}): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { common } = getDictionary(locale);
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const category = sp.category || undefined;
  const q = sp.q?.trim() || undefined;
  const news = getNews(locale);
  const baseTitle = news.metaTitle;

  // Политика query-параметров:
  //  – категория — полезная индексируемая грань каталога: остаётся в canonical
  //    и во всех hreflang-альтернатах;
  //  – свободный поиск (q) — внутренний поиск по сайту: noindex (следует
  //    из политики Google для внутренних поискых выдач), canonical — сам URL.
  //  – комбинированные фильтры (категория + q) — тоже поисковая выдача: noindex.
  const isSearch = Boolean(q);
  return {
    ...buildMetadata({
      locale,
      title: page > 1 ? `${baseTitle} — ${page}` : baseTitle,
      description: news.metaDescription,
      path: "/news",
      siteName: common.siteShort,
      page,
      query: { category },
    }),
    ...(isSearch ? { robots: { index: false, follow: true } } : {}),
  };
}

// ISR: страница пересобирается не чаще раза в минуту, данные — из CMS.
export const revalidate = 60;

/** Правая колонка: контакты пресс-службы и сводка обстановки. Декоративная
 *  заглушка «Фото пресс-службы» убрана: реального снимка нет, а крупная
 *  пустая плита вместо информации — не содержательная компоновка. */
function NewsAside({ news }: { news: ReturnType<typeof getNews> }) {
  const { media, alerts } = news.aside;
  return (
    <aside className="flex flex-col gap-5">
      <div className="blueprint flex flex-col gap-2 p-[18px]">
        <h2 className="m-0 kicker-heading" style={{ color: muted(55) }}>
          {media.title}
        </h2>
        <p
          className="m-0 text-[13px] leading-[1.55]"
          style={{ color: muted(70) }}
        >
          {media.text}
        </p>
        {/* mailto по опубликованному адресу пресс-службы: подпись «почта»
            обязана открывать почту, а не вести в другой раздел. */}
        <a
          href={media.href}
          aria-label={media.emailAria}
          className="text-[13px] no-underline"
          style={{ color: "var(--color-accent-700)" }}
        >
          {media.email}
        </a>
      </div>

      <div className="blueprint flex flex-col gap-2 p-[18px]">
        <h2 className="m-0 kicker-heading" style={{ color: muted(55) }}>
          {alerts.title}
        </h2>
        <p
          className="m-0 text-[13px] leading-[1.55]"
          style={{ color: muted(70) }}
        >
          {alerts.text}
        </p>
        <Link
          href={alerts.href}
          className="text-[13px]"
          style={{ color: "var(--color-accent-700)" }}
        >
          {alerts.link}
        </Link>
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
  const q = resolvedSearchParams.q?.trim() || undefined;
  const [newsResult, categories] = await Promise.all([
    fetchNews({ perPage: PER_PAGE, page, category, q, locale }),
    fetchCategories({ type: "news", locale }),
  ]);
  const { data: posts, meta } = newsResult;

  return (
    <PageShell mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-8 max-[920px]:px-4">
      <div className="page-head">
        <h1 className="page-title page-title-caps">{news.header.title}</h1>
        <span className="page-subtitle">
          {news.header.kicker}
        </span>
      </div>

      <NewsList
        aside={<NewsAside news={news} />}
        posts={posts}
        categories={categories}
        activeCategory={category}
        query={q}
        content={news}
        locale={locale}
        total={meta.total}
        unavailable={newsResult.unavailable}
      />
      <Pagination
        locale={locale}
        currentPage={meta.current_page}
        lastPage={meta.last_page}
        basePath="/news"
        query={{ category, q }}
      />
    </PageShell>
  );
}
