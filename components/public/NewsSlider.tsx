"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "@/components/i18n/LocaleLink";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ImageSlot, muted } from "@/components/public/ui";
import { routes } from "@/lib/routes";
import { localeFromPathname } from "@/lib/i18n/config";
import { getUiStrings } from "@/lib/i18n/ui-strings";

export interface Slide {
  kicker: string;
  title: string;
  excerpt: string;
  photoLabel: string;
  href?: string;
  /** URL фото из CMS. Без него слайд становится редакционным, без пустой плиты. */
  imageSrc?: string | null;
}

/**
 * Слайдер главных новостей: transform translateX, автопрокрутка 7с,
 * пауза при наведении, отключается при prefers-reduced-motion.
 */
export default function NewsSlider({
  slides,
  readMore,
}: {
  slides: readonly Slide[];
  readMore: string;
}) {
  const ui = getUiStrings(localeFromPathname(usePathname())).slider;
  const [slide, setSlide] = useState(0);
  const paused = useRef(false);
  const n = slides.length;
  const activeSlide = slides[slide];

  useEffect(() => {
    if (n === 0) {
      return;
    }

    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = setInterval(() => {
      if (!paused.current && !rm.matches) setSlide((s) => (s + 1) % n);
    }, 7000);
    return () => clearInterval(timer);
  }, [n]);

  if (n === 0 || !activeSlide) {
    return null;
  }

  const dot = (i: number) =>
    i === slide
      ? "var(--color-accent)"
      : "color-mix(in srgb, var(--color-text) 25%, transparent)";

  return (
    <div
      className="blueprint relative min-w-0 overflow-visible"
      role="group"
      aria-roledescription={ui.carousel}
      aria-label={ui.region}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <div className="min-h-[430px] overflow-hidden">
        <article
          key={slide}
          className={
            activeSlide.imageSrc
              ? "slide-fade grid min-h-[430px] w-full grid-cols-[minmax(0,1fr)_42%] max-[920px]:grid-cols-1"
              : "slide-editorial slide-fade relative grid min-h-[430px] w-full grid-cols-1"
          }
        >
          <div className="flex min-w-0 flex-col justify-center gap-3 px-7 py-[26px] max-[920px]:px-[18px] max-[920px]:pb-[60px] max-[920px]:pt-[18px]">
            {activeSlide.kicker ? (
              <div
                className="text-[11px] uppercase tracking-[.1em]"
                style={{ color: "var(--color-accent-700)" }}
              >
                {activeSlide.kicker}
              </div>
            ) : null}
            <h2
              className={`m-0 leading-[1.12] ${
                activeSlide.imageSrc
                  ? "text-[clamp(22px,2.1vw+14px,32px)]"
                  : "max-w-[34rem] text-[clamp(26px,2.6vw+16px,38px)]"
              }`}
            >
              <Link
                href={activeSlide.href ?? routes.article()}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {activeSlide.title}
              </Link>
            </h2>
            {activeSlide.excerpt ? (
              <p
                className="m-0 max-w-[36rem] text-sm leading-[1.55]"
                style={{ color: muted(72) }}
              >
                {activeSlide.excerpt}
              </p>
            ) : null}
            <Link
              href={activeSlide.href ?? routes.article()}
              className="btn btn-primary mt-1.5 self-start"
            >
              {readMore}
            </Link>
          </div>
          {activeSlide.imageSrc ? (
            <div className="min-h-full max-[920px]:order-first max-[920px]:min-h-[210px]">
              <ImageSlot
                src={activeSlide.imageSrc}
                alt=""
                duotone
                eager={slide === 0}
                preload={slide === 0}
                sizes="(max-width: 920px) 100vw, 420px"
              />
            </div>
          ) : (
            <span className="slide-editorial-index" aria-hidden="true">
              {String(slide + 1).padStart(2, "0")}
            </span>
          )}
        </article>
      </div>
      <div className="absolute bottom-[18px] left-7 flex items-center gap-2.5">
        <button
          onClick={() => setSlide((s) => (s + n - 1) % n)}
          aria-label={ui.prev}
          className="btn btn-icon btn-secondary h-[30px] w-[30px]"
          style={{ background: "var(--color-bg)" }}
        >
          <ChevronLeft size={14} strokeWidth={1.5} aria-hidden="true" />
        </button>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            aria-label={`${ui.slide} ${i + 1}`}
            className="h-1 w-[22px] cursor-pointer border-none p-0"
            style={{ background: dot(i) }}
          />
        ))}
        <button
          onClick={() => setSlide((s) => (s + 1) % n)}
          aria-label={ui.next}
          className="btn btn-icon btn-secondary h-[30px] w-[30px]"
          style={{ background: "var(--color-bg)" }}
        >
          <ChevronRight size={14} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
