// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { observeHeaderCompact } from "@/components/public/header/CompactOnScroll";

type ObserverRecord = {
  callback: IntersectionObserverCallback;
  observed: Element[];
  disconnect: ReturnType<typeof vi.fn>;
};

function mockIntersectionObserver(): ObserverRecord[] {
  const records: ObserverRecord[] = [];

  class FakeIntersectionObserver {
    readonly callback: IntersectionObserverCallback;
    readonly observed: Element[] = [];
    readonly disconnect = vi.fn();

    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
      records.push({
        callback,
        observed: this.observed,
        disconnect: this.disconnect,
      });
    }

    observe(element: Element) {
      this.observed.push(element);
    }

    unobserve() {}
  }

  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);

  return records;
}

function entry(isIntersecting: boolean): IntersectionObserverEntry {
  return { isIntersecting } as IntersectionObserverEntry;
}

describe("observeHeaderCompact", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("marks the header compact when the sentinel leaves the viewport", () => {
    const observers = mockIntersectionObserver();
    const header = document.createElement("header");
    const sentinel = document.createElement("span");

    observeHeaderCompact(header, sentinel);

    expect(observers).toHaveLength(1);
    expect(observers[0].observed).toEqual([sentinel]);

    observers[0].callback([entry(false)], {} as IntersectionObserver);
    expect(header.hasAttribute("data-compact")).toBe(true);

    observers[0].callback([entry(true)], {} as IntersectionObserver);
    expect(header.hasAttribute("data-compact")).toBe(false);
  });

  it("disconnects the observer on cleanup", () => {
    const observers = mockIntersectionObserver();
    const stop = observeHeaderCompact(
      document.createElement("header"),
      document.createElement("span"),
    );

    stop();

    expect(observers[0].disconnect).toHaveBeenCalledOnce();
  });

  it("does nothing when IntersectionObserver is missing", () => {
    vi.stubGlobal("IntersectionObserver", undefined);

    const header = document.createElement("header");
    const stop = observeHeaderCompact(header, document.createElement("span"));

    expect(header.hasAttribute("data-compact")).toBe(false);
    expect(() => stop()).not.toThrow();
  });
});
