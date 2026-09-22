import { ImageSlot } from "@/components/public/ui";
import NewsSlider from "@/components/public/NewsSlider";
import { routes } from "@/lib/routes";
import { cmsImageSource } from "@/lib/media";
import type { ApiNewsItem } from "@/lib/api";
import type { Dictionary } from "@/lib/i18n/dictionaries/ru";

/**
 * Главное: слайдер + карточка Президента.
 * Слайдер строится только из материалов CMS. Раньше при нехватке
 * новостей подставлялись три демонстрационных слайда из словаря — с
 * выдуманными заголовками, датами и ссылками на несуществующие
 * материалы. Нет новостей — нет и слайдера: карточка Президента
 * занимает всю ширину.
 */
export default function LeadSection({
  news,
  home,
  ariaLabel,
  presidentPhotoAlt,
}: {
  news: ApiNewsItem[];
  home: Dictionary["home"];
  ariaLabel: string;
  presidentPhotoAlt: string;
}) {
  const slides = news.slice(0, 4).map((item) => ({
    kicker: [item.category, item.date].filter(Boolean).join(" · "),
    title: item.title,
    excerpt: item.excerpt ?? "",
    photoLabel: home.news.featured.photoLabel,
    href: routes.article(item.slug),
    imageSrc: cmsImageSource(item.image_data),
  }));
  const p = home.president;

  return (
    <section
      aria-label={ariaLabel}
      className={
        slides.length > 0
          ? "grid grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] items-stretch gap-7 max-[920px]:grid-cols-1"
          : "grid grid-cols-1 items-stretch gap-7"
      }
    >
      {slides.length > 0 && (
        <NewsSlider slides={slides} readMore={home.slider.readMore} />
      )}
      <a
        href={p.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={p.aria}
        className="blueprint surface-hover flex min-w-0 flex-col overflow-hidden border-t-4 border-t-sky-900 dark:border-t-sky-600 transition-all hover:shadow-md"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <span className="block min-h-[220px] flex-1 overflow-hidden">
          <ImageSlot
            src={p.photo}
            alt={presidentPhotoAlt}
            sizes="(max-width: 920px) calc(100vw - 32px), 360px"
          />
        </span>
        <span className="flex flex-col gap-1.5 p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-900 dark:text-sky-400">
            {p.kicker}
          </span>
          <span className="text-[18px] font-bold leading-tight text-slate-900 dark:text-slate-100 [font-family:var(--font-heading)]">
            {p.name}
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {p.role}
          </span>
          <span className="mt-2 rounded-r-lg border-l-2 border-sky-800/40 bg-slate-50 dark:bg-slate-800/50 py-2 pl-3 text-xs italic leading-relaxed text-slate-700 dark:text-slate-300">
            «{p.quote.replace(/^[«"]|[»"]$/g, "")}»
          </span>
        </span>
      </a>
    </section>
  );
}
