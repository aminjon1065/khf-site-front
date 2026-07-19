import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/public/PageShell";
import { Breadcrumbs, ImageSlot, muted } from "@/components/public/ui";
import { common } from "@/lib/copy/common";
import { routes } from "@/lib/routes";
import ArticleActions from "./ArticleActions";
import { articleSlugs, articleUi, getArticle } from "./content";

export function generateStaticParams() {
  return articleSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: getArticle(slug).title };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);

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
            <ImageSlot label={article.photoLabel} />
          </figure>
          <figcaption className="mb-5">{article.caption}</figcaption>

          {article.blocks.map((block, i) =>
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
