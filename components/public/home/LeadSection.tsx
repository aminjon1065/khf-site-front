import { ImageSlot, muted } from "@/components/public/ui";
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
        className="blueprint mast-card surface-hover flex min-w-0 flex-col"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <span className="block min-h-[240px] flex-1">
          {/* Без preload: единственная приоритетная предзагрузка на первом
              экране — фото первого слайда (см. NewsSlider). Фото президента
              на широком экране выше вьюпорта не конкурирует — оно и так
              загрузится сразу (в кадре), а на мобильном находится под
              слайдером и не должно отнимать канал у LCP. Геометрия
              зарезервирована, так что lazy не даёт скачка. */}
          <ImageSlot
            src={p.photo}
            alt={presidentPhotoAlt}
            sizes="(max-width: 920px) calc(100vw - 32px), 360px"
          />
        </span>
        <span className="flex flex-col gap-1 px-4 pb-4 pt-[14px]">
          <span
            className="text-[13px] tracking-[.04em]"
            style={{ color: "var(--color-accent-700)" }}
          >
            {p.kicker}
          </span>
          <span className="text-[19px] font-semibold leading-[1.15] [font-family:var(--font-heading)]">
            {p.name}
          </span>
          <span className="text-sm" style={{ color: muted(75) }}>
            {p.role}
          </span>
          <span
            className="mt-2 border-t border-[var(--color-divider)] pt-2 text-sm leading-[1.5]"
            style={{ color: muted(78) }}
          >
            {p.quote}
          </span>
        </span>
      </a>
    </section>
  );
}
