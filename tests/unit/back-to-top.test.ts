import { describe, expect, it, vi } from "vitest";
import {
  SHOW_AFTER_PX,
  scrollToTop,
  shouldShowBackToTop,
  withoutScrollPadding,
} from "@/components/public/BackToTop";

describe("shouldShowBackToTop", () => {
  it("hides the control at the top of the page", () => {
    expect(shouldShowBackToTop(0)).toBe(false);
    expect(shouldShowBackToTop(SHOW_AFTER_PX - 1)).toBe(false);
  });

  it("shows the control after the page has been scrolled", () => {
    expect(shouldShowBackToTop(SHOW_AFTER_PX)).toBe(true);
    expect(shouldShowBackToTop(1200)).toBe(true);
  });
});

describe("scrollToTop", () => {
  it("uses a smooth jump unless the user prefers reduced motion", () => {
    const scroll = vi.fn();

    scrollToTop(scroll, false);
    expect(scroll).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: "smooth",
    });

    scrollToTop(scroll, true);
    expect(scroll).toHaveBeenLastCalledWith({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  });
});

describe("withoutScrollPadding", () => {
  it("clears scroll-padding-top and restores the previous value", () => {
    // Тип объявлен явно: из-за приведения `as unknown as` в конце литерала
    // TypeScript выводил `this` как `{}`, и обращения к `this.stored` не
    // компилировались.
    const stub: {
      stored: string;
      getPropertyValue(name: string): string;
      setProperty(name: string, value: string): void;
      removeProperty(name: string): void;
    } = {
      stored: "176px",
      getPropertyValue(name: string) {
        return name === "scroll-padding-top" ? this.stored : "";
      },
      setProperty(name: string, value: string) {
        if (name === "scroll-padding-top") {
          this.stored = value;
        }
      },
      removeProperty(name: string) {
        if (name === "scroll-padding-top") {
          this.stored = "";
        }
      },
    };

    const style = stub as unknown as CSSStyleDeclaration & { stored: string };

    const restore = withoutScrollPadding(style);

    expect(style.stored).toBe("0px");
    restore();
    expect(style.stored).toBe("176px");
  });
});
