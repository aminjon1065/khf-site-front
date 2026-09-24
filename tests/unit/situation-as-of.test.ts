// @vitest-environment jsdom
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SituationAsOf from "@/components/public/SituationAsOf";
import { ru } from "@/lib/i18n/dictionaries/ru";

// «Обстановка на …» и предупреждение, если сведения старше срока, который
// выбрал администратор CMS. Решает браузер: страницу отдаёт ISR-кэш.

const NOW = new Date("2026-09-24T12:00:00+05:00");

function situation(dateTime: string, staleAfterMinutes: number) {
  return createElement(SituationAsOf, {
    label: ru.common.situation.asOf,
    dateTime,
    text: "11:58 (UTC+5)",
    staleAfterMinutes,
    outdatedText: ru.common.situation.outdated,
  });
}

describe("SituationAsOf", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("states the time without a warning while the data is fresh", () => {
    render(situation("2026-09-24T11:58:00+05:00", 1440));

    expect(screen.getByText("11:58 (UTC+5)").getAttribute("datetime")).toBe(
      "2026-09-24T11:58:00+05:00",
    );
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("warns when the data is older than a day", () => {
    render(situation("2026-09-23T11:58:00+05:00", 1440));

    expect(screen.getByRole("status").textContent).toBe(
      ru.common.situation.outdated,
    );
  });

  it("follows the age the administrator chose", () => {
    render(situation("2026-09-24T10:30:00+05:00", 60));

    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("leaves the warning to the browser: the server can't know when the page is read", () => {
    const html = renderToString(situation("2026-07-27T11:58:00+05:00", 1440));

    expect(html).toContain("11:58 (UTC+5)");
    expect(html).not.toContain(ru.common.situation.outdated);
  });
});
