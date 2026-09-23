import { describe, expect, it } from "vitest";
import { situationTime } from "@/lib/situation-time";

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
