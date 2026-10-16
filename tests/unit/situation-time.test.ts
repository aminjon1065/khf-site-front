import { describe, expect, it } from "vitest";
import {
  DEFAULT_STALE_AFTER_MINUTES,
  isOutdated,
  situationStaleAfter,
  situationTime,
} from "@/lib/situation-time";

// Время актуальности обстановки (CMS `alerts.updated_at`): всегда в поясе
// Душанбе с явной пометкой, дата — только если сведения не сегодняшние.

const NOW = new Date("2026-09-16T10:05:00+05:00");

describe("situationTime", () => {
  it("shows only the time for today's state", () => {
    expect(situationTime("2026-09-16T09:42:00+05:00", "ru", NOW)).toEqual({
      dateTime: "2026-09-16T09:42:00+05:00",
      text: "09:42 (UTC+5)",
    });
  });

  it("adds the date when the state is from another day", () => {
    expect(situationTime("2026-09-15T23:50:00+05:00", "ru", NOW)?.text).toBe(
      "15 сентября, 23:50 (UTC+5)",
    );
  });

  it("keeps Dushanbe time for a value sent with another offset", () => {
    expect(situationTime("2026-09-16T04:42:00Z", "en", NOW)?.text).toBe(
      "09:42 (UTC+5)",
    );
  });

  it("shows nothing rather than an invented time", () => {
    expect(situationTime(null, "ru", NOW)).toBeNull();
    expect(situationTime("not a date", "tj", NOW)).toBeNull();
  });
});

// Устарели ли сведения — на момент чтения страницы; срок выбирает
// администратор CMS (по умолчанию сутки).
describe("isOutdated", () => {
  const at = "2026-09-15T10:00:00+05:00";
  const minutesLater = (minutes: number) =>
    new Date(at).getTime() + minutes * 60_000;

  it("keeps data within the chosen age", () => {
    expect(isOutdated(at, 1440, minutesLater(1440))).toBe(false);
    expect(isOutdated(at, 60, minutesLater(30))).toBe(false);
  });

  it("marks data older than the chosen age", () => {
    expect(isOutdated(at, 1440, minutesLater(1441))).toBe(true);
    expect(isOutdated(at, 60, minutesLater(61))).toBe(true);
  });

  it("never marks a time it cannot read", () => {
    expect(isOutdated(null, 60, minutesLater(1000))).toBe(false);
    expect(isOutdated("not a date", 60, minutesLater(1000))).toBe(false);
  });
});

describe("situationStaleAfter", () => {
  it("uses the administrator's window for a live summary", () => {
    expect(situationStaleAfter(90)).toBe(90);
    expect(situationStaleAfter(null)).toBe(DEFAULT_STALE_AFTER_MINUTES);
  });

  it("warns at once when the summary came from the last good copy", () => {
    // CMS не отвечает: время обстановки прежнее, а обновить его нечем.
    expect(situationStaleAfter(1440, "2026-10-16T10:00:00.000Z")).toBe(0);
    expect(
      isOutdated("2026-10-16T09:05:00+05:00", situationStaleAfter(1440, "x"), Date.parse("2026-10-16T09:06:00+05:00")),
    ).toBe(true);
  });
});
