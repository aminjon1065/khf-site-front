import type { Metadata } from "next";
import Link from "@/components/i18n/LocaleLink";
import { notFound } from "next/navigation";
import FetchErrorFallback from "@/components/public/FetchErrorFallback";
import {
  BreadcrumbJsonLd,
  NewsArticleJsonLd,
} from "@/components/public/JsonLd";
import PageShell from "@/components/public/PageShell";
import TranslationNotice from "@/components/public/TranslationNotice";
import CmsImage from "@/components/public/CmsImage";
import GalleryCarousel from "@/components/public/GalleryCarousel";
import { Breadcrumbs, ImageSlot, muted } from "@/components/public/ui";
import {
  fetchNews,
  fetchNewsItem,
  fetchSettings,
  fetchStaticParamSlugs,
  availableLocalesFor,
  type ApiNewsItem,
} from "@/lib/api";
import { htmlLang, toLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";
import { buildMetadata } from "@/lib/seo";
import { cmsImageSource } from "@/lib/media";
import {
  hasGalleryMark,
  splitBodyByGallery,
} from "@/lib/gallery-mark";
import ArticleActions from "./ArticleActions";
import {
  getArticleUi,
  type Article,
  type ArticleBlock,
  type RelatedArticle,
} from "./content";

// ISR: материал перечитывается из CMS не чаще раза в минуту.
export const revalidate = 60;

/** Сборка витринной модели статьи из ответа публичного API CMS. */
function toArticle(
  item: ApiNewsItem,
  related: RelatedArticle[],
  articleUi: ReturnType<typeof getArticleUi>,
  press: { pressKicker: string; pressSource: string; newsCategory: string },
  locale: Locale,
): Article {
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
      ? `${item.category} · ${press.pressKicker}`
      : press.pressKicker,
    title: item.title,
    lead: item.excerpt ?? "",
    // Дата плюс время публикации. Дату CMS отдаёт готовой строкой на языке
    // страницы, время берём из ISO-метки `datetime` — она уже приходит, и
    // добавлять формат в API ради этого не требуется. Для читателя новостей
    // время публикации — часть смысла: «сегодня в 10:00» и «сегодня» разные
    // сообщения.
    datetime: [item.date, publishTime(item.datetime, locale)]
      .filter(Boolean)
      .join(" · "),
    source: press.pressSource,
    photoLabel: articleUi.photoCaptionSource,
    // Подпись — из CMS, у каждого материала своя. Раньше сюда подставлялась
    // общая строка словаря «Фото: пресс-служба КЧС», и она стояла под любым
    // снимком независимо от того, что на нём изображено.
    caption: item.image_data?.caption ?? null,
    blocks,
    // Вложения материала из CMS. Блок «Материалы» под них уже был свёрстан,
    // но всегда получал пустой список — приложить памятку было нечем.
    materials: (item.attachments ?? []).map((file) => ({
      tag: file.ext,
      title: file.title,
      size: file.size,
      href: file.url,
    })),
    related,
  };
}

async function relatedFor(
  slug: string,
  locale: Locale,
  newsCategory: string,
): Promise<RelatedArticle[]> {
  const { data } = await fetchNews({ perPage: 6, locale });
  return data
    .filter((p) => p.slug !== slug)
    .slice(0, 3)
    .map((p) => ({
      kicker: p.category ?? newsCategory,
      title: p.title,
      href: routes.article(p.slug),
    }));
}

export async function generateStaticParams({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return fetchStaticParamSlugs("news", toLocale(locale));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const loc = toLocale(locale);
  const { common, pages } = getDictionary(loc);
  // A thrown (non-404) fetch failure degrades the same as "not found" here —
  // metadata has no meaningful title to offer either way. The page body's
  // own fetch (below) is what decides notFound() vs. the error boundary.
  const item = await fetchNewsItem(slug, loc).catch(() => null);
  if (!item) {
    return { title: pages.meta.newsFallback, robots: { index: false } };
  }
  const image = cmsImageSource(item.image_data);
  const availableLocales = await availableLocalesFor("news", slug);
  // Непереведённый fallback не индексируем как «английскую публикацию»:
  // страница честно показывает заметку о переводе, canonical остаётся своим.
  const untranslated = !availableLocales.includes(loc);

  return {
    ...buildMetadata({
      locale: loc,
      title: item.seo?.title ?? item.title,
      description: item.seo?.description ?? item.excerpt,
      path: `/news/${slug}`,
      images: image ? [image] : undefined,
      type: "article",
      publishedTime: item.datetime,
      siteName: common.siteShort,
      availableLocales,
    }),
    ...(untranslated ? { robots: { index: false, follow: true } } : {}),
  };
}

/**
 * Время публикации «10:00» на языке страницы. Пустая строка, если CMS не
 * прислала ISO-метку, — тогда в шапке остаётся только дата.
 */
function publishTime(iso: string | null | undefined, locale: Locale): string {
  if (!iso) {
    return "";
  }

  const parsed = new Date(iso);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(htmlLang(locale), {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Dushanbe",
  }).format(parsed);
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = toLocale(rawLocale);
  const articleUi = getArticleUi(locale);
  const { common, pages } = getDictionary(locale);
  // Non-404 fetch failures are an expected-error case (see
  // FetchErrorFallback) — handled inline, not left to throw.
  let item;
  try {
    item = await fetchNewsItem(slug, locale);
  } catch {
    return (
      <PageShell
        mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-6 max-[920px]:px-4"
      >
        <FetchErrorFallback locale={locale} />
      </PageShell>
    );
  }

  if (!item) {
    notFound();
  }
  const hasImage = cmsImageSource(item.image_data) !== null;
  const gallery = item.gallery_data ?? [];
  const galleryReady = gallery.length > 1;

  // Тело с маркером галереи режется на «до/после»: карусель встаёт туда,
  // куда редактор поставил маркер в CMS. Без маркера — прежнее место под
  // обложкой; без кадров маркеры вырезаются, чтобы читатель не видел
  // технический текст.
  const bodyHtml = item.body ?? "";
  const bodyIsHtml = /<[a-z][\s\S]*>/i.test(bodyHtml);
  const markerInBody = bodyIsHtml && hasGalleryMark(bodyHtml);
  const [bodyBefore, bodyAfter] = markerInBody
    ? splitBodyByGallery(bodyHtml)
    : ["", ""];

  // Оргданные для publisher/author в NewsArticle. Тот же запрос, что делает
  // layout ради шапки и подвала, — Next дедуплицирует его в рамках рендера
  // (замер в PROGRESS.md, §F-06: `settings ×1` на страницу), поэтому лишнего
  // обращения к CMS здесь не появляется.
  const [related, settings] = await Promise.all([
    relatedFor(slug, locale, pages.newsDetail.newsCategory),
    fetchSettings(locale),
  ]);
  const article = toArticle(
    item,
    related,
    articleUi,
    pages.newsDetail,
    locale,
  );

  // Тело из CMS: у новых материалов — санитайзенный HTML из WYSIWYG-редактора,
  // у старых — простой текст. HTML выводим как есть; текст разбиваем на абзацы
  // (fallback, см. toArticle). Санитайзинг выполнен на стороне CMS при записи.
  // bodyHtml/bodyIsHtml/markerInBody объявлены выше, у figure обложки.

  // Есть ли настоящий перевод: CMS отдала контент (возможно, fallback'ом
  // на русский), а списки slug'ов говорят, в каких локали он опубликован.
  const availableLocales = await availableLocalesFor("news", slug);

  return (
    <PageShell
      mainClassName="mx-auto w-full max-w-[1160px] px-6 pt-6 max-[920px]:px-4"
    >
      <NewsArticleJsonLd
        item={item}
        locale={locale}
        path={`/news/${slug}`}
        settings={settings}
      />
      <BreadcrumbJsonLd
        items={[
          { label: common.breadcrumbHome, href: routes.home },
          { label: common.nav.news, href: routes.news },
          { label: article.breadcrumb },
        ]}
        locale={locale}
      />
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
          <TranslationNotice
            locale={locale}
            available={availableLocales}
            path={`/news/${slug}`}
          />
          <span
            className="text-[11px] uppercase tracking-[.1em]"
            style={{ color: "var(--color-accent-700)" }}
          >
            {article.kicker}
          </span>
          <h1 className="page-title mb-3 mt-2.5">{article.title}</h1>
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
              title={article.title}
              excerpt={article.lead}
              shareLabel={articleUi.share}
              sharedLabel={articleUi.shared}
              printLabel={articleUi.print}
            />
          </div>

          {/* duotone только когда есть настоящее фото: тот же слой поверх
              логотипа-заглушки перекрашивал сам логотип. Подпись — внутри
              <figure>, иначе она не связана с изображением. */}
          <figure className="mb-5">
            <span
              className={`blueprint relative block h-[340px] ${
                hasImage ? "duotone" : ""
              }`}
            >
              {hasImage && item.image_data ? (
                <CmsImage
                  image={item.image_data}
                  sizes="(max-width: 920px) 100vw, 760px"
                  fetchPriority="high"
                  loading="eager"
                />
              ) : (
                <ImageSlot label={article.photoLabel} />
              )}
            </span>
            {article.caption && (
              <figcaption className="mt-2">{article.caption}</figcaption>
            )}
          </figure>

          {galleryReady && !markerInBody && (
            <GalleryCarousel
              images={gallery}
              ariaLabel={articleUi.galleryAria}
            />
          )}

          {bodyIsHtml ? (
            markerInBody ? (
              <>
                {bodyBefore && (
                  <div
                    className="article-prose"
                    dangerouslySetInnerHTML={{ __html: bodyBefore }}
                  />
                )}
                {galleryReady && (
                  <GalleryCarousel
                    images={gallery}
                    ariaLabel={articleUi.galleryAria}
                  />
                )}
                {bodyAfter && (
                  <div
                    className="article-prose"
                    dangerouslySetInnerHTML={{ __html: bodyAfter }}
                  />
                )}
              </>
            ) : (
              <div
                className="article-prose"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            )
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
              <h2 className="kicker-heading" style={{ color: muted(55) }}>
                {articleUi.materialsTitle}
              </h2>
              {article.materials.map((m) => (
                <Link
                  key={m.title}
                  href={m.href}
                  className="row-link flex items-center gap-2.5 border-b border-[var(--color-divider)] py-2.5"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <span className="tag tag-neutral flex-none">{m.tag}</span>
                  <span className="flex-1 text-[13.5px]">{m.title}</span>
                  <span
                    className="flex-none text-xs"
                    style={{ color: muted(50) }}
                  >
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
              <h2 className="mb-2.5 kicker-heading" style={{ color: muted(55) }}>
                {articleUi.relatedTitle}
              </h2>
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
            <h2 className="m-0 kicker-heading" style={{ color: muted(55) }}>
              {articleUi.sourceBoxTitle}
            </h2>
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
