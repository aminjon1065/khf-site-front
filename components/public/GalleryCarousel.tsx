"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CmsImage from "@/components/public/CmsImage";
import type { CmsImageDto } from "@/lib/media";

/**
 * Карусель фотогалереи материала. Без автопрокрутки: снимки ЧС листают
 * осознанно, а не пролистывают мимо. Управление — кнопки, клавиши ← →,
 * свайп/скролл с CSS scroll-snap; плавность прокрутки отключается при
 * prefers-reduced-motion (motion-reduce:scroll-auto).
 *
 * Все кадры остаются в DOM и доступны скринридеру и поисковой выдаче;
 * aria-label каждого слайда — alt снимка из медиатеки CMS.
 */
export default function GalleryCarousel({
  images,
  ariaLabel,
}: {
  images: CmsImageDto[];
  ariaLabel: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = images.length;

  const scrollTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const clamped = Math.max(0, Math.min(index, count - 1));
    track.children[clamped]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }, [count]);

  // Активный кадр — ближайший к началу дорожки; считается из scrollLeft, а не
  // из событий кнопок, чтобы свайп и скролл тоже двигали счётчик.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const onScroll = () => {
      const child = track.children[0] as HTMLElement | undefined;
      if (!child || child.offsetWidth === 0) {
        return;
      }
      setActive(Math.round(track.scrollLeft / child.offsetWidth));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  if (count < 2) {
    return null;
  }

  return (
    <section
      className="mb-5"
      aria-label={ariaLabel}
      aria-roledescription="carousel"
    >
      <div
        ref={trackRef}
        tabIndex={0}
        role="group"
        aria-label={`${ariaLabel}: ${active + 1} / ${count}`}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto motion-reduce:scroll-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            scrollTo(active + 1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            scrollTo(active - 1);
          }
        }}
      >
        {images.map((image, index) => (
          <figure
            key={image.id}
            aria-roledescription="slide"
            aria-label={`${index + 1} / ${count}`}
            className="relative h-[340px] w-[min(100%,640px)] flex-none snap-start blueprint"
          >
            <CmsImage
              image={image}
              sizes="(max-width: 920px) 100vw, 640px"
              loading={index === 0 ? "eager" : "lazy"}
              priority={false}
            />
            {image.caption && (
              <figcaption className="absolute inset-x-0 bottom-0 px-4 py-2 text-[13px] text-white" style={{ background: "rgba(0,0,0,.45)" }}>
                {image.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          className="btn btn-secondary min-h-11 w-11 justify-center p-0"
          aria-label={`${ariaLabel}: ‹`}
          disabled={active === 0}
          onClick={() => scrollTo(active - 1)}
        >
          <ChevronLeft size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn btn-secondary min-h-11 w-11 justify-center p-0"
          aria-label={`${ariaLabel}: ›`}
          disabled={active === count - 1}
          onClick={() => scrollTo(active + 1)}
        >
          <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
        <span
          className="ml-1 text-[13px] [font-variant-numeric:tabular-nums]"
          style={{ color: "var(--color-neutral-500, inherit)" }}
        >
          {active + 1} / {count}
        </span>
      </div>
    </section>
  );
}
