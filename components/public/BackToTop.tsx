"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { ChevronUp } from "lucide-react";

/** Порог, после которого кнопка «Наверх» имеет смысл: шапка уже уехала. */
export const SHOW_AFTER_PX = 400;

export function shouldShowBackToTop(
  scrollY: number,
  threshold = SHOW_AFTER_PX,
): boolean {
  return scrollY >= threshold;
}

/**
 * `scroll-padding-top` на <html> нужен якорям, чтобы контент не прятался
 * под липкой строкой. Но `scrollTo({ top: 0, behavior: "smooth" })` в Blink
 * тоже его учитывает и останавливается на ~высоте шапки, не доезжая до
 * самого начала страницы. На время прыжка «наверх» паддинг снимаем.
 */
export function withoutScrollPadding(style: CSSStyleDeclaration): () => void {
  const previous = style.getPropertyValue("scroll-padding-top");
  style.setProperty("scroll-padding-top", "0px");

  return () => {
    if (previous === "") {
      style.removeProperty("scroll-padding-top");
    } else {
      style.setProperty("scroll-padding-top", previous);
    }
  };
}

export function scrollToTop(
  scroll: (options: ScrollToOptions) => void,
  reducedMotion: boolean,
): void {
  scroll({ top: 0, left: 0, behavior: reducedMotion ? "auto" : "smooth" });
}

export default function BackToTop({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      setVisible(shouldShowBackToTop(window.scrollY));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });

    return () => window.removeEventListener("scroll", update);
  }, []);

  const goToTop = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.blur();

    const restore = withoutScrollPadding(document.documentElement.style);
    let restored = false;
    const finish = () => {
      if (restored) {
        return;
      }
      restored = true;
      restore();
      window.removeEventListener("scrollend", finish);
    };

    scrollToTop(
      (options) => window.scrollTo(options),
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );

    window.addEventListener("scrollend", finish);
    window.setTimeout(finish, 1000);
  };

  return (
    <button
      type="button"
      className="back-to-top"
      aria-label={label}
      title={label}
      hidden={!visible}
      onClick={goToTop}
    >
      <ChevronUp size={22} strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
}
