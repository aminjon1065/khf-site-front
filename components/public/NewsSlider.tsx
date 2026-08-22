"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "@/components/i18n/LocaleLink";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { ImageSlot, muted } from "@/components/public/ui";
import { localeFromPathname } from "@/lib/i18n/config";
import { getUiStrings } from "@/lib/i18n/ui-strings";

export interface Slide {
  kicker: string;
  title: string;
  excerpt: string;
  photoLabel: string;
  /** Адрес материала. Обязателен: слайды строятся только из выдачи CMS, а
      прежний фолбэк вёл на демонстрационный слаг несуществующей новости. */
  href: string;
  /** URL фото из CMS. Без него слайд становится редакционным, без пустой плиты. */
  imageSrc?: string | null;
}

const AUTOPLAY_MS = 7000;
const SWIPE_PX = 40;

/**
 * Слайдер главных новостей: автопрокрутка 7 с, пауза при наведении / фокусе /
 * ручном управлении, отключается при prefers-reduced-motion. Клавиши ← → и
 * горизонтальный свайп переключают слайд.
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
  const [userPaused, setUserPaused] = useState(false);
  const hoverPause = useRef(false);
  const focusPause = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const n = slides.length;
  const activeSlide = slides[slide];

  useEffect(() => {
    if (n <= 1) {
      return;
    }

    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = setInterval(() => {
      if (
        !userPaused &&
        !hoverPause.current &&
        !focusPause.current &&
        !rm.matches
      ) {
        setSlide((s) => (s + 1) % n);
      }
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [n, userPaused]);

  if (n === 0 || !activeSlide) {
    return null;
  }

  const go = (next: number) => {
    setSlide((next + n) % n);
    setUserPaused(true);
  };

  const dot = (i: number) =>
    i === slide
      ? "var(--color-accent)"
      : "color-mix(in srgb, var(--color-text) 25%, transparent)";

  return (
    <div
      className="blueprint mast-card relative min-w-0 overflow-visible"
      role="group"
      aria-roledescription={ui.carousel}
      aria-label={ui.region}
      tabIndex={0}
      onMouseEnter={() => (hoverPause.current = true)}
      onMouseLeave={() => (hoverPause.current = false)}
      onFocus={() => (focusPause.current = true)}
      onBlur={() => (focusPause.current = false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          go(slide - 1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          go(slide + 1);
        }
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchStartX.current;
        const end = event.changedTouches[0]?.clientX;
        touchStartX.current = null;
        if (start == null || end == null) {
          return;
        }
        const dx = end - start;
        if (dx > SWIPE_PX) {
          go(slide - 1);
        } else if (dx < -SWIPE_PX) {
          go(slide + 1);
        }
      }}
    >
      <div className="min-h-[430px] overflow-hidden max-[920px]:min-h-0">
        <article
          key={slide}
          className={
            activeSlide.imageSrc
              ? "slide-fade grid min-h-[430px] w-full grid-cols-[minmax(0,1fr)_42%] max-[920px]:min-h-0 max-[920px]:grid-cols-1"
              : "slide-editorial slide-fade relative grid min-h-[430px] w-full grid-cols-1 max-[920px]:min-h-[320px]"
          }
        >
          <div className="flex min-w-0 flex-col justify-center gap-3 px-7 py-[26px] max-[920px]:px-[18px] max-[920px]:py-[18px]">
            {activeSlide.kicker ? (
              <div
                className="text-[13px] tracking-[.04em]"
                style={{ color: "var(--color-accent-700)" }}
              >
                {activeSlide.kicker}
              </div>
            ) : null}
            <h2
              className={`m-0 leading-[1.15] [overflow-wrap:anywhere] ${
                activeSlide.imageSrc
                  ? "text-[clamp(22px,2.1vw+14px,32px)]"
                  : "max-w-[34rem] text-[clamp(26px,2.6vw+16px,38px)]"
              }`}
            >
              <Link
                href={activeSlide.href}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {activeSlide.title}
              </Link>
            </h2>
            {activeSlide.excerpt ? (
              <p
                className="m-0 max-w-[36rem] text-base leading-[1.55]"
                style={{ color: muted(78) }}
              >
                {activeSlide.excerpt}
              </p>
            ) : null}
            <Link
              href={activeSlide.href}
              className="btn btn-secondary mt-1.5 self-start"
            >
              {readMore}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {n > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => go(slide - 1)}
                    aria-label={ui.prev}
                    className="btn btn-icon btn-secondary h-11 w-11"
                    style={{ background: "var(--color-bg)" }}
                  >
                    <ChevronLeft size={16} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => go(i)}
                      aria-label={`${ui.slide} ${i + 1}`}
                      aria-current={i === slide ? "true" : undefined}
                      className="slider-dot h-1 w-[22px] cursor-pointer border-none p-0"
                      style={{ background: dot(i) }}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => go(slide + 1)}
                    aria-label={ui.next}
                    className="btn btn-icon btn-secondary h-11 w-11"
                    style={{ background: "var(--color-bg)" }}
                  >
                    <ChevronRight size={16} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserPaused((p) => !p)}
                    aria-label={userPaused ? ui.play : ui.pause}
                    className="btn btn-icon btn-secondary h-11 w-11"
                    style={{ background: "var(--color-bg)" }}
                  >
                    {userPaused ? (
                      <Play size={16} strokeWidth={1.5} aria-hidden="true" />
                    ) : (
                      <Pause size={16} strokeWidth={1.5} aria-hidden="true" />
                    )}
                  </button>
                </>
              ) : null}
              <span
                className="text-sm [font-variant-numeric:tabular-nums]"
                style={{ color: muted(75) }}
                aria-live="polite"
              >
                {slide + 1} {ui.of} {n}
              </span>
            </div>
          </div>
          {activeSlide.imageSrc ? (
            <Link
              href={activeSlide.href}
              tabIndex={-1}
              aria-hidden="true"
              className="min-h-full max-[920px]:order-first max-[920px]:min-h-[210px]"
              style={{ display: "block" }}
            >
              <ImageSlot
                src={activeSlide.imageSrc}
                alt=""
                duotone
                // В DOM находится только активный слайд, и его фото всегда
                // находится на первом экране. Начальный кадр дополнительно
                // preload-ится из HTML, последующие — загружаются eager только
                // когда становятся активными после спокойной 7-секундной паузы.
                eager
                preload={slide === 0}
                sizes="(max-width: 920px) 100vw, 420px"
              />
            </Link>
          ) : (
            <span className="slide-editorial-index" aria-hidden="true">
              {String(slide + 1).padStart(2, "0")}
            </span>
          )}
        </article>
      </div>
    </div>
  );
}
