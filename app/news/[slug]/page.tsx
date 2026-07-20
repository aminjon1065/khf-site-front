import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/public/PageShell";
import { Breadcrumbs, ImageSlot, muted } from "@/components/public/ui";
import { fetchNews, fetchNewsItem, type ApiNewsItem } from "@/lib/api";
import { common } from "@/lib/copy/common";
import { routes } from "@/lib/routes";
import ArticleActions from "./ArticleActions";
import {
  articleUi,
  type Article,
  type ArticleBlock,
  type RelatedArticle,
} from "./content";

// ISR: материал перечитывается из CMS не чаще раза в минуту.
export const revalidate = 60;

/** Сборка витринной модели статьи из ответа публичного API CMS. */
function toArticle(item: ApiNewsItem, related: RelatedArticle[]): Article {
  const paragraphs = (item.body ?? item.excerpt ?? "")
    .split(/\n{2,}|\r?\n/)
    .map((t) => t.trim())
    .filter(Boolean);

  const blocks: ArticleBlock[] =
    paragraphs.length > 0
      ? paragraphs.map((text) => ({ type: "p", text }))
      : [{ type: "p", text: item.excerpt ?? "" }];

  return {
    breadcrumb: item.title,
    kicker: item.category
      ? `${item.category} · Пресс-служба КЧС`
      : "Пресс-служба КЧС",
    title: item.title,
    lead: item.excerpt ?? "",
    datetime: item.date ?? "",
    source: "Пресс-центр КЧС",
    photoLabel: articleUi.photoCaptionSource,
    caption: articleUi.photoCaptionSource,
    blocks,
    materials: [],
    related,
  };
}

async function relatedFor(slug: string): Promise<RelatedArticle[]> {
  const { data } = await fetchNews({ perPage: 6 });
  return data
    .filter((p) => p.slug !== slug)
    .slice(0, 3)
    .map((p) => ({
      kicker: p.category ?? "Новости",
      title: p.title,
      href: routes.article(p.slug),
    }));
}

export async function generateStaticParams() {
  const { data } = await fetchNews({ perPage: 50 });
  return data.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await fetchNewsItem(slug);
  return { title: item?.title ?? "Новость" };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await fetchNewsItem(slug);

  if (!item) {
    notFound();
  }

  const related = await relatedFor(slug);
  const article = toArticle(item, related);

  // Тело из CMS: у новых материалов — санитайзенный HTML из WYSIWYG-редактора,
  // у старых — простой текст. HTML выводим как есть; текст разбиваем на абзацы
  // (fallback, см. toArticle). Санитайзинг выполнен на стороне CMS при записи.
  const bodyHtml = item.body ?? "";
  const bodyIsHtml = /<[a-z][\s\S]*>/i.test(bodyHtml);

  return (
    <PageShell
      active="news"
      mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-6 max-[920px]:px-4"
    >
      <Breadcrumbs
        items={[
          { label: common.breadcrumbHome, href: routes.home },
          { label: common.nav.news, href: routes.news },
          { label: article.breadcrumb },
        ]}
      />

      <div className="mt-6 grid grid-cols-[minmax(0,1.9fr)_minmax(260px,1fr)] items-start gap-9 max-[920px]:grid-cols-1">
        {/* Тело статьи */}
        <article className="min-w-0 max-w-[72ch]">
          <span
            className="text-[11px] uppercase tracking-[.1em]"
            style={{ color: "var(--color-accent-700)" }}
          >
            {article.kicker}
          </span>
          <h1 className="mb-3 mt-2.5 text-[34px] leading-[1.12]">
            {article.title}
          </h1>
          <p
            className="text-[16.5px] font-medium leading-[1.55]"
            style={{ color: muted(78) }}
          >
            {article.lead}
          </p>

          <div
            className="mb-5 mt-3.5 flex flex-wrap items-center gap-[18px] border-y border-[var(--color-divider)] py-3 text-[12.5px]"
            style={{ color: muted(55) }}
          >
            <span>{article.datetime}</span>
            <span>{article.source}</span>
            <span className="flex-1" />
            <ArticleActions
              shareLabel={articleUi.share}
              sharedLabel={articleUi.shared}
              printLabel={articleUi.print}
            />
          </div>

          <figure className="blueprint duotone mb-2 h-[340px]">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                srcSet={item.image_srcset ?? undefined}
                sizes="(max-width: 920px) 100vw, 760px"
                alt={article.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageSlot label={article.photoLabel} />
            )}
          </figure>
          <figcaption className="mb-5">{article.caption}</figcaption>

          {bodyIsHtml ? (
            <div
              className="article-prose"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          ) : (
            article.blocks.map((block, i) =>
              block.type === "quote" ? (
                <blockquote
                  key={i}
                  className="blueprint my-6 px-[22px] py-[18px] text-base not-italic leading-[1.55]"
                >
                  {block.text}
                </blockquote>
              ) : (
                <p key={i} className="text-[15px] leading-[1.7]">
                  {block.text}
                </p>
              ),
            )
          )}

          {article.materials.length > 0 && (
            <div className="mt-6">
              <h6 style={{ color: muted(55) }}>{articleUi.materialsTitle}</h6>
              {article.materials.map((m) => (
                <Link
                  key={m.title}
                  href={m.href}
                  className="row-link flex items-center gap-2.5 border-b border-[var(--color-divider)] py-2.5"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <span className="tag tag-neutral flex-none">{m.tag}</span>
                  <span className="flex-1 text-[13.5px]">{m.title}</span>
                  <span className="flex-none text-xs" style={{ color: muted(50) }}>
                    {m.size}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </article>

        {/* Боковая колонка */}
        <aside className="flex flex-col gap-5">
          {article.related.length > 0 && (
            <div>
              <h6 className="mb-2.5" style={{ color: muted(55) }}>
                {articleUi.relatedTitle}
              </h6>
              {article.related.map((r, i) => (
                <Link
                  key={r.href + i}
                  href={r.href}
                  className="row-link block py-2.5"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    borderBottom:
                      i === article.related.length - 1
                        ? "none"
                        : "1px solid var(--color-divider)",
                  }}
                >
                  <span
                    className="text-[11px] uppercase tracking-[.06em]"
                    style={{ color: muted(50) }}
                  >
                    {r.kicker}
                  </span>
                  <span className="mt-[3px] block text-[15.5px] font-semibold leading-[1.25] [font-family:var(--font-heading)]">
                    {r.title}
                  </span>
                </Link>
              ))}
            </div>
          )}

          <div className="blueprint flex flex-col gap-2 p-[18px]">
            <h6 className="m-0" style={{ color: muted(55) }}>
              {articleUi.sourceBoxTitle}
            </h6>
            <p
              className="m-0 text-[13px] leading-[1.55]"
              style={{ color: muted(70) }}
            >
              {articleUi.sourceBoxText}
            </p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
