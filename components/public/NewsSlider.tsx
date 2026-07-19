"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ImageSlot, muted } from "@/components/public/ui";
import { routes } from "@/lib/routes";

export interface Slide {
  kicker: string;
  title: string;
  excerpt: string;
  photoLabel: string;
  href?: string;
}

/**
 * Слайдер главных новостей: transform translateX, автопрокрутка 7с,
 * пауза при наведении, отключается при prefers-reduced-motion.
 */
export default function NewsSlider({
  slides,
  readMore,
}: {
  slides: Slide[];
  readMore: string;
}) {
  const [slide, setSlide] = useState(0);
  const paused = useRef(false);
  const n = slides.length;

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = setInterval(() => {
      if (!paused.current && !rm.matches) setSlide((s) => (s + 1) % n);
    }, 7000);
    return () => clearInterval(timer);
  }, [n]);

  const dot = (i: number) =>
    i === slide
      ? "var(--color-accent)"
      : "color-mix(in srgb, var(--color-text) 25%, transparent)";

  return (
    <div
      className="blueprint relative min-w-0 overflow-visible"
      role="group"
      aria-roledescription="карусель"
      aria-label="Главные новости"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <div className="min-h-[430px] overflow-hidden">
        <div
          className="flex [transition:transform_.5s_ease] [will-change:transform]"
          style={{ transform: `translateX(-${slide * 100}%)` }}
        >
          {slides.map((s, i) => (
            <article
              key={i}
              className="grid min-h-[430px] w-full flex-none grid-cols-[minmax(0,1fr)_42%] max-[920px]:grid-cols-1"
            >
              <div className="flex min-w-0 flex-col justify-center gap-3 px-7 py-[26px] max-[920px]:px-[18px] max-[920px]:pb-[60px] max-[920px]:pt-[18px]">
                <div
                  className="text-[11px] uppercase tracking-[.1em]"
                  style={{ color: "var(--color-accent-700)" }}
                >
                  {s.kicker}
                </div>
                <h2 className="m-0 text-[27px] leading-[1.15]">
                  <Link
                    href={s.href ?? routes.article()}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    {s.title}
                  </Link>
                </h2>
                <p
                  className="m-0 text-sm leading-[1.55]"
                  style={{ color: muted(72) }}
                >
                  {s.excerpt}
                </p>
                <Link
                  href={s.href ?? routes.article()}
                  className="btn btn-secondary mt-1.5 self-start"
                >
                  {readMore}
                </Link>
              </div>
              <div className="duotone min-h-full max-[920px]:order-first max-[920px]:min-h-[210px]">
                <ImageSlot label={s.photoLabel} />
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="absolute bottom-[18px] left-7 flex items-center gap-2.5">
        <button
          onClick={() => setSlide((s) => (s + n - 1) % n)}
          aria-label="Предыдущий слайд"
          className="btn btn-icon btn-secondary h-[30px] w-[30px]"
          style={{ background: "var(--color-bg)" }}
        >
          <ChevronLeft size={14} strokeWidth={1.5} aria-hidden="true" />
        </button>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            aria-label={`Слайд ${i + 1}`}
            className="h-1 w-[22px] cursor-pointer border-none p-0"
            style={{ background: dot(i) }}
          />
        ))}
        <button
          onClick={() => setSlide((s) => (s + 1) % n)}
          aria-label="Следующий слайд"
          className="btn btn-icon btn-secondary h-[30px] w-[30px]"
          style={{ background: "var(--color-bg)" }}
        >
          <ChevronRight size={14} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
