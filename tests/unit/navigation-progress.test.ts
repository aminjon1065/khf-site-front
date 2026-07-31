import { describe, expect, it } from "vitest";
import {
  onNavigationStart,
  startNavigationProgress,
} from "@/lib/navigation-progress";

describe("шина индикатора перехода", () => {
  it("оповещает всех подписчиков о старте перехода", () => {
    let first = 0;
    let second = 0;

    const offFirst = onNavigationStart(() => (first += 1));
    const offSecond = onNavigationStart(() => (second += 1));

    startNavigationProgress();

    expect(first).toBe(1);
    expect(second).toBe(1);

    offFirst();
    offSecond();
  });

  it("после отписки слушатель больше не вызывается", () => {
    let calls = 0;
    const off = onNavigationStart(() => (calls += 1));

    startNavigationProgress();
    off();
    startNavigationProgress();

    expect(calls).toBe(1);
  });

  it("не падает, когда подписчиков нет", () => {
    expect(() => startNavigationProgress()).not.toThrow();
  });
});
