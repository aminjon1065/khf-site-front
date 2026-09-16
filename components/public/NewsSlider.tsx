"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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

/** Сетка слайда: с фото — две колонки, без фото — одна (крупнее кегль). */
function slideGridClass(hasImage: boolean): string {
  return hasImage
    ? "grid min-h-[430px] w-full grid-cols-[minmax(0,1fr)_42%] max-[920px]:min-h-0 max-[920px]:grid-cols-1"
    : "slide-editorial relative grid min-h-[430px] w-full grid-cols-1 max-[920px]:min-h-[320px]";
}

/**
 * Текстовая колонка слайда. Один и тот же разметочный код используется и для
 * активного слайда, и для невидимого слоя-габарита (см. ниже), поэтому высота
 * у них совпадает до пикселя — иначе бронь высоты не имела бы смысла.
 */
function SlideText({
  slide,
  controls,
  readMore,
  interactive,
}: {
  slide: Slide;
  controls: ReactNode;
  readMore: string;
  /** false — слой-габарит: ни ссылок, ни кнопок, только их габариты. */
  interactive: boolean;
}) {
  return (
    // Два слоя, а не один центрированный столбец: ряд управления —
    // постоянный элемент слайдера, а не часть материала. Пока он лежал внутри
    // центрированного блока, его вертикальное положение зависело от длины
    // заголовка и «плавало» от слайда к слайду — кнопки приходилось искать
    // заново после каждой прокрутки. Теперь содержимое центрируется в
    // свободном месте (flex-1 + justify-center), а управление прибито к низу.
    <div className="flex min-w-0 flex-col gap-3 px-7 py-[26px] max-[920px]:px-[18px] max-[920px]:py-[18px]">
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
        {slide.kicker ? (
          <div
            className="text-[13px] tracking-[.04em]"
            style={{ color: "var(--color-accent-700)" }}
          >
            {slide.kicker}
          </div>
        ) : null}
        {/* line-clamp, а не обрезка строки в JS: в разметке остаётся полный
            заголовок (его читает скринридер и он же — доступное имя ссылки),
            а визуально лишнее заканчивается многоточием. Обрезка по СТРОКАМ, а
            не по числу символов: одно и то же количество знаков на 360px и на
            1440px даёт совершенно разную высоту, а держать надо именно высоту. */}
        <h2
          className={`m-0 line-clamp-3 leading-[1.15] [overflow-wrap:anywhere] ${
            slide.imageSrc
              ? "text-[clamp(22px,2.1vw+14px,32px)]"
              : "max-w-[34rem] text-[clamp(26px,2.6vw+16px,38px)]"
          }`}
        >
          {interactive ? (
            <Link
              href={slide.href}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {slide.title}
            </Link>
          ) : (
            slide.title
          )}
        </h2>
        {slide.excerpt ? (
          <p
            className="m-0 line-clamp-2 max-w-[36rem] text-base leading-[1.55]"
            style={{ color: muted(78) }}
          >
            {slide.excerpt}
          </p>
        ) : null}
        {interactive ? (
          <Link
            href={slide.href}
            className="btn btn-secondary mt-1.5 self-start"
          >
            {readMore}
          </Link>
        ) : (
          <span className="btn btn-secondary mt-1.5 self-start">{readMore}</span>
        )}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2">{controls}</div>
    </div>
  );
}

/**
 * Слайдер главных новостей: автопрокрутка 7 с, пауза при наведении / фокусе /
 * ручном управлении, отключается при prefers-reduced-motion. Клавиши ← → и
 * горизонтальный свайп переключают слайд.
 *
 * Высота блока постоянна и складывается из двух мер:
 *
 *  1. Заголовок и лид ограничены по числу СТРОК (line-clamp в SlideText).
 *     Без этого один материал CMS с заголовком в 241 символ растягивал слайдер
 *     до 747 px против 434 px у остальных. Растягивалась и соседняя карточка
 *     Президента (сетка `items-stretch`), а её фото — 629×500 — масштабировалось
 *     в полтора раза выше своего разрешения и заметно теряло качество.
 *  2. Остаток разброса (слайд без лида против слайда с лидом) добирает
 *     невидимый слой-габарит ниже: высота ячейки равна максимуму по всем
 *     слайдам, поэтому смена кадра не двигает ничего под слайдером
 *     (замеренный вклад этого дёрганья в CLS главной был 0,074 из 0,119).
 *
 * Полный заголовок при этом остаётся в разметке — обрезано только отображение.
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
  const inView = useRef(true);
  const touchStartX = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const n = slides.length;
  const activeSlide = slides[slide];

  // Автопрокрутка останавливается не только по наведению/фокусу, но и когда
  // слайдер вне вьюпорта или вкладка скрыта: невидимые смены слайда тратят
  // таймер и главный экран (а с ним и preload следующего фото) приходит к
  // пользователю в произвольном месте ротации.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        inView.current = entries.some((e) => e.isIntersecting);
      },
      { rootMargin: "80px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
        !rm.matches &&
        inView.current &&
        document.visibilityState === "visible"
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

  // Ряд управления одинаков для всех слайдов и обязан войти в бронь высоты.
  // В слое-габарите вместо кнопок — span'ы с теми же классами: коробка та же,
  // а лишних 28 фокусируемых элементов в DOM не появляется.
  const renderControls = (interactive: boolean): ReactNode => {
    const Btn = interactive ? "button" : "span";
    const iconBtn = {
      className: "btn btn-icon btn-secondary h-11 w-11",
      style: { background: "var(--color-bg)" },
    };

    return (
      <>
        {n > 1 ? (
          <>
            <Btn
              {...(interactive
                ? { type: "button" as const, onClick: () => go(slide - 1), "aria-label": ui.prev }
                : {})}
              {...iconBtn}
            >
              <ChevronLeft size={16} strokeWidth={1.5} aria-hidden="true" />
            </Btn>
            {slides.map((_, i) => (
              <Btn
                key={i}
                {...(interactive
                  ? {
                      type: "button" as const,
                      onClick: () => go(i),
                      "aria-label": `${ui.slide} ${i + 1}`,
                      "aria-current": i === slide ? ("true" as const) : undefined,
                    }
                  : {})}
                className="slider-dot h-1 w-[22px] cursor-pointer border-none p-0"
                style={{ background: dot(i) }}
              />
            ))}
            <Btn
              {...(interactive
                ? { type: "button" as const, onClick: () => go(slide + 1), "aria-label": ui.next }
                : {})}
              {...iconBtn}
            >
              <ChevronRight size={16} strokeWidth={1.5} aria-hidden="true" />
            </Btn>
            <Btn
              {...(interactive
                ? {
                    type: "button" as const,
                    onClick: () => setUserPaused((p) => !p),
                    "aria-label": userPaused ? ui.play : ui.pause,
                  }
                : {})}
              {...iconBtn}
            >
              {userPaused ? (
                <Play size={16} strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Pause size={16} strokeWidth={1.5} aria-hidden="true" />
              )}
            </Btn>
          </>
        ) : null}
        <span
          className="text-sm [font-variant-numeric:tabular-nums]"
          style={{ color: muted(75) }}
          {...(interactive ? { "aria-live": "polite" as const } : {})}
        >
          {slide + 1} {ui.of} {n}
        </span>
      </>
    );
  };

  return (
    <div
      ref={rootRef}
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
      {/* Оба слоя лежат в одной ячейке grid: высота ячейки = максимум из них,
          то есть высота самого высокого слайда, и она не меняется при
          переключении. */}
      <div className="slider-stack min-h-[430px] overflow-hidden max-[920px]:min-h-0">
        {/* Слой-габарит. `visibility: hidden` (класс .slider-gauge) сохраняет
            занимаемое место, но убирает слой из дерева доступности и из
            порядка табуляции — скринридер и клавиатура его не видят. Фото сюда
            не попадает: колонка изображения у всех слайдов одинаковой ширины,
            а лишние четыре запроса за картинками были бы ровно тем, чего этот
            слайдер избегает. */}
        {n > 1 && (
          <div className="slider-gauge" aria-hidden="true">
            {slides.map((s, i) => (
              <div key={i} className={slideGridClass(Boolean(s.imageSrc))}>
                <SlideText
                  slide={s}
                  controls={renderControls(false)}
                  readMore={readMore}
                  interactive={false}
                />
                {s.imageSrc ? <div /> : null}
              </div>
            ))}
          </div>
        )}

        <article
          key={slide}
          className={`slide-fade ${slideGridClass(Boolean(activeSlide.imageSrc))}`}
        >
          <SlideText
            slide={activeSlide}
            controls={renderControls(true)}
            readMore={readMore}
            interactive
          />
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
                // На широком экране колонка фото — 42% ширины слайдера:
                // контейнер главной capped на 1160px, значит это ~320 CSS px
                // независимо от вьюпорта, а не 420. Завышенная подсказка
                // скачивала вариант крупнее нужного при любом DPR.
                sizes="(max-width: 920px) 100vw, 320px"
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
